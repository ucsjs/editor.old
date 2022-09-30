<template>
    <div class="relative w-full h-full select-none">
        <div 
            class="bg-neutral-700 w-full h-full grid-background absolute"
            ref="editor"
            @mousemove="handleDrag" 
            @mouseup="handleDragEnd"
            @click.stop="unselectItem"             
        > 
            <div 
                id="canvas-mouse-pointer"
                class="w-4 h-4 absolute" 
                :style="{ top: `${mouseHandler.top}px`, left: `${mouseHandler.left}px`}" 
                ref="mousePointer"
            ></div>

            <div 
                class="grid-contents block relative" 
                @mousedown.left="move"
            > 
                <div class="justify-center items-center flex h-full relative z-40">
                    <div 
                        class="m-auto overflow-hidden absolute z-40" 
                        :style="{
                            backgroundColor: settings.backgroundColor,
                            width: `${viewport.width}px`, 
                            minHeight: `${viewport.height}px`, 
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            ...style
                        }"
                        ref="canvas"
                        @mousedown.left.stop="() => { selectItem(state.componentOver) }"
                        @contextmenu.prevent="contextmenu" 
                        @mouseup.left="closeContextmenu"
                        @click.left.stop="selectItem(state.componentOver)"
                    >
                        <visual-component 
                            v-for="(component, key) in hierarchy" 
                            :key="key" 
                            :componentIndex="key"
                            :settings="component"
                            :editorOffset="editorOffset"
                            :selectedComponent="selectedComponent"
                            :tab="tab"
                            :viewport="viewport"
                            ref="components"
                            @changeState="saveState"
                            @click.left.stop="() => {}"
                        ></visual-component>

                    </div> 

                    <div class="absolute h-11 bg-black/50 bottom-3 rounded-md flex z-40">
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

                        <div class="p-2 text-neutral-600 font-bold">::</div>

                        <Tooltip :tooltipText="$t('Centralize')" position="top" class="flex" @click="centralize">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-arrows-to-dot" /></client-only>
                            </button>
                        </Tooltip>
                    </div>

                    <visual-context-menu :components="components" ref="navbar" @addComponent="addComponent" />
                </div>

                <div id="grid-margin" class="w-full h-full top-0 left-0 absolute z-10">
                    <div class="border border-dashed border-sky-500/50 h-full w-[1px] absolute z-30" :style="{ left: `${canvasOffset.x - editorOffset.x}px`}"></div>
                    <div class="border border-dashed border-sky-500/50 h-full w-[1px] absolute z-30" :style="{ left: `${(canvasOffset.x - editorOffset.x) + viewport.width}px`}"></div>
                
                    <div class="border border-dashed border-sky-500/50 h-[1px] w-full absolute z-30" :style="{ top: `${canvasOffset.y - editorOffset.y}px`}"></div>
                    <div class="border border-dashed border-sky-500/50 h-[1px] w-full absolute z-30" :style="{ top: `${(canvasOffset.y - editorOffset.y)+ viewport.height}px`}"></div>
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
import { useStateStore } from "~~/store/state.store";

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
            state: useStateStore(),
            settings: { backgroundColor: "#ffffff" },
            componentIndex: 0,
            selected: 0,
            viewport: { width: 375, height: 667, type: "mobile" },
            scale: 1,
            position: { x: 0, y: 0 },
            mouseHandler: { top: 200, left: 200 },
            moveEvent: false,
            canvasOffset: {},
            editorOffset: {},
            devices: {
                mobile: { width: 375, height: 667, type: "mobile" },
                tablet: { width: 768, height: 1024, type: "tablet" },
                desktop: { width: 1024, height: 768, type: "desktop" }
            },
            hierarchy: [],
            body: {},
            style: {}
        }
    },

    async mounted(){
        if(this.tab.content){
            const metadata = JSON.parse(this.tab.content);

            for(let key in metadata)
                this[key] = metadata[key];
        } 

        await this.loadCanvasFromLocalStorage();
        
        if(!this.body.id){
            for(let component of this.components){
                if(component.namespace == "Body"){
                    this.body = component;
                    break;
                }
            }
        }

        for(let key in this.body.components){
            if(!this.body.components[key].value)
                this.body.components[key].value = this.body.components[key].default;
        }

        this.body.label = this.body.id;
        this.style = this.getStyle(this.body);
        this.unselectItem();
        this.editorOffset = this.$refs.editor?.getBoundingClientRect();
        this.canvasOffset = this.$refs.canvas?.getBoundingClientRect();
        this.$emit("loadedCanvas", this.getValue());
    },

    methods: {
        async loadCanvasFromLocalStorage(){
            const cachePage = localStorage.getItem(`page-${this.tab.name.replace(/\./, "-")}`);

            if(cachePage){
                const cacheParse = JSON.parse(cachePage);

                for(let key in cacheParse)
                    this[key] = cacheParse[key];

                this.hierarchy = this.hierarchy.filter((item) => item);

                for(let component of this.hierarchy){
                    if(component)
                        this.updateComponentByDefault(component);
                }
            }

            return true;
        },

        updateComponentByDefault(component){
            for(let componentDefault of this.components){
                if(componentDefault.sign === component.sign){
                    component.metadata = { ...componentDefault.metadata, ...component.metadata };

                    if(componentDefault.template != component.template)
                        component.template = componentDefault.template;

                    if(componentDefault.content != component.content)
                        component.content = componentDefault.content;

                    if(componentDefault.editor != component.editor)
                        component.editor = componentDefault.editor;

                    for(let subComponentDefault of componentDefault.components){
                        let isNewProperty = true;

                        for(let subComponent of component.components){
                            if(subComponentDefault.component === subComponent.component){
                                subComponent.default = subComponentDefault.default;
                                subComponent.metadata = subComponentDefault.metadata;
                                subComponent.properties = subComponentDefault.properties;

                                for(let property of subComponentDefault.properties){
                                    if(!subComponent.value[property.name] && property.default){
                                        if(typeof property.default === "object" && property.default.default !== undefined)
                                            subComponent.value[property.name] = property.default.default;
                                        else
                                            subComponent.value[property.name] = property.default;
                                    } 
                                }

                                isNewProperty = false;
                            }
                        }
                    }
                }
            }
        },

        getStyle(root){
            try{
                let finalStyles = {};
                let ignoreStyles = ['width', 'height', 'top', 'left', 'right', 'bottom'];
                let stylePixel = [
                    "width", "height", "left", "top", "right", "bottom", 
                    "padding-top", "padding-right", "padding-bottom", "padding-left",
                    "margin-top", "margin-right", "margin-bottom", "margin-left",
                    "border-bottom-width", "border-left-width", "border-right-width", "border-top-width",
                    "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"
                ]

                let defaultStyle = {};

                for(let component of root.components){
                    for(let property of component.properties){
                        
                        if(property.changeStyle){
                            if(typeof component.value[property.name] == "object" && component.value[property.name]?.hex)
                                defaultStyle[property.changeStyle.styleVue] = component.value[property.name].hex;
                            else if(typeof component.value[property.name] == "object" && component.value[property.name]?.src)
                                defaultStyle[property.changeStyle.styleVue] = component.value[property.name].src;
                            else if(component.value[`${property.name}Sufix`]){
                                switch(component.value[`${property.name}Sufix`]){
                                    case "px":
                                    case "em":
                                    case "%":
                                        defaultStyle[property.changeStyle.styleVue] = component.value[property.name] + component.value[`${property.name}Sufix`];
                                    break;
                                    default:
                                        defaultStyle[property.changeStyle.styleVue] = component.value[`${property.name}Sufix`];
                                    break;
                                }
                            } 
                            else if(!component.value[`${property.name}Sufix`] && stylePixel.includes(property.changeStyle.style)){
                                defaultStyle[property.changeStyle.styleVue] = component.value[property.name] + "px";
                            } 
                            else
                                defaultStyle[property.changeStyle.styleVue] = component.value[property.name] + ((property.changeStyle.subfix) ? property.changeStyle.subfix : '');
                        }
                    }
                }

                finalStyles = defaultStyle;

                if(finalStyles){
                    for(let key in finalStyles){
                        if(typeof finalStyles[key] == "string" && finalStyles[key].includes("http") && !finalStyles[key].includes("url("))
                            finalStyles[key] = `url(${finalStyles[key]})`;

                        if(finalStyles[key] == "undefined")
                            finalStyles[key] = null;
                            
                        if(ignoreStyles.includes(key) && finalStyles[key])
                            delete finalStyles[key];
                    }
                }

                return finalStyles;
            }
            catch(e){}
        },

        update(){
            if(this.$refs.components){
                for(let component of this.$refs.components){
                    component.update(true);
                }
            }
        },

        contextmenu(){    
            console.log("contextmenu")        
            this.$refs.navbar.open(this.mouseHandler);
        },

        closeContextmenu(){
            this.$refs.navbar.close();
        },

        async addComponent(item, position){
            let defaultPosition = {}

            for(let componentsDafault of item.componentsDefaults) {
                if(componentsDafault.property == "left" || componentsDafault.property == "top") {
                    defaultPosition[componentsDafault.property] = parseInt(componentsDafault.value);
                }
            }

            this.componentIndex++;
            const offsetX = this.editorOffset.x - this.canvasOffset.x;
            const offsetY = this.editorOffset.y - this.canvasOffset.y; 

            const tmpComponent = { ...item };

            for(let property of tmpComponent.components){
                if(property.component == "Transform"){
                    property.value = property.default;
                    property.value.left = (typeof defaultPosition.left == "number") ? defaultPosition.left : (position.left + offsetX);
                    property.value.top = (typeof defaultPosition.top == "number") ? defaultPosition.top : (position.top + offsetY);
                }
                else{
                    property.value = property.default;
                }
            }

            if(this.state.componentOver){
                await this.addSubcomponent(this.state.componentOver.id, {
                    id: `${item.namespace}_${this.componentIndex}`,
                    ...tmpComponent,
                    position: { left: 0, top: 0 },
                    hierarchy: []
                }, this);
            }
            else{
                this.hierarchy.push({
                    id: `${item.namespace}_${this.componentIndex}`,
                    ...tmpComponent,
                    position: {
                        left: (typeof defaultPosition.left == "number") ? defaultPosition.left : (position.left + offsetX),
                        top: (typeof defaultPosition.top == "number") ? defaultPosition.top : (position.top + offsetY)
                    },
                    hierarchy: []
                });
            }

            this.saveState(true);
            this.selectItem(`${item.namespace}_${this.componentIndex}`);
        },

        move(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor?.getBoundingClientRect();

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
            const editorOffset = this.$refs.editor?.getBoundingClientRect();
            
            this.mouseHandler.top = clientY - editorOffset.y - 10;
            this.mouseHandler.left = clientX - editorOffset.x - 10;                
            
            if(this.moveEvent){      
                const { clientX, clientY, positionX, positionY } = this.moveStartPosition;
                const diffY = this.mouseHandler.top - clientY;
                const diffX = this.mouseHandler.left - clientX;       
                this.position = { x: positionX + diffX, y: positionY + diffY };
            }

            if(this.$refs.editor && this.$refs.editor.getBoundingClientRect)
                this.editorOffset = this.$refs.editor.getBoundingClientRect();

            if(this.$refs.canvas && this.$refs.canvas.getBoundingClientRect)
                this.canvasOffset = this.$refs.canvas.getBoundingClientRect();
        },

        async addSubcomponent(elementId, component, root){
            return new Promise(async (resolve, reject) => {
                if(root.hierarchy.length > 0){
                    for(let key in root.hierarchy){
                        if(root.hierarchy[key]){
                            if(root.hierarchy[key].id === elementId){
                                root.hierarchy[key].open = true;
                                root.hierarchy[key].hierarchy.push(component);
                                break;
                            }                            
                            else{
                                this.addSubcomponent(elementId, component, root.hierarchy[key]);
                            }
                        }
                    }

                    resolve();
                }
            });
        },

        handleDragEnd(event){
            if(this.moveEvent)
                this.moveEvent = false;

            this.dropComponent();
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

        centralize(){
            this.position = { x: 0, y: 0 };
            this.saveState();
        },

        async selectItem(idOrComponent){
            if(idOrComponent){
                const component =(typeof idOrComponent == "string") ? await this.getComponent(idOrComponent, this) : idOrComponent;

                if(component)
                    this.$emit("selectedItem", component);
            }
        },

        unselectItem(){
            this.closeContextmenu();
            this.$emit("unselectItem");
        },

        getValue(){
            return {
                settings: this.settings,
                scale: this.scale,
                position: this.position,
                viewport: this.viewport,
                body: this.body,
                hierarchy: this.hierarchy.filter((item) => item),
                componentIndex: this.componentIndex
            }
        },

        async onDelete(){
            if(this.selectedComponent){                
                await this.removeComponent(this.selectedComponent.id, this);
                this.$emit("unselectItem");
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

        dropComponent(){            
            this.state.hierarchy.ghost = null;
        }, 

        saveState(emit = false){
            localStorage.setItem(`page-${this.tab.name.replace(/\./, "-")}`, JSON.stringify(this.getValue()));

            if(emit)
                this.$emit("changeState", this.getValue());

            this.$forceUpdate();
        }
    }
}
</script>
