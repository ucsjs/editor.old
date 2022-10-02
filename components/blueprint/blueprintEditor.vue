<template>
    <div 
        class="absolute w-full h-full"
        @mousemove="handleDrag" 
    >
        <div class="bg-black/80 fixed h-full w-full z-50 m-auto text-center" style="z-index: 1000" v-if="loading">
            <div class="align-middle content-between inline-block bg-white text-black p-4 rounded-lg mt-56">
                <div class="flex">
                    <div class="mr-2">
                        <div class="spinner"></div>
                    </div>
                    <div>{{ $t('Loading...') }}</div>                    
                </div>
            </div>
        </div>

        <div 
            class="w-4 h-4 absolute" 
            :style="{ top: `${mouseHandlerFull.top}px`, left: `${mouseHandlerFull.left}px`}" 
            ref="mousePointerFull"
        ></div>
        
        <div class="flex flex-row h-full relative">
            <!-- Canvas -->
            <div 
                :style="{width: `calc(100% - ${(widthLeftbar)}px) !important`}"
                :class="[
                    (overCanvas) ? 'border-yellow-300' : 'border-transparent',
                    'grid-background select-none border overflow-scroll absolute right-0 top-0'
                ]" 
                style="bottom: 45px;"
                @mousemove="handleDrag" 
                @mouseup="handleDragEnd" 
                @scroll="refreshLines"
                ref="editor"
            >
                <div 
                    class="w-4 h-4 absolute" 
                    :style="{ top: `${mouseHandler.top}px`, left: `${mouseHandler.left}px`}" 
                    ref="mousePointer"
                ></div>

                <div 
                    class="grid-contents block" 
                    style="width: 5000px; height: 5000px" 
                    ref="contents"  
                    @click="selectComponent(null)"
                    @mouseenter="overCanvas = true"
                    @mouseleave="overCanvas = false"
                    @mousedown.left="move"
                >
                    <div                     
                        class="relative block w-full h-full" 
                        @contextmenu.prevent="contextmenu" 
                        @mousedown.left="closeContextmenu"
                    >
                        <div 
                            class="absolute z-40" 
                            :style="{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }" 
                            ref="contentsTransform"                            
                        >
                            <div 
                                v-for="(item, keyItem) in itemsShow" 
                                :key="keyItem"
                                :style="{ top: `${item.position.top}px`, left: `${item.position.left}px` }"
                                :class="[
                                    (selectedComponent?.componentKey === item?.componentKey) ? 'border-red-700 hover:border-red-800' : 'border-black hover:border-neutral-800',
                                    'rounded-xl absolute  border-2 shadow-neutral-800 shadow-md bg-neutral-900 bg-opacity-80  z-40'
                                ]"
                                @mousedown.left.stop="closeContextmenu"
                                @click.stop="selectComponent(item)"
                                @dblclick.left="openComponent(item)"
                            >
                                <div 
                                    :class="['p-1 rounded-t-lg border-b border-black text-gray-50 font-bold cursor-move flex min-w-[230px]']"
                                    :style="{backgroundColor: (item.metadata.headerColor) ? item.metadata.headerColor : headerColor(item.metadata.group)}"
                                    @mousedown.left.stop="handleDragStart(keyItem, $event)"
                                    @dragstart="handleDragStart(keyItem, $event)"
                                    @drop="handleDragEnd"
                                    @mouseup="handleDragEnd"
                                >
                                    <div class="flex flex-1">
                                        <div class="mr-2 ml-2 text-sm">
                                            <client-only v-if="!item.metadata.headerIcon?.includes('data:')">
                                                <font-awesome-icon :icon="(item.metadata.headerIcon) ? item.metadata.headerIcon : headerIcon(item.metadata.group)"/>
                                            </client-only>                                        
                                            <img v-else :src="item.metadata.headerIcon" class="w-4 h-4 mt-0.5"/>
                                        </div>

                                        <span class="text-sm">{{ uppercaseFirstLetter(item.metadata.namespace) }}</span>   
                                    </div> 

                                    <div class="flex text-sm" @mousedown.left.stop="" :collaped="item.collaped">
                                        <div class="ml-2 cursor-pointer px-2" @click.stop="toggleComponent(item)">
                                            <client-only>
                                                <Tooltip :tooltipText="$t('Expand')" position="top">
                                                    <font-awesome-icon icon="fa-solid fa-caret-down" v-if="item.collaped" />
                                                </Tooltip>

                                                <Tooltip :tooltipText="$t('Contract')" position="top">
                                                    <font-awesome-icon icon="fa-solid fa-caret-up" v-if="!item.collaped" />
                                                </Tooltip>
                                            </client-only>
                                        </div>

                                        <div class="mr-2 cursor-pointer" @click.stop="openComponent(item)">
                                            <client-only>
                                                <Tooltip :tooltipText="$t('Open')" position="top">
                                                    <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square"/>
                                                </Tooltip>
                                            </client-only>
                                        </div>

                                        <div class="mr-2 cursor-pointer" v-if="item.metadata?.help" @click.stop="openWindow(item.metadata?.help)">
                                            <client-only>
                                                <Tooltip :tooltipText="$t('Help')" position="top">
                                                    <font-awesome-icon icon="fa-solid fa-circle-question"/>
                                                </Tooltip>
                                            </client-only>
                                        </div>
                                        
                                        <div class="mr-2 cursor-pointer" @click.stop="removeComponent(keyItem)">
                                            <client-only>
                                                <Tooltip :tooltipText="$t('Delete')" position="top">
                                                    <font-awesome-icon icon="fa-solid fa-xmark"/>
                                                </Tooltip>
                                            </client-only>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="p-2 flex text-white font-medium">
                                    <div class="content-start items-start">
                                        <div class="flex" v-if="item.metadata?.trigger">
                                            <div class="flex flex-row py-1 h-8">
                                                <div 
                                                    class="text-sm"
                                                    :style="{ color: '#FF0000' }"  
                                                    title="Trigger"
                                                    :id="`${item.componentKey}-trigger`"
                                                    ref="inputs"
                                                >
                                                    <client-only>
                                                        <font-awesome-icon 
                                                            icon="fa-regular fa-circle-dot"                
                                                            @mouseenter="onPointer($event, item, null, null, `${item.componentKey}-trigger`)"
                                                            @mouseleave="onPointerLeave"
                                                        />
                                                    </client-only>
                                                </div>

                                                <div class="pl-2 text-sm">Trigger</div>                                                
                                            </div>
                                        </div>

                                        <div class="flex" v-for="(input, key) in item.inputs" :key="key" :id="`${input.id}-${keyItem}`" ref="inputs">
                                            <blueprint-component-input 
                                                :keyItem="keyItem" 
                                                :input="input" 
                                                :item="item" 
                                                :isInput="true" 
                                                :collaped="item.collaped"
                                                @changeDefault="changeDefault" 
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

                                    <div class="content-end items-end text-right ml-4 w-full">
                                        <!-- Outputs -->
                                        <div 
                                            class="text-right w-full items-end h-6 py-1" 
                                            v-for="(output, key) in item.outputs" 
                                            :key="key"
                                            :id="`${output.id}-${keyItem}`" 
                                            ref="inputs"
                                        >
                                            <div class="flex flex-row-reverse">                       
                                                <div 
                                                    :style="{color: (item.metadata[output?.type.replace(/\./, '_')]) ? item.metadata[output?.type.replace(/\./, '_')].color : getColorByType(output?.type)}" 
                                                    :title="output?.type"
                                                >
                                                    <client-only>
                                                        <font-awesome-icon          
                                                            icon="fa-solid fa-square"   
                                                            @dragstart="createLine($event, item, output, keyItem, `${output.id}-${keyItem}`)" 
                                                            @mousedown="createLine($event, item, output, keyItem, `${output.id}-${keyItem}`)"
                                                            @mouseenter="onPointer($event, item, output, keyItem, `${output.id}-${keyItem}`)"
                                                            @mouseleave="onPointerLeave"
                                                        />
                                                    </client-only>
                                                </div>

                                                <div>
                                                    <span class="px-2 text-sm">{{ uppercaseFirstLetter(output.name) }}</span>
                                                </div>  
                                            </div>
                                        </div> 
                                        
                                        <!-- Events -->
                                        <div class="text-right w-full items-end h-6 py-1" v-for="(event, key) in item?.events" :key="key">
                                            <div class="flex flex-row-reverse">                       
                                                <div :style="{color: '#FF0000'}" title="Event" :id="`${event.name}-${keyItem}`" ref="inputs">
                                                    <client-only>
                                                        <font-awesome-icon                         
                                                            icon="fa-solid fa-circle-play"   
                                                            @dragstart="createLine($event, item, event, keyItem, `${event.name}-${keyItem}`)" 
                                                            @mousedown="createLine($event, item, event, keyItem, `${event.name}-${keyItem}`)"
                                                            @mouseenter="onPointer($event, item, event, keyItem, `${event.name}-${keyItem}`)"
                                                            @mouseleave="onPointerLeave"
                                                        />
                                                    </client-only>
                                                </div>

                                                <div>
                                                    <span class="px-2 text-sm">{{ uppercaseFirstLetter(event.name) }}</span>
                                                </div>  
                                            </div>
                                        </div>

                                        <!-- Public Vars -->                                        
                                        <div class="text-right" v-for="(publicVar, key) in item.publicVars" :key="key">
                                            <div  v-if="publicVar.type == 'object' && publicVar.default && publicVar.default.createOutputs">
                                                <div class="w-full items-end"> 
                                                    <div v-for="(publicVaritem, key) in publicVar.value" :key="key" class="flex flex-row-reverse h-6"> 
                                                        <div 
                                                            :style="{color: (item.metadata[publicVar.default.realType?.replace(/\./, '_')]) ? item.metadata[publicVar.default.realType?.replace(/\./, '_')].color : getColorByType((publicVar.default.realType) ? publicVar.default.realType : 'Any')}" 
                                                            :id="`pv-${publicVar.id}-${publicVar.name}-${key}`" 
                                                            :title="(publicVar.default.realType) ? publicVar.default.realType : 'Any'"
                                                            ref="inputs"
                                                        >
                                                            <client-only>
                                                                <font-awesome-icon                         
                                                                    icon="fa-solid fa-square"
                                                                    @dragstart="createLine($event, item, publicVar, publicVar.name, `pv-${publicVar.id}-${publicVar.name}-${key}`)" 
                                                                    @mousedown="createLine($event, item, publicVar, publicVar.name, `pv-${publicVar.id}-${publicVar.name}-${key}`)"
                                                                    @mouseenter="onPointer($event, item, publicVar, publicVar.name, `pv-${publicVar.id}-${publicVar.name}-${key}`)"
                                                                    @mouseleave="onPointerLeave"
                                                                />
                                                            </client-only>
                                                        </div>

                                                        <div>
                                                            <span class="px-2 text-sm inline-block min-w-[100px]">{{ (publicVaritem.method) ? publicVaritem.method : 'GET' }} [{{ publicVaritem.url }}]</span>
                                                        </div>
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
                            :lineColor="line.lineColor"
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
                            :lineColor="tmpLine.lineColor"
                            ref="tmpLine"
                        ></blueprint-line-connector>

                        <div class="fixed h-11 bg-black/50 rounded-md flex m-4">
                            <Tooltip :tooltipText="$t('Zoom in')" position="top" class="flex" @click="scaleIn">
                                <button class="text-white px-3">
                                    <client-only><font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" /></client-only>
                                </button>
                            </Tooltip>

                            <Tooltip :tooltipText="$t('Reset')" position="top" class="flex" @click="scaleResert">
                                <button class="text-white px-3">
                                    <client-only><font-awesome-icon icon="fa-solid fa-magnifying-glass" /></client-only>
                                </button>
                            </Tooltip>

                            <Tooltip :tooltipText="$t('Zoom out')" position="top" class="flex" @click="scaleOut">
                                <button class="text-white px-3">
                                    <client-only><font-awesome-icon icon="fa-solid fa-magnifying-glass-minus" /></client-only>
                                </button>
                            </Tooltip>

                            <div class="p-2 text-neutral-600 font-bold">::</div>

                            <div class="ml-2 mr-2 mt-0.5 flex">
                                <div v-for="(layer, index) in layers">
                                    <button 
                                        @click="selectLayer(layer)"
                                        :class="[
                                            (index === layers.length -1) && '!rounded-r-md', 
                                            (index === 0) && '!rounded-l-md', 
                                            layer === selectedLayer && 'border-blue-800 bg-blue-800 '
                                        ]"
                                        class="py-[3px] my-1 px-[6px] sm:px-3 inline-flex items-center justify-center font-medium border border-black text-center focus:bg-primary text-neutral-100 text-sm sm:text-base capitalize bg-neutral-800"
                                    >
                                        {{ layer }}
                                    </button> 
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>

                <blueprint-navbar 
                    ref="navbar"
                    :layer="selectedLayer"
                    @addComponent="addComponent" 
                    @onPointer="onPointer" 
                />  

                <blueprint-object-edit 
                    class="fixed top-0 left-0 w-full h-full z-50"
                    v-if="objectEdit.open"
                    :keyItem="objectEdit.keyItem"
                    :component="objectEdit.item" 
                    :input="objectEdit.input" 
                    :fields="objectEdit.input.default" 
                    :values="objectEdit.explicitedValues || objectEdit.input.value"
                    @save="objectEditCallback"
                    @close="objectEdit.open = false" 
                />

                <blueprint-item-ghost :item="componentGhost" :position="componentGhostPosition" />
            </div>

            <div class="relative flex" :style="{width: `${widthLeftbar}px !important`}">
                <div class="top-0 w-full h-[300px] bg-neutral-800 border-b border-black">
                    <blueprint-metadata 
                        :metadata="metadata"
                        @changeMetadata="changeMetadata" 
                        @openObjectEdit="openObjectEdit"
                    />
                </div>

                <!-- Components -->
                <div 
                    class="absolute top-[300px] left-0 w-full bg-neutral-800 border-r border-t border-black" 
                    :style="{ height: 'calc(100% - 300px)'}"
                >
                    <div class="p-2 bg-neutral-900 border-b border-black">{{ $t("Blueprints") }}</div>

                    <blueprint-navbar 
                        :fixed="true" 
                        :showTitle="false" 
                        :dragItem="true" 
                        :layer="selectedLayer"
                        @createGhost="createGhost"
                        :style="{ height: 'calc(100% - 135px)'}"
                    />
                </div>

                <div 
                    :class="[
                        (startDragLeft) ? 'bg-blue-500' : '',
                        'resizeRight w-1 hover:bg-blue-500 h-full absolute right-0 z-40'
                    ]"
                    @mouseup.stop="handleDragEndLeft"
                    @mousedown="handleDragStartLeft"
                    @click="handleDragStartLeft"
                    @dragstart="handleDragStartLeft"                
                ></div>
            </div>
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

.resizeRight{
    cursor: ew-resize;
}
</style>

<script>
import globalMixin from "@/mixins/globalMixin";
import { useStateStore } from "~~/store/state.store";

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
            state: useStateStore(),
            widthLeftbar: 300,
            loading: false,
            dragIndex: 0,
            dragElement: null,
            startDrag: false,
            onCreateLine: false,
            createLineElem: null,
            tmpLine: null,
            tmpComponentHover: null,
            startDragLeft: false,
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
            mouseHandlerFull: { top: 200, left: 200 }, 
            items:[],
            connections: [],
            itemsClient: [],
            itemsShow: [],
            connectionsShow: [],
            connectionsClient: [],
            blueprintsBackend: [],
            blueprintsFrontend: [],
            blueprintsBackendCategories: {},
            blueprintsFrontendCategories: {},
            inputs: {},
            lines: [],
            lineUpdateCounter: 0,
            linesOffset: null,
            lineSelected: -1,
            ro: null,
            position: { x: 0, y: 0 },
            positionBackend: { x: 0, y: 0 },
            positionFrontend: { x: 0, y: 0 },
            scrollOffset: { x: 0, y: 0 },
            scale: 1,
            moveStartPosition: null,
            dragStartPosition: null,
            moveEvent: false,
            objectEdit: { open: false },
            overCanvas: false,
            componentGhost: null,
            componentGhostPosition: { top: 200, left: 200 },
            metadata: null,
            selectedComponent: null,
            layers: ["Backend", "Frontend"],
            selectedLayer: "Backend",
        }
    },

    async mounted(){
        if(this.tab.content){
            const metadata = JSON.parse(this.tab.content);

            for(let key in metadata)
                if(metadata[key])
                    this[key] = metadata[key];
        }   

        //Resize
        this.ro = new ResizeObserver(this.refreshLines);
        this.ro.observe(this.$refs.editor);
        this.linesOffset = this.$refs.editor.getBoundingClientRect();

        //Scroll
        this.scrollOffset = { x: this.$refs.editor.scrollLeft, y: this.$refs.editor.scrollTop };
        this.$refs.editor.addEventListener('scroll', (event) => {
            this.scrollOffset = { x: this.$refs.editor.scrollLeft, y: this.$refs.editor.scrollTop };
            this.saveState(false);
        });

        //Load blueprints                
        await this.loadBlueprints();
        const cacheBlueprints = localStorage.getItem(`blueprint-${this.tab.name.replace(/\./, "-")}`);

        if(cacheBlueprints){
            const cacheParse = JSON.parse(cacheBlueprints);
        
            if(cacheParse?.items){
                for(const key in cacheParse.items){
                    const item = cacheParse.items[key];

                    for(const blueprint of this.blueprintsBackend){
                        if((blueprint.namespace === item.namespace)){
                            this.items[key] = { ...{ collaped: false }, ...blueprint, ...item };
                            this.items[key].metadata = blueprint.metadata
                        }
                    }
                }
            }

            if(cacheParse?.itemsClient){
                for(const key in cacheParse?.itemsClient){
                    const itemsClient = cacheParse.itemsClient[key];

                    for(const blueprint of this.blueprintsFrontend){
                        if((blueprint.namespace === itemsClient.namespace)){
                            this.itemsClient[key] = { ...{ collaped: false }, ...blueprint, ...itemsClient };
                            this.itemsClient[key].metadata = blueprint.metadata
                        }
                    }
                }
            }
        
            this.connections = cacheParse.connections || [];
            this.connectionsClient = cacheParse.connectionsClient || [];

            if(cacheParse.scale)
                this.scale = cacheParse.scale;

            if(cacheParse.position)
                this.position = cacheParse.position;

            if(cacheParse.metadata)
                this.metadata = cacheParse.metadata;

            if(cacheParse.selectedLayer)
                this.selectedLayer = cacheParse.selectedLayer;

            if(cacheParse.scrollOffset){
                this.$refs.editor.scrollLeft = cacheParse.scrollOffset.x;
                this.$refs.editor.scrollTop = cacheParse.scrollOffset.y;
                this.scrollOffset = cacheParse.scrollOffset;
            }   

            this.$forceUpdate();
        }

        setInterval(() => {
            this.refreshLines();

            if(this.$refs.editor)
                this.linesOffset = this.$refs.editor.getBoundingClientRect();
        }, 1);

        setInterval(() => {
            this.saveState(true);
        }, 1000);

        this.selectLayer(this.selectedLayer);
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
            this.blueprintsBackend = await useApi(`blueprints/backend`, { method: "GET" });
            this.blueprintsFrontend = await useApi(`blueprints/frontend`, { method: "GET" });
            this.sortBlueprintsCategories();
        },

        clearLines(){
            this.lines = [];
        },

        createLines(){
            this.loading = true;

            if(this.lines.length > 0)
                this.lines = [];
                        
            for(let key in this.connectionsShow){
                const connection = this.connectionsShow[key];
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
                    this.lines.push({ 
                        from: input, 
                        to: output, 
                        connectionKey: key,
                        lineColor: connection.from.lineColor, 
                    });
                }                    
                else{
                    this.lines.splice(key, 1);
                }   
            }

            this.loading = false;
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
            for(let item of this.blueprintsBackend){
                if(!this.blueprintsBackendCategories[item.metadata.type])
                    this.blueprintsBackendCategories[item.metadata.type] = [];
                
                this.blueprintsBackendCategories[item.metadata.type].push(item);
            }

            for(let item of this.blueprintsFrontend){
                if(!this.blueprintsFrontendCategories[item.metadata.type])
                    this.blueprintsFrontendCategories[item.metadata.type] = [];
                
                this.blueprintsFrontendCategories[item.metadata.type].push(item);
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
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();
            this.dragElement = event.target;

            this.dragStartPosition = { 
                clientX: clientX + this.scrollOffset.x - editorOffset.x - 10, 
                clientY: clientY + this.scrollOffset.y - editorOffset.y - 10,
                positionX: this.itemsShow[key].position.left,
                positionY: this.itemsShow[key].position.top
            }

            this.dragIndex = key;
            this.startDrag = true;
        },

        handleDrag(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();

            this.mouseHandler.top = clientY + this.scrollOffset.y - editorOffset.y - 10;
            this.mouseHandler.left = clientX + this.scrollOffset.x - editorOffset.x - 10;
            
            this.mouseHandlerFull.top = clientY - 10;
            this.mouseHandlerFull.left = clientX - 10;
            
            if(this.startDrag){             
                const { clientX, clientY, positionX, positionY } = this.dragStartPosition;   
                const diffY = this.mouseHandler.top - clientY;
                const diffX = this.mouseHandler.left - clientX; 
                this.itemsShow[this.dragIndex].position.top = positionY + diffY;
                this.itemsShow[this.dragIndex].position.left = positionX + diffX;
                this.refreshLines();                
            }

            if(this.moveEvent){      
                const { clientX, clientY, positionX, positionY } = this.moveStartPosition;
                const diffY = this.mouseHandler.top - clientY;
                const diffX = this.mouseHandler.left - clientX;       
                this.position = { x: positionX + diffX, y: positionY + diffY };

                if(this.selectedLayer == "Backend")
                    this.positionBackend = this.position;
                else
                    this.positionFrontend = this.position;
            }

            if(this.tmpLine !== null && this.tmpLine != undefined)
                this.$refs.tmpLine.draw();
        },

        handleDragEnd(event){
            this.startDrag = false;

            if(this.onCreateLine){
                this.onCreateLine = false;
                this.tmpLine = null;
                let lineColor = '#FFFFFF';

                if(this.createLineElem.input?.type == "Event"){
                    lineColor = '#630000';
                }
                else{
                    lineColor = this.createLineElem.item.metadata[this.createLineElem.input.type.replace(/\./, "_")]?.color
                    || this.createLineElem.item.metadata[this.createLineElem.input.default?.realType.replace(/\./, "_")]?.color
                    || this.getColorByType(this.createLineElem.input.type)
                    || '#FFFFFF';
                }

                if(this.tmpComponentHover){  
                    if(this.createLineElem.input?.type == "Event" && this.tmpComponentHover.id.includes("-trigger")){
                        this.connectionsShow.push({
                            from: { 
                                componentKey: this.createLineElem.item.componentKey,
                                component: this.createLineElem.item.namespace, 
                                input: this.createLineElem.id,
                                lineColor 
                            },
                            to: { 
                                componentKey: this.tmpComponentHover.item.componentKey,
                                component: this.tmpComponentHover.item.namespace, 
                                input: this.tmpComponentHover.id,
                                lineColor  
                            }
                        });

                        if(this.selectedLayer == "Backend")
                            this.connections = this.connectionsShow;
                        else
                            this.connectionsFrontend = this.connectionsShow;

                        this.createLines(); 
                    }
                    else if(this.createLineElem.id !== this.tmpComponentHover.id){
                        if(
                            (this.createLineElem.input.type === this.tmpComponentHover.input.type) ||
                            (this.createLineElem.input.default?.realType === this.tmpComponentHover.input.type) ||
                            (this.createLineElem.input.type === "Any" || this.tmpComponentHover.input.type === "Any")
                        ){
                            this.connectionsShow.push({
                                from: { 
                                    componentKey: this.createLineElem.item.componentKey,
                                    component: this.createLineElem.item.namespace, 
                                    input: this.createLineElem.id,
                                    lineColor 
                                },
                                to: { 
                                    componentKey: this.tmpComponentHover.item.componentKey,
                                    component: this.tmpComponentHover.item.namespace, 
                                    input: this.tmpComponentHover.id,
                                    lineColor  
                                }
                            });

                            if(this.selectedLayer == "Backend")
                                this.connections = this.connectionsShow;
                            else
                                this.connectionsFrontend = this.connectionsShow;

                            this.createLines(); 
                        }
                    }
                }
                else{
                    this.$refs.navbar.open(this.mouseHandler);

                    if(this.$refs.navbar.$el && this.createLineElem)
                        this.tmpLine = { 
                            from: this.createLineElem.el, 
                            to: this.$refs.navbar.$el,
                            lineColor 
                        }; 
                }                              
            }

            if(this.moveEvent)
                this.moveEvent = false;

            if(this.componentGhost){
                const tmpComponent = this.componentGhost;

                setTimeout(() => {
                    if(this.overCanvas && tmpComponent)
                        this.addComponent(tmpComponent, this.mouseHandler);
                }, 100);

                this.componentGhost = null;
            }

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

            const itemByLayer = (this.selectedLayer == "Backend") ? this.items : this.itemsClient;
            
            itemByLayer.push({ 
                ...item,
                componentKey: `${item.namespace}::${new Date().getTime()}`,
                position: { 
                    top: this.mouseHandler.top - this.position.y,
                    left: this.mouseHandler.left - this.position.x 
                },
                collaped: false
            });

            this.saveState(true);
        },

        removeComponent(key){
            this.clearLines(); 
            let newConnections = [];
            const itemByLayer = (this.selectedLayer == "Backend") ? this.items : this.itemsClient;

            for(let keyConnect in this.connectionsShow){
                const indexInput = parseInt(this.connectionsShow[keyConnect].from.input.split("-")[1]);
                const indexOutput = parseInt(this.connectionsShow[keyConnect].to.input.split("-")[1]);

                if(key !== indexInput && key !== indexOutput)
                    newConnections.push(this.connectionsShow[keyConnect]);
            }

            this.connectionsShow = newConnections;            
            this.saveState(false);

            for(let keyConnect in this.connectionsShow){
                const indexInput = parseInt(this.connectionsShow[keyConnect].from.input.split("-")[1]);
                const indexOutput = parseInt(this.connectionsShow[keyConnect].to.input.split("-")[1]);

                if(indexInput > key){
                    if(this.connectionsShow[keyConnect].from.input.split("-").length === 2)
                        this.connectionsShow[keyConnect].from.input = this.connectionsShow[keyConnect].from.input.replace(`-${indexInput}`, `-${indexInput - 1}`);
                    else
                        this.connectionsShow[keyConnect].from.input = this.connectionsShow[keyConnect].from.input.replace(`-${indexInput}-`, `-${indexInput - 1}-`);
                }

                if(indexOutput > key){
                    if(this.connectionsShow[keyConnect].to.input.split("-").length === 2)
                        this.connectionsShow[keyConnect].to.input = this.connectionsShow[keyConnect].to.input.replace(`-${indexOutput}`, `-${indexOutput - 1}`);
                    else
                        this.connectionsShow[keyConnect].to.input = this.connectionsShow[keyConnect].to.input.replace(`-${indexOutput}-`, `-${indexOutput - 1}-`);
                }
            }

            if(this.selectedLayer == "Backend")
                this.connections = this.connectionsShow;
            else
                this.connectionsClient = this.connectionsShow;

            this.saveState(false);
            itemByLayer.splice(key, 1);
            this.saveState(true);
            this.createLines();
            setTimeout(() => { this.createLines(); }, 100);
        },

        createGhost(item){
            this.componentGhost = item;
            this.componentGhostPosition = this.mouseHandlerFull;
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
                selectedLayer: this.selectedLayer,
                items: this.items,
                connections: this.connections,
                itemsClient: this.itemsClient,
                connectionsClient: this.connectionsClient,
                scale: this.scale,
                position: this.position,
                scrollOffset: this.scrollOffset,
                metadata: this.metadata,
                positionBackend: this.positionBackend,
                positionFrontend: this.positionFrontend
            };
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
                case "number": value = parseFloat(value); break;
                case "boolean": value = value === "true"; break;
            }

            input.value = value;            
            this.saveState(true);
        },

        openObjectEdit(item, input, keyItem, key, cb = null, explicitedValues){
            this.objectEdit = { item, input, keyItem, key, cb, open: true, explicitedValues };
        },

        async openComponent(item){
            const content = await useApi(`files/open?filename=${encodeURIComponent(item.filename)}`, {
                method: "GET"
            });

            this.state.openTab({ ...content, recent: true });
        },

        onDelete(){
            if(this.lineSelected != -1){
                if(this.selectedLayer == "Backend")
                    this.connections.splice(this.lineSelected, 1);                    
                else
                    this.connectionsClient.splice(this.lineSelected, 1);
                
                this.lines.splice(this.lineSelected, 1);
                this.lineSelected = -1;                    
                this.saveState(true);
            }
        },

        changeMetadata(medatada){
            if(medatada){
                this.metadata = { ...medatada };
                this.saveState(false);
            }
        },

        toggleComponent(item){
            item.collaped = !item.collaped;
            this.refreshLines();
            this.saveState(true);
        },

        objectEditCallback(value) {
            if(this.objectEdit.cb && typeof this.objectEdit.cb == 'function') {
                this.objectEdit.cb(value)
            }   
            else {
                this.changeDefault(value, this.objectEdit.input, 'object');
                this.objectEdit.input.value = value; 
            }                 
            
            this.objectEdit.open = false; 
            this.saveState(true);
        },

        selectComponent(item){
            this.selectedComponent = item;
            this.$forceUpdate();
            this.$nextTick();
        },

        selectLayer(layer){
            this.selectedLayer = layer;

            if(this.selectedLayer == "Backend"){
                this.itemsShow = this.items;
                this.connectionsShow = this.connections;
                this.position = this.positionBackend;
            }
            else{
                this.itemsShow = this.itemsClient;
                this.connectionsShow = this.connectionsClient;
                this.position = this.positionFrontend;
            }

            this.$forceUpdate();
            this.$nextTick(() => {
                this.createLines(); 
                this.refreshLines();
            });

            this.saveState(true);
        },

        openWindow(url){
            window.open(url, '_blank');
        },

        saveState(emit = false){
            localStorage.setItem(`blueprint-${this.tab.name.replace(/\./, "-")}`, JSON.stringify({
                selectedLayer: this.selectedLayer,
                items: this.items,
                itemsClient: this.itemsClient,
                connections: this.connections,
                connectionsClient: this.connectionsClient,
                scale: this.scale,
                position: this.position,
                scrollOffset: this.scrollOffset,
                metadata: this.metadata,
                positionBackend: this.positionBackend,
                positionFrontend: this.positionFrontend
            }));

            if(emit)
                this.$emit("changeState", this.getValue());
        }
    }
}
</script>