<template>
    <div class="relative w-full h-full">
        <div 
            class="bg-neutral-700 w-full h-full grid-background absolute"
            @mousemove="handleDrag" 
            @mouseup="handleDragEnd"
            @click.stop="unselectItem"
            ref="editor"
        > 
            <div 
                id="canvas-mouse-pointer"
                class="w-4 h-4 absolute" 
                :style="{ top: `${mouseHandler.top}px`, left: `${mouseHandler.left}px`}" 
                ref="mousePointer"
            ></div>

            <div class="grid-contents block relative" @mousedown.left="move">
                <div class="justify-center items-center flex h-full">
                    <div 
                        class="m-auto overflow-hidden relative" 
                        :style="{
                            backgroundColor: settings.backgroundColor,
                            width: `${viewport.width}px`, 
                            height: `${viewport.height}px`, 
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
                        }"
                        ref="canvas"
                        @mousedown.left.stop="() => {}"
                        @contextmenu.prevent="contextmenu" 
                        @mouseup.left="closeContextmenu"
                    >
                        <visual-component 
                            v-for="(component, key) in hierarchy" 
                            :key="key" 
                            :componentIndex="key"
                            :settings="component"
                            :editorOffset="editorOffset"
                            :selectedComponent="selectedComponent"
                            :mouseHandler="mouseHandler"
                            :tab="tab"
                            @selectItem="selectItem"
                            @changeState="saveState"
                        ></visual-component>
                    </div> 

                    <div class="absolute h-11 bg-black/50 bottom-6 right-6 rounded-md flex">
                        <Tooltip :tooltipText="$t('Desktop')" position="top" class="flex" @click="viewportDesktop">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-desktop" /></client-only>
                            </button>
                        </Tooltip>

                        <Tooltip :tooltipText="$t('Tablet')" position="top" class="flex" @click="viewportTablet">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-tablet-screen-button" /></client-only>
                            </button>
                        </Tooltip>

                        <Tooltip :tooltipText="$t('Mobile')" position="top" class="flex" @click="viewportMobile">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-mobile-screen-button" /></client-only>
                            </button>
                        </Tooltip>

                        <div class="p-2 text-neutral-600 font-bold">::</div>

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
                    </div>

                    <visual-context-menu :components="components" ref="navbar" @addComponent="addComponent" />
                </div>
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
    width: 10px;
    height: 10px;
}

*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner {
    background: #000000;
}

*::-webkit-scrollbar-thumb {
    background-color: #262626;
    border-radius: 0px;
    border: 3px solid #262626;
}
</style>

<script>
export default {
    props:{
        tab: {
            type: Object,
            default: null
        },
        components: {
            type: Array,
            default: []
        },
        selectedComponent: {
            type: Object,
            default: null
        },
    },

    data(){
        return {
            settings: {
                backgroundColor: "#ffffff",
            },
            componentIndex: 0,
            selected: 0,
            viewport: { width: 375, height: 667  },
            scale: 1,
            position: { x: 0, y: 0 },
            mouseHandler: { top: 200, left: 200 },
            moveEvent: false,
            canvasOffset: {},
            editorOffset: {},
            devices: {
                mobile: { width: 375, height: 667 },
                tablet: { width: 768, height: 1024 },
                desktop: { width: 1920, height: 1080 }
            },
            hierarchy: []
        }
    },

    async mounted(){
        if(this.tab && this.tab.recent && this.tab.content){
            this.tab.recent = false;
            const metadata = JSON.parse(this.tab.content);

            for(let key in metadata)
                this[key] = metadata[key];
        }
        else{
            if(this.tab.content){
                const metadata = JSON.parse(this.tab.content);

                for(let key in metadata)
                    this[key] = metadata[key];
            } 

            this.loadCanvasFromLocalStorage();
        } 

        this.editorOffset = this.$refs.editor.getBoundingClientRect();
        this.canvasOffset = this.$refs.canvas.getBoundingClientRect();
        this.$emit("loadedCanvas", this.getValue());
    },

    methods: {
        loadCanvasFromLocalStorage(){
            const cachePage = localStorage.getItem(`page-${this.tab.name.replace(/\./, "-")}`);

            if(cachePage){
                const cacheParse = JSON.parse(cachePage);

                for(let key in cacheParse)
                    this[key] = cacheParse[key];
            }
        },

        contextmenu(){            
            this.$refs.navbar.open(this.mouseHandler);
        },

        closeContextmenu(){
            this.$refs.navbar.close();
        },

        addComponent(item, position){
            this.componentIndex++;
            const canvasX = this.canvasOffset.x - this.editorOffset.x + this.position.x;
            const canvasY = this.canvasOffset.y - this.editorOffset.y + this.position.y; 

            this.hierarchy.push({
                id: `${item.namespace}_${this.componentIndex}`,
                ...item,
                position: {
                    left: 0,// position.left - canvasY,
                    top: 0//position.top - canvasX
                },
                hierarchy: []
            });

            this.saveState(true);
        },

        move(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();

            this.moveStartPosition = { 
                clientX: clientX - editorOffset.x - 10, 
                clientY: clientY - editorOffset.y - 10,
                positionX: this.position.x,
                positionY: this.position.y 
            };

            this.moveEvent = true;
        },

        handleDrag(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();
            
            this.mouseHandler.top = clientY - editorOffset.y - 10;
            this.mouseHandler.left = clientX - editorOffset.x - 10;                
            
            if(this.moveEvent){      
                const { clientX, clientY, positionX, positionY } = this.moveStartPosition;
                const diffY = this.mouseHandler.top - clientY;
                const diffX = this.mouseHandler.left - clientX;       
                this.position = { x: positionX + diffX, y: positionY + diffY };
            }
        },

        handleDragEnd(event){
            if(this.moveEvent)
                this.moveEvent = false;

            this.saveState(true);
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

        viewportDesktop(){
            this.viewport = this.devices.desktop;
            this.saveState();
            this.$forceUpdate();
        },

        viewportTablet(){
            this.viewport = this.devices.tablet;
            this.saveState();
            this.$forceUpdate();
        },

        viewportMobile(){
            this.viewport = this.devices.mobile;
            this.saveState();
            this.$forceUpdate();
        },

        async selectItem(id){
            const component = await this.getComponent(id, this);

            if(component)
                this.$emit("selectedItem", component);
        },

        unselectItem(){
            this.$emit("unselectItem");
        },

        getValue(){
            return {
                settings: this.settings,
                scale: this.scale,
                position: this.position,
                viewport: this.viewport,
                hierarchy: this.hierarchy,
                componentIndex: this.componentIndex
            }
        },

        async onDelete(){
            if(this.selectedComponent){
                await this.removeComponent(this.selectedComponent.id, this);
                this.saveState(true);
                this.$forceUpdate();
                this.selectedComponent = null;
            }
        },

        getSubHierarchy(item, selected){
            let subHierarchy = item;

            if(item.hierarchy.length > 0){
                for(let key in item.hierarchy){
                    if(key != selected)
                        subHierarchy.hierarchy = subHierarchy.push(this.getSubHierarchy(item.hierarchy[key].hierarchy, selected));
                }
            }

            return subHierarchy;
        },

        updateComponentBy(elementId, root, newComponent){
            return new Promise(async (resolve, reject) => {
               if(root.hierarchy.length > 0){
                    for(let key in root.hierarchy){
                        if(root.hierarchy[key]){
                            if(root.hierarchy[key].id === elementId){
                                root.hierarchy[key] = newComponent;
                                this.saveState(true);
                                resolve(null);
                                break;
                            }                            
                            else{
                                await this.updateComponentBy(elementId, root.hierarchy[key], newComponent);
                            }
                        }
                    }

                    if(root.hierarchy.length > 0)
                        root.hierarchy = root.hierarchy.filter((item) => item);

                    resolve(null);
                }
                else{
                    resolve(null);
                }
            });
        },

        removeComponent(elementId, root){
            return new Promise(async (resolve, reject) => {
               if(root.hierarchy.length > 0){
                    for(let key in root.hierarchy){
                        if(root.hierarchy[key]){
                            if(root.hierarchy[key].id === elementId){
                                delete root.hierarchy[key];
                                this.saveState(true);
                                resolve(null);
                                break;
                            }                            
                            else{
                                await this.removeComponent(elementId, root.hierarchy[key]);
                            }
                        }
                    }

                    if(root.hierarchy.length > 0)
                        root.hierarchy = root.hierarchy.filter((item) => item);

                    resolve(null);
                }
                else{
                    resolve(null);
                }
            });
        },

        async updateComponent(component){
            await this.updateComponentBy(component.id, this, component);
            this.$forceUpdate();
            console.log("updateComponent");
        },

        async getComponent(elementId, root){
            return new Promise(async (resolve, reject) => {
               if(root.hierarchy.length > 0){
                    for(let key in root.hierarchy){
                        if(root.hierarchy[key]){
                            if(root.hierarchy[key].id === elementId){
                                resolve(root.hierarchy[key]);
                                break;
                            }                            
                            else{
                                const componentRef = await this.getComponent(elementId, root.hierarchy[key]);

                                if(componentRef)
                                    resolve(componentRef);
                            }
                        }
                    }

                    resolve(null);
                }
                else{
                    resolve(null);
                }
            }); 
        },

        saveState(emit = false){
            localStorage.setItem(`page-${this.tab.name.replace(/\./, "-")}`, JSON.stringify(this.getValue()));

            if(emit)
                this.$emit("changeState", this.getValue());
        }
    }
}
</script>
