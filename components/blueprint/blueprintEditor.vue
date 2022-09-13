<template>
    <div class="relative w-full h-full">
        <div class="bg-black/80 absolute w-full bottom-36 top-0 left-0 right-0 z-50 m-auto text-center" v-if="!loading">
            <div class=" align-middle content-between inline-block bg-white p-4 rounded-lg mt-16">
                <div class="flex">
                    <div class="mr-2">
                        <div class="spinner"></div>
                    </div>
                    <div>{{ $t('Loading...') }}</div>                    
                </div>
            </div>
        </div>

        <div class="bg-neutral-900 z-50 flex justify-between flex-row-reverse p-2 h-12 select-none">
            <div class="flex">
                <button class="text-white bg-blue-800 hover:bg-blue-900 px-2 py-1 flex align-middle mr-2" @click="resertPosition">
                    <div>
                        {{ $t("Reset") }}
                    </div>                   
                </button>

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
            class="grid-background select-none overflow-scroll absolute left-0 right-0 bottom-36 top-12" 
            @mousemove="handleDrag" 
            @mouseup="handleDragEnd" 
            @scroll="refreshLines"
            ref="editor"
        >
            <div class="w-4 h-4 absolute" :style="{ top: `${mouseHandler.top}px`, left: `${mouseHandler.left}px`}" ref="mousePointer"></div>

            <div class="grid-contents block" style="width: 5000px; height: 5000px" ref="contents"  @mousedown.left="move">
                <div                     
                    class="relative block h-screen w-screen bg-white/50" 
                    @contextmenu.prevent="contextmenu" 
                    @mousedown.left="closeContextmenu"
                >
                    <div :style="{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }" ref="contentsTransform">
                        <div 
                            v-for="(item, keyItem) in items" 
                            :key="keyItem"
                            :style="{ top: `${item.position.top}px`, left: `${item.position.left}px` }"
                            class="rounded-xl absolute border-black border-2 shadow-black shadow-md bg-neutral-900 bg-opacity-80 hover:border-neutral-800 z-40"
                            @mousedown.left.stop="closeContextmenu"
                        >
                            <div 
                                :class="['p-2 rounded-t-xl border-b border-black text-gray-50 font-bold cursor-move flex justify-between']"
                                :style="{backgroundColor: (item.metadata.headerColor) ? item.metadata.headerColor : headerColor(item.metadata.type)}"
                                @mousedown.left.stop="handleDragStart(keyItem, $event)"
                                @dragstart="handleDragStart(keyItem, $event)"
                                @drop="handleDragEnd"
                                @mouseup="handleDragEnd"
                            >
                                <div class="mr-2">
                                    <font-awesome-icon :icon="(item.metadata.headerIcon) ? item.metadata.headerIcon : headerIcon(item.metadata.type)"/>
                                </div>

                                <span>{{ item.metadata.namespace }}</span>    

                                <div class="flex" @mousedown.left.stop="" :collaped="item.collaped">
                                    <div class="mr-2 cursor-pointer px-2" @click.stop="item.collaped = !item.collaped">
                                        <font-awesome-icon icon="fa-solid fa-caret-down" v-if="!item.collaped" />
                                        <font-awesome-icon icon="fa-solid fa-caret-up" v-if="item.collaped" />
                                    </div>
                                    
                                    <div class="mr-2 cursor-pointer" @click.stop="removeComponent(keyItem)">
                                        <font-awesome-icon icon="fa-solid fa-xmark"/>
                                    </div>
                                </div>
                            </div>
                            <div class="p-2 flex text-white font-medium">
                                <div class="content-start items-start">
                                    <div class="flex" v-for="(input, key) in item.inputs" :key="key" :id="`${input.id}-${keyItem}`" ref="inputs">
                                        <blueprint-component-input 
                                            :keyItem="keyItem" 
                                            :input="input" 
                                            :item="item" 
                                            :isInput="true" 
                                            :collaped="item.collaped"
                                            @onPointer="onPointer" 
                                            @onPointerLeave="onPointerLeave"
                                            @openObjectEdit="openObjectEdit"
                                        ></blueprint-component-input>
                                    </div>

                                    <div v-if="!item.collaped">
                                        <div class="flex" v-for="(input, key) in item.publicVars" :key="key" :id="`${input.id}-${keyItem}`" ref="inputs">
                                            <blueprint-component-input 
                                                :keyItem="keyItem" 
                                                :input="input" 
                                                :item="item" 
                                                :isInput="false" 
                                                :collaped="item.collaped"
                                                @changeDefault="changeDefault" 
                                                @onPointer="onPointer" 
                                                @onPointerLeave="onPointerLeave"
                                                @openObjectEdit="openObjectEdit"
                                            ></blueprint-component-input>
                                        </div>
                                    </div>
                                </div>

                                <div class="content-end items-end text-right ml-4">
                                    <div class="text-right w-full items-end h-6" v-for="(output, key) in item.outputs" :key="key">
                                        <div class="flex flex-row-reverse" :id="`${output.id}-${keyItem}`" ref="inputs">                       
                                            <div :style="{color: (item.metadata[output?.type.replace(/\./, '_')]) ? item.metadata[output?.type.replace(/\./, '_')].color : getColorByType(output?.type)}" :title="`Type: ${output?.type}`" >
                                                <font-awesome-icon                         
                                                    icon="fa-solid fa-square"   
                                                    @dragstart="createLine($event, item, output, keyItem, `${output.id}-${keyItem}`)" 
                                                    @mousedown="createLine($event, item, output, keyItem, `${output.id}-${keyItem}`)"
                                                    @mouseenter="onPointer($event, item, output, keyItem, `${output.id}-${keyItem}`)"
                                                    @mouseleave="onPointerLeave"
                                                />
                                            </div>

                                            <div>
                                                <span class="px-2">{{ output.name }}</span>
                                            </div>  
                                        </div>
                                    </div>  
                                    
                                    <div class="text-right" v-for="(publicVar, key) in item.publicVars" :key="key">
                                        <div  v-if="publicVar.type == 'object' && publicVar.default && publicVar.default.multi">
                                            <div class="w-full items-end"> 
                                                <div v-for="(item, key) in publicVar.value" :key="key" class="flex flex-row-reverse h-6"> 
                                                    <div :style="{color: getColorByType('Any')}" :id="`${publicVar.id}-${keyItem}-${key}`" ref="inputs">
                                                        <font-awesome-icon                         
                                                            icon="fa-solid fa-square"
                                                            @dragstart="createLine($event, item, publicVar, keyItem, `${publicVar.id}-${keyItem}-${key}`)" 
                                                            @mousedown="createLine($event, item, publicVar, keyItem, `${publicVar.id}-${keyItem}-${key}`)"
                                                            @mouseenter="onPointer($event, item, publicVar, keyItem, `${publicVar.id}-${keyItem}-${key}`)"
                                                            @mouseleave="onPointerLeave"
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
                            :scrollOffset="scrollOffset"
                            :transformPosition="position"
                            ref="lines" 
                            @clickLine="clickLine"
                        ></blueprint-line-connector>

                        <blueprint-line-connector 
                            v-if="tmpLine" 
                            :line="tmpLine" 
                            :offset="linesOffset" 
                            :scale="scale"
                            :scrollOffset="scrollOffset"
                            :transformPosition="position"
                            ref="tmpLine"
                        ></blueprint-line-connector>
                    </div>
                </div>
            </div>

            <blueprint-navbar ref="navbar" @addComponent="addComponent" @onPointer="onPointer" />

            <div class="fixed h-11 bg-black/50 bottom-16 right-6 rounded-md flex">
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

            <blueprint-object-edit 
                class="fixed top-0 left-0 w-full h-full z-50"
                v-if="objectEdit.open"
                :component="objectEdit.item" 
                :fields="objectEdit.input.default" 
                :values="objectEdit.input.value"
                @save="(value) => { 
                    $emit('changeDefault', value, objectEdit.input, 'object')
                    objectEdit.input.value = value; 
                    objectEdit.open = false; 
                }"
                @close="objectEdit.open = false" 
            />
        </div>
    </div>
</template>

<style scoped>
.spinner {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3.8px solid;
    border-color: rgba(219, 220, 239, 0.49);
    border-right-color: #d6d6d6;
    animation: spinner-d3wgkg 1s infinite linear;
}

@keyframes spinner-d3wgkg {
    to {
        transform: rotate(1turn);
    }
}

.grid-background{
    background-color: #434343;
    background-image:linear-gradient(#434343, #282828);
}

.grid-contents{
    display: block;
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
            loading: false,
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
            scrollOffset: { x: 0, y: 0 },
            scale: 1,
            moveStartPosition: null,
            moveEvent: false,
            objectEdit: { open: false }
        }
    },

    async mounted(){
        if(this.tab.content){
            const metadata = JSON.parse(this.tab.content);

            for(let key in metadata)
                this[key] = metadata[key];
        }   

        //Resize
        this.ro = new ResizeObserver(() => this.refreshLines());
        this.ro.observe(this.$refs.editor);
        this.linesOffset = this.$refs.editor.getBoundingClientRect();

        //Scroll
        this.scrollOffset = { x: this.$refs.editor.scrollLeft, y: this.$refs.editor.scrollTop };
        this.$refs.editor.addEventListener('scroll', (event) => {
            this.scrollOffset = { x: this.$refs.editor.scrollLeft, y: this.$refs.editor.scrollTop };
            this.saveState();
        });

        //Load blueprints                
        await this.loadBlueprints();
        const cacheBlueprints = localStorage.getItem(`blueprint-${this.tab.name.replace(/\./, "-")}`);

        if(cacheBlueprints){
            const cacheParse = JSON.parse(cacheBlueprints);
        
            for(const key in cacheParse.items){
                const item = cacheParse.items[key];

                for(const blueprint of this.blueprits){
                    if((blueprint.namespace === item.namespace)){
                        this.items[key] = { ...{ collaped: false }, ...blueprint, ...item };
                        this.items[key].metadata = blueprint.metadata
                    }
                }
            }

            this.connections = cacheParse.connections;

            if(cacheParse.scale)
                this.scale = cacheParse.scale;

            if(cacheParse.position)
                this.position = cacheParse.position;

            if(cacheParse.scrollOffset){
                this.$refs.editor.scrollLeft = cacheParse.scrollOffset.x;
                this.$refs.editor.scrollTop = cacheParse.scrollOffset.y;
                this.scrollOffset = cacheParse.scrollOffset;
            }   
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
        this.loading = true;
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
                        if(item.getAttribute("id") == connection.from.input)
                            input = item;
                        
                        if(item.getAttribute("id") == connection.to.input)
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
        
        move(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();

            this.moveStartPosition = { 
                clientX: clientX + this.scrollOffset.x - editorOffset.x - 10, 
                clientY: clientY + this.scrollOffset.y - editorOffset.y - 10,
                positionX: this.position.x,
                positionY: this.position.y 
            };

            this.moveEvent = true;
        },

        handleDragStart(key, event){
            this.dragElement = event.target;
            this.dragIndex = key;
            this.startDrag = true;
        },

        handleDrag(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();
            const contentsTransformOffset = this.$refs.contentsTransform.getBoundingClientRect();
            
            this.mouseHandler.top = clientY + this.scrollOffset.y - editorOffset.y - 10;
            this.mouseHandler.left = clientX + this.scrollOffset.x - editorOffset.x - 10;                
            
            if(this.startDrag){                
                const element = this.dragElement.getBoundingClientRect();
                this.items[this.dragIndex].position.top = (clientY + this.scrollOffset.y - this.position.y - editorOffset.y) - (element.height / 2);
                this.items[this.dragIndex].position.left =  (clientX + this.scrollOffset.x - this.position.x - editorOffset.x) - (element.width / 2);
                this.refreshLines();                
            }

            if(this.moveEvent){      
                const { clientX, clientY, positionX, positionY } = this.moveStartPosition;
                const diffY = this.mouseHandler.top - clientY;
                const diffX = this.mouseHandler.left - clientX;       
                this.position = { x: positionX + diffX, y: positionY + diffY };
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
                    if(this.createLineElem.id !== this.tmpComponentHover.id){
                        this.connections.push({
                            from: { component: this.createLineElem.item.namespace, input: this.createLineElem.id },
                            to: { component: this.tmpComponentHover.item.namespace, input: this.tmpComponentHover.id }
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

            if(this.moveEvent)
                this.moveEvent = false;

            this.saveState(true);
        },

        createLine(event, item, input, key, id){
            if(!this.oncreateLine){
                this.onCreateLine = true;
                this.createLineElem = { el: event.target, item, input, id, key };
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
                },
                collaped: false
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

        onPointer(event, item, input, key, id){
            this.tmpComponentHover = { el: event.target, item, input, key, id };
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
                connections: this.connections,
                scale: this.scale,
                position: this.position,
                scrollOffset: this.scrollOffset
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
            this.saveState();
        },  

        scaleIn(){
            this.scale += 0.1;
            this.$forceUpdate();
            this.saveState();
        },  

        scaleOut(){
            this.scale -= 0.1;
            this.$forceUpdate();
            this.saveState();
        }, 

        resertPosition(){
            this.position = { x: 0, y: 0 };
            this.scale = 1;
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

        openObjectEdit(item, input){
            this.objectEdit = { item, input, open: true };
        },

        saveState(emit = false){
            localStorage.setItem(`blueprint-${this.tab.name.replace(/\./, "-")}`, JSON.stringify({
                items: this.items,
                connections: this.connections,
                scale: this.scale,
                position: this.position,
                scrollOffset: this.scrollOffset
            }));

            if(emit)
                this.$emit("changeState", this.getValue());
        }
    }
}
</script>