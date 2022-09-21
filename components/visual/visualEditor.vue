<template>
    <div class="absolute w-full h-full" @contextmenu.prevent="() => {}" ref="editor">
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

        <div class="grid-background select-none absolute left-0 right-0 top-0 bottom-11">
            <div class="flex flex-col h-full">
                <!--<div class="flex h-10">
                    <visual-editor-navbar />
                </div>-->
                
                <div class="flex flex-row h-full relative">
                    <div class="relative flex" :style="{width: `${widthLeftbar}px !important`}">
                        <visual-editor-hierarchy 
                            :tab="tab" 
                            :canvas="canvas"
                            :components="components" 
                            v-if="canvas && tab" 
                            @changeState="changeState"
                            @selectComponent="selectComponent"
                            @addComponent="addComponent"
                        />

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

                    <div :style="{width: `calc(100% - ${(widthLeftbar + widthRightbar)}px) !important`}" class="relative">
                        <client-only>
                            <visual-canvas 
                                ref="canvas" 
                                :tab="tab" 
                                :components="components" 
                                :selectedComponent="selectedComponent"
                                v-if="components.length > 0"
                                @loadedCanvas="loadedCanvas"
                                @changeState="changeState" 
                                @selectedItem="selectComponent"
                                @unselectItem="unselectComponent"
                            />
                        </client-only>
                    </div>

                    <div class="relative flex" :style="{width: `${widthRightbar}px !important`}">
                        <visual-editor-inspector                            
                            :component="selectedComponent"
                            @changeProperty="changeProperty"
                            @addComponent="addSubcomponent"
                            @removeComponent="removeSubcomponent"
                            @changeState="saveStateContents"
                        />

                        <div 
                            :class="[
                                (startDragRight) ? 'bg-blue-500' : '',
                                'resizeRight w-1 hover:bg-blue-500 h-full absolute left-0 z-40'
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
            selectedComponent: null,
            content: {},
            canvas: null,
            widthLeftbar: 300,
            startDragLeft: false,
            startDragLeftEvent: null,
            widthRightbar: 300,
            startDragRight: false,
            startDragRightEvent: null,
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
            this.$forceUpdate();
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
            this.selectedComponent = null;
            this.$forceUpdate();
        },

        changeState(value){
            this.canvas = value;
            this.$emit("changeState", value);
            this.$forceUpdate();
            this.$refs.canvas.loadCanvasFromLocalStorage();
        },

        saveStateContents(){
            this.$refs.canvas.saveState(true);
            this.$refs.canvas.loadCanvasFromLocalStorage();
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
            await this.$refs.canvas.updateComponent(component);
            const componentUpdated = await this.$refs.canvas?.getComponent(component.id, this.$refs.canvas);

            if(componentUpdated)
                this.selectedComponent = componentUpdated;

            this.$refs.canvas.saveState(true);
            this.$forceUpdate();
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
            await this.$refs.canvas.onDelete();
            this.saveState(true);
            this.$forceUpdate();
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
