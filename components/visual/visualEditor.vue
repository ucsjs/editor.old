<template>
    <div 
        class="absolute w-full h-full" 
        @contextmenu.prevent="() => {}" 
        @mousemove="handleDrag" 
        ref="editor"
    >
        <div 
            ref="moveLeft" 
            class="fixed w-screen h-screen bg-transparent z-50" 
            @mousemove="handleDragLeft" 
            @mouseup="handleDragEndLeft" 
            v-if="startDragLeft"
        ></div>

        <div 
            ref="moveRight" 
            class="fixed w-screen h-screen bg-transparent z-50" 
            @mousemove="handleDragRight" 
            @mouseup="handleDragEndRight" 
            v-if="startDragRight"
        ></div>

        <div 
            id="ghost" 
            :class="[
                'absolute border p-1 z-50 border-[#0968a9] bg-[#0968a9]/50 rounded-lg'
            ]"
            :style="{ top: `${mouseHandler.top + 5}px`, left: `${mouseHandler.left+20}px`}" 
            v-if="state.hierarchy.ghost"
        >
            {{ state.hierarchy.ghost.id }}
        </div>

        <div class="grid-background select-none absolute left-0 right-0 top-0 bottom-11">
            <div class="flex flex-col h-full">                
                <div class="flex flex-row h-full relative">
                    <div 
                        class="relative flex" 
                        :style="{width: `${widthLeftbar}px !important`}"
                        @mouseover="mouseInCanvas = true"
                        @mouseleave="mouseInCanvas = false"
                    >
                        <visual-editor-hierarchy 
                            :tab="tab" 
                            :canvas="canvas"
                            :components="components" 
                            v-if="canvas && tab" 
                            @changeState="changeState"
                            @selectComponent="selectComponent"
                            @addComponent="addComponent"
                            @mouseover="context = 'hierarchy'"
                        />

                        <div 
                            :class="['resizeRight hover:bg-[#444444] w-1 h-full absolute right-0 z-40']"
                            :style="{ 
                                'background-color': (startDragLeft) ? '#444444' : ''
                            }"
                            @mouseup.stop="handleDragEndLeft"
                            @mousedown="handleDragStartLeft"
                            @click="handleDragStartLeft"
                            @dragstart="handleDragStartLeft"                
                        ></div>
                    </div>

                    <div 
                        :style="{width: `calc(100% - ${(widthLeftbar + widthRightbar)}px) !important`}" 
                        :class="[
                            (state.hierarchy.ghost) ? 'cursor-not-allowed' : '',
                            'relative'
                        ]"
                        @mouseover="mouseInCanvas = true"
                        @mouseleave="mouseInCanvas = false"
                    >
                        <client-only>
                            <visual-canvas 
                                ref="canvas" 
                                :tab="tab" 
                                :components="components" 
                                :selectedComponent="selectedComponent"
                                v-if="components?.length > 0"
                                @loadedCanvas="loadedCanvas"
                                @changeState="changeState" 
                                @selectedItem="selectComponent"
                                @unselectItem="unselectComponent"
                                @mouseover="context = 'canvas'"
                            />
                        </client-only>
                    </div>

                    <div 
                        :class="[
                            (state.hierarchy.ghost) ? 'cursor-not-allowed' : '',
                            'relative flex'
                        ]"
                        :style="{width: `${widthRightbar}px !important`}"
                    >
                        <visual-editor-inspector          
                            ref="inspector"    
                            :componentsDefaults="components"               
                            :component="selectedComponent"
                            @changeProperty="changeProperty"
                            @addComponent="addSubcomponent"
                            @removeComponent="removeSubcomponent"
                            @changeState="saveStateContents"
                            @mouseover="context = 'inspector'"
                        />

                        <div 
                            :class="[
                                (startDragRight) ? 'bg-[#444444]' : '',
                                'resizeRight w-1 hover:bg-[#444444] h-full absolute left-0 z-40'
                            ]"
                            @mouseup.stop="handleDragEndRight"
                            @mousedown="handleDragStartRight"
                            @click="handleDragStartRight"
                            @dragstart="handleDragStartRight"                
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.resizeRight{
    cursor: ew-resize;
}
</style>

<script>
import { useStateStore } from "~~/store/state.store";

export default {
    props:{
        tab: {
            type: Object,
            required: true
        } 
    },

    data(){
        return{
            state: useStateStore(),
            components: [],
            mouseHandler: { top: 200, left: 200 },
            selectedComponent: null,
            content: {},
            canvas: null,
            widthLeftbar: 300,
            startDragLeft: false,
            startDragLeftEvent: null,
            widthRightbar: 300,
            startDragRight: false,
            startDragRightEvent: null,
            mouseInCanvas: false,
            context: null
        }
    },

    async created(){
        await this.loadComponents();
    },

    mounted(){
        let cacheVisualEditorSettings = localStorage.getItem(`visual-editor`);

        if(cacheVisualEditorSettings){
            cacheVisualEditorSettings = JSON.parse(cacheVisualEditorSettings);

            for(let key in cacheVisualEditorSettings)
                this[key] = cacheVisualEditorSettings[key];
        }
    },  

    methods: {
        async loadComponents(){
            this.components = await useApi(`visual`, { method: "GET" });
            await this.fixDefaultValues();
            this.$forceUpdate();
        },

        async fixDefaultValues(){
            for(let component of this.components){
                for(let subComponent of component.components){
                    if(component.componentsDafaults?.length > 0){
                        for(let componentDefault of component.componentsDafaults){
                            if(componentDefault.component == subComponent.component?.toLowerCase()){
                                subComponent.default[componentDefault.property] = componentDefault.value;
                            }
                        }
                    }
                }
            }
        },  

        loadedCanvas(value){
            this.canvas = value;
        },

        async selectComponent(component){
            if(component && component.id){
                const componentSelected = await this.$refs.canvas?.getComponent(component.id, this.$refs.canvas);
                this.state.hierarchy.selectedItem = componentSelected;

                if(componentSelected)
                    this.selectedComponent = componentSelected;

                this.$forceUpdate();
            }
        },

        unselectComponent(){
            this.selectedComponent = this.$refs.canvas.body;
            this.$forceUpdate();
        },

        changeState(value){
            if(value){
                this.canvas = value;
                this.$emit("changeState", value);
                this.$forceUpdate();
                this.$refs.canvas.loadCanvasFromLocalStorage();
            }
        },

        saveStateContents(){
            this.$refs.canvas.saveState(true);
            this.$refs.canvas.loadCanvasFromLocalStorage();
        },

        handleDrag(event){   
            const { clientX, clientY } = event;

            if(this.$refs.editor){
                const editorOffset = this.$refs.editor.getBoundingClientRect();
                this.mouseHandler.top = clientY - editorOffset.y - 10;
                this.mouseHandler.left = clientX - editorOffset.x - 10; 
            }         
        },

        handleDragStartLeft(event){
            this.startDragLeft = true;
            this.startDragLeftEvent = { event, width: this.widthLeftbar };
        },

        handleDragLeft(event){
            if(this.startDragLeft){
                const diffX = event.clientX - this.startDragLeftEvent.event.clientX;
                const newWidth = this.startDragLeftEvent.width + diffX;

                if(newWidth > 200  && newWidth <= 1000)
                    this.widthLeftbar = newWidth;
            }
        },

        handleDragEndLeft(event){
            this.startDragLeftEvent = null;
            this.startDragLeft = false;
            this.saveState();
        },

        handleDragStartRight(event){
            this.startDragRight = true;
            this.startDragRightEvent = { event, width: this.widthRightbar };
        },

        handleDragRight(event){
            if(this.startDragRight){
                const diffX = event.clientX - this.startDragRightEvent.event.clientX;
                const newWidth = this.startDragRightEvent.width - diffX;

                if(newWidth > 200  && newWidth <= 1000)
                    this.widthRightbar = newWidth;
            }
        },

        handleDragEndRight(event){
            this.startDragRightEvent = null;
            this.startDragRight = false;
            this.saveState();
        },

        async changeProperty(component){
            if(component.namespace == "Body"){
                this.$refs.canvas.body = component;
                this.$refs.canvas.style = this.$refs.canvas.getStyle(this.$refs.canvas.body);
                this.$refs.canvas.saveState(true);
            }
            else{
                await this.$refs.canvas.updateComponent(component);
                const componentUpdated = await this.$refs.canvas?.getComponent(component.id, this.$refs.canvas);

                if(componentUpdated)
                    this.selectedComponent = componentUpdated;

                this.$refs.canvas.saveState(true);
                this.$forceUpdate();
            }
        },

        addComponent(component){
            this.$refs.canvas.addComponent(component);
            this.$refs.canvas.saveState(true);
        },

        addSubcomponent(component){
            let hasComponent = false;

            for(let key in this.selectedComponent.components){
                if(this.selectedComponent.components[key].sign === component.sign){
                    hasComponent = true;
                    break;
                }
            }

            if(!hasComponent){
                this.components.push(component);
                this.selectedComponent.components.push(component);   
                this.$refs.canvas.update(); 
                this.$refs.canvas.saveState(true);
                this.$forceUpdate();  
            }
        },

        removeSubcomponent(key){
            this.selectedComponent.components.splice(key, 1);
            this.$refs.canvas.update(); 
            this.$refs.canvas.saveState(true);
            this.$forceUpdate();
        },

        async onDelete(){
            if(this.context == "canvas" || this.context == "hierarchy"){
                await this.$refs.canvas.onDelete();
                this.saveState(true);
                this.$forceUpdate();
            }
            else{
                this.$refs.inspector.onDelete();
            }
        },

        saveState(){
            localStorage.setItem(`visual-editor`, JSON.stringify({
                widthLeftbar: this.widthLeftbar,
                widthRightbar: this.widthRightbar
            }));
        }
    }
}
</script>
