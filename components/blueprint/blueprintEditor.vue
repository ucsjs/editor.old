<template>
    <div class="relative w-full h-full">
        <div class="bg-neutral-900 z-50 flex justify-between flex-row-reverse p-2 h-12 select-none">
            <div class="flex">
                <button class="text-white bg-red-800 hover:bg-red-900 px-2 py-1 flex align-middle">
                    <div>
                        {{ $t("Run") }}
                    </div>
                    
                    <div class="ml-2">
                        <font-awesome-icon icon="fa-solid fa-play"/>
                    </div>                    
                </button>
            </div>  
        </div>

        <div 
            class="grid-background select-none overflow-hidden absolute left-0 right-0 bottom-12 top-12" 
            @mousemove="handleDrag" 
            @mouseup="handleDragEnd" 
            @scroll="refreshLines"
            ref="editor"
        >
            <div class="w-4 h-4 absolute" :style="{ top: `${mouseHandler.top}px`, left: `${mouseHandler.left}px`}" ref="mousePointer"></div>

            <div class="grid-contents">
                <div 
                    class="w-full relative block h-full" 
                    :style="{transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`}"
                    @contextmenu.prevent="contextmenu" 
                    @mousedown.left="closeContextmenu"
                >
                    <div 
                        v-for="(item, keyItem) in items" 
                        :key="keyItem"
                        :style="{ top: `${item.position.top}px`, left: `${item.position.left}px`}"
                        class="min-w-[200px] rounded-xl absolute border-black border-2 shadow-black shadow-md bg-neutral-900 bg-opacity-80 hover:border-green-400 z-40"
                        @mousedown.left="closeContextmenu"
                    >
                        <div 
                            :class="['p-2 rounded-t-xl border-b border-black text-gray-50 font-bold cursor-move flex justify-between']"
                            :style="{backgroundColor: (item.metadata.headerColor) ? item.metadata.headerColor : headerColor(item.metadata.type)}"
                            @mousedown.left="handleDragStart(keyItem, $event)"
                            @dragstart="handleDragStart(keyItem, $event)"
                            @drop="handleDragEnd"
                            @mouseup="handleDragEnd"
                        >
                            <div class="mr-2">
                                <font-awesome-icon :icon="(item.metadata.headerIcon) ? item.metadata.headerIcon : headerIcon(item.metadata.type)"/>
                            </div>

                            <span>{{ item.metadata.namespace }}</span>    
                            
                            <div class="mr-2 cursor-pointer" @click.prevent="removeComponent(keyItem)">
                                <font-awesome-icon icon="fa-solid fa-xmark"/>
                            </div>
                        </div>
                        <div class="p-2 flex text-white font-medium">
                            <div class="content-start items-start">
                                <div class="flex" v-for="(input, key) in item.inputs" :key="key" :id="`${input.id}-${keyItem}`" ref="inputs">
                                    <blueprint-component-input :keyItem="keyItem" :input="input" :item="item" :isInput="true" @onPointer="onPointer" @onPointerLeave="onPointerLeave"></blueprint-component-input>
                                </div>

                                <div class="flex" v-for="(input, key) in item.publicVars" :key="key" :id="`${input.id}-${keyItem}`" ref="inputs">
                                    <blueprint-component-input :keyItem="keyItem" :input="input" :item="item" :isInput="false" @changeDefault="changeDefault" @onPointer="onPointer" @onPointerLeave="onPointerLeave"></blueprint-component-input>
                                </div>
                            </div>

                            <div class="content-end items-end text-right ml-4">
                                <div class="text-right w-full items-end" v-for="(output, key) in item.outputs" :key="key">
                                    <div class="flex flex-row-reverse">                                    
                                        <div :style="{color: getColorByType(output?.type)}" :title="`Type: ${output?.type}`" :id="`${output.id}-${keyItem}`" ref="inputs">
                                            <font-awesome-icon                         
                                                icon="fa-solid fa-square"   
                                                @dragstart="createLine($event, item, output, keyItem)" 
                                                @mousedown="createLine($event, item, output, keyItem)"
                                                @mouseenter="onPointer($event, item, output, keyItem)"
                                                @mouseleave="onPointerLeave"
                                            />
                                        </div>

                                        <div>
                                            <span class="px-2">{{ output.name }}</span>
                                        </div>
                                    </div>
                                </div>  
                                
                                <div class="text-right" v-for="(publicVar, key) in item.publicVars" :key="key">
                                    <div v-if="publicVar.type == 'object' && publicVar.default && publicVar.default.multi" class="">
                                        <div class=" w-full items-end"> 
                                            <div v-for="(item, key) in publicVar.value" :key="key" class="flex flex-row-reverse"> 
                                                <div :style="{color: getColorByType('Any')}" ref="inputs">
                                                    <font-awesome-icon                         
                                                        icon="fa-solid fa-square"
                                                    />
                                                </div>

                                                <div>
                                                    <span class="px-2">{{ (item.method) ? item.method : 'GET' }} [{{ item.url }}]</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                
                    </div>

                    <blueprint-line-connector 
                        v-for="(line, key) in lines" 
                        :selected="lineSelected == key" 
                        :key="key" 
                        :keyref="line.connectionKey" 
                        :line="line" 
                        :offset="linesOffset"
                        :scale="scale" 
                        ref="lines" 
                        @clickLine="clickLine"
                    ></blueprint-line-connector>

                    <blueprint-line-connector 
                        v-if="tmpLine" 
                        :line="tmpLine" 
                        :offset="linesOffset" 
                        :scale="scale"
                        ref="tmpLine"
                    ></blueprint-line-connector>
                </div>
            </div>

            <blueprint-navbar ref="navbar" @addComponent="addComponent" @onPointer="onPointer" />

            <div class="absolute h-11 bg-black/50 bottom-3 right-3 rounded-md flex">
                <Tooltip :tooltipText="$t('Zoom in')" position="top" class="flex" @click="scaleIn">
                    <button class="text-white px-3">
                        <font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" />
                    </button>
                </Tooltip>

                <Tooltip :tooltipText="$t('Reset')" position="top" class="flex" @click="scaleResert">
                    <button class="text-white px-3">
                        <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
                    </button>
                </Tooltip>

                <Tooltip :tooltipText="$t('Zoom out')" position="top" class="flex" @click="scaleOut">
                    <button class="text-white px-3">
                        <font-awesome-icon icon="fa-solid fa-magnifying-glass-minus" />
                    </button>
                </Tooltip>
            </div>
        </div>
    </div>
</template>

<style scoped>
.grid-background{
    background-color: #434343;
    background-image:linear-gradient(#434343, #282828);
}

.grid-contents{
    display: flex;
    position: relative;
    overflow: hidden;
    touch-action: none;
    outline: 0;
    background-color: transparent;
    background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent);
    height:100%;
    background-size:50px 50px;
}

* {
    scrollbar-width: auto;
    scrollbar-color: #262626 #000000;
}

*::-webkit-scrollbar {
    width: 16px;
}

*::-webkit-scrollbar-track {
    background: #000000;
}

*::-webkit-scrollbar-thumb {
    background-color: #262626;
    border-radius: 0px;
    border: 3px solid #262626;
}
</style>

<script>
import globalMixin from "@/mixins/globalMixin";

export default{
    mixins: [globalMixin],

    setup(){
        const elements = ref({});
        return { elements }; 
    },

    props:{
        tab: {
            type: Object,
            required: true
        }
    },

    data(){
        return {
            dragIndex: 0,
            dragElement: null,
            startDrag: false,
            onCreateLine: false,
            createLineElem: null,
            tmpLine: null,
            tmpComponentHover: null,
            lineOptions: {
                color: 'white',
                size: 2,
                startPlug: 'behind',
                endPlug: 'arrow3',
                startSocketGravity: 100,
                endSocketGravity: 100,
                dash: { animation: true }
            },
            newMenu: { 
                opened: true,
                position: { top: 200, left: 700 } 
            },
            mouseHandler: { top: 200, left: 200 }, 
            items:[],
            blueprits: [],
            bluepritsCategories: {},
            connections: [],
            inputs: {},
            lines: [],
            lineUpdateCounter: 0,
            linesOffset: null,
            lineSelected: -1,
            ro: null,
            position: { x: 0, y: 0 },
            scale: 1,
        }
    },

    async mounted(){
        if(this.tab.content){
            const metadata = JSON.parse(this.tab.content);

            for(let key in metadata)
                this[key] = metadata[key];
        }   

        this.ro = new ResizeObserver(() => this.refreshLines());
        this.ro.observe(this.$refs.editor);
        this.linesOffset = this.$refs.editor.getBoundingClientRect();
                
        await this.loadBlueprints();
        const cacheBlueprints = localStorage.getItem(`blueprint-${this.tab.name.replace(/\./, "-")}`);

        if(cacheBlueprints){
            const cacheParse = JSON.parse(cacheBlueprints);
        
            for(const key in cacheParse.items){
                const item = cacheParse.items[key];

                for(const blueprint of this.blueprits){
                    if((blueprint.namespace === item.namespace)){
                        this.items[key] = { ...item, ...blueprint };
                    }
                }
            }
            
            this.connections = cacheParse.connections;
        }

        const useHotkey = await import('vue3-hotkey').then(m => m?.default);
        const _this = this;

        const hotkeys = ref([{
            keys: ["delete"],
            preventDefault: true,
            async handler(keys) {
                if(_this.lineSelected != -1){
                    _this.connections.splice(_this.lineSelected, 1);
                    _this.lines.splice(_this.lineSelected, 1);
                    _this.lineSelected = -1;                    
                    _this.saveState(true);
                }
            }
        }]);

        useHotkey(hotkeys.value);

        setInterval(() => {
            this.refreshLines();

            if(this.$refs.editor)
                this.linesOffset = this.$refs.editor.getBoundingClientRect();

            this.saveState();
        }, 100);

        this.$forceUpdate();
    },

    beforeDestroy () {
        this.ro.unobserve(this.$refs.editor)
    },

    updated(){
        if(this.lineUpdateCounter == 0 || this.lineUpdateCounter % 50 == 0){
            if(this.lineUpdateCounter == 0)
                this.lineUpdateCounter++;
            else
                this.lineUpdateCounter = 0;

            this.createLines(); 
        }
        else{
            this.lineUpdateCounter++;
        }
    },

    methods: {
        async loadBlueprints(){
            this.blueprits = await useApi(`blueprints`, { method: "GET" });
            this.sortBlueprintsCategories();
        },

        createLines(){
            if(this.lines.length > 0)
                this.lines = [];

            this.$forceUpdate();
                        
            for(let key in this.connections){
                const connection = this.connections[key];
                let input = null;
                let output = null;

                if(this.$refs.inputs){
                    for(let item of this.$refs.inputs){
                        if(item.getAttribute("id") === connection.from.input)
                            input = item;
                        
                        if(item.getAttribute("id") === connection.to.input)
                            output = item;
                    }
                }                

                if(input && output){
                    this.lines.push({ from: input, to: output, connectionKey: key });
                }                    
                else{
                    this.connections.splice(key, 1);
                    this.lines.splice(key, 1);
                }   
            }
        },  

        refreshLines(){
            if(this.tmpLine !== null && this.tmpLine != undefined)
                this.$refs.tmpLine.draw();

            if(this.$refs.lines){
                for(let line of this.$refs.lines)
                    line.draw();
            }            
        },

        sortBlueprintsCategories(){
            for(let item of this.blueprits){
                if(!this.bluepritsCategories[item.metadata.type])
                    this.bluepritsCategories[item.metadata.type] = [];
                
                this.bluepritsCategories[item.metadata.type].push(item);
            }
        },          

        handleDragStart(key, event){
            this.dragElement = event.target;
            this.dragIndex = key;
            this.startDrag = true;
        },

        handleDrag(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();
            
            this.mouseHandler.top = clientY - editorOffset.top - 10;
            this.mouseHandler.left = clientX - editorOffset.left - 10;                
            
            if(this.startDrag){                
                const element = this.dragElement.getBoundingClientRect();
                this.items[this.dragIndex].position.top = (clientY - editorOffset.top) - (element.height / 2);
                this.items[this.dragIndex].position.left =  (clientX - editorOffset.left) - (element.width / 2);
                this.refreshLines();                
            }

            if(this.tmpLine !== null && this.tmpLine != undefined)
                this.$refs.tmpLine.draw();
        },

        handleDragEnd(event){
            this.startDrag = false;

            if(this.onCreateLine){
                this.onCreateLine = false;
                this.tmpLine = null;

                if(this.tmpComponentHover){
                    if(this.tmpComponentHover.input.id !== this.createLineElem.input.id){
                        this.connections.push({
                            from: { component: this.createLineElem.item.namespace, input: `${this.createLineElem.input.id}-${this.createLineElem.key}` },
                            to: { component: this.tmpComponentHover.item.namespace, input: `${this.tmpComponentHover.input.id}-${this.tmpComponentHover.key}` }
                        });

                        this.createLines(); 
                    }
                }
                else{
                    this.$refs.navbar.open(this.mouseHandler);

                    if(this.$refs.navbar.$el && this.createLineElem)
                        this.tmpLine = { from: this.createLineElem.el, to: this.$refs.navbar.$el }; 
                }                              
            }

            this.saveState(true);
        },

        createLine(event, item, input, key){
            if(!this.oncreateLine){
                this.onCreateLine = true;
                this.createLineElem = { el: event.target, item, input, key };
                this.tmpLine = { from: event.target, to: this.$refs.mousePointer };
            }
        },

        addComponent(item){
            if(this.tmpLine)
                this.tmpLine = null;
            
            this.items.push({ 
                ...item,
                position: { 
                    top: this.mouseHandler.top - 50, 
                    left: this.mouseHandler.left - 50 
                }
            });

            this.saveState(true);
        },

        removeComponent(key){
            for(let connection of this.connections){
                const indexInput = parseInt(connection.from.input.split("-")[1]);
                const indexOutput = parseInt(connection.to.input.split("-")[1]);

                if(key === indexInput || key === indexOutput){
                    this.connections.splice(key, 1);
                    this.lines.splice(key, 1);
                }
            }

            this.items.splice(key, 1);
            this.createLines(); 
            this.saveState(true);
        },

        onPointer(event, item, input, key){
            this.tmpComponentHover = { el: event.target, item, input, key };
        },

        onPointerLeave(){
            this.tmpComponentHover = null;
        },

        contextmenu(){
            if(this.tmpLine)
                this.tmpLine = null;
            
            this.$refs.navbar.open(this.mouseHandler);
        },

        closeContextmenu(){
            if(this.$refs.navbar.opened && this.tmpLine)
                this.tmpLine = null;
            
            this.lineSelected = -1;
            this.$refs.navbar.close();
        },

        getValue(){
            return {
                items: this.items,
                connections: this.connections
            };
        },

        resizeEditor(){
            console.log("resizeEditor");
        },

        clickLine(key){
            this.lineSelected = key;
            this.$forceUpdate();
        },  

        scaleResert(){
            this.scale = 1;
            this.$forceUpdate();
        },  

        scaleIn(){
            this.scale += 0.1;
            this.$forceUpdate();
        },  

        scaleOut(){
            this.scale -= 0.1;
            this.$forceUpdate();
        }, 

        changeDefault(value, input, type){
            switch(type){
                case "number":
                    value = parseFloat(value);
                    break;
                case "boolean":
                    value = value === "true";
                    break;
            }

            input.value = value;            
            this.saveState(true);
        },

        saveState(emit = false){
            localStorage.setItem(`blueprint-${this.tab.name.replace(/\./, "-")}`, JSON.stringify({
                items: this.items,
                connections: this.connections
            }));

            if(emit)
                this.$emit("changeState", this.getValue());
        }
    }
}
</script>