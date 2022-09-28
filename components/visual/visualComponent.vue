<template>
    <client-only>
        <!-- eslint-disable -->
        <vue-drag-resize  
            :style="{ 
                position: (transform.position) ? transform.position : '' ,
                width: returnValueWithSuffix('width', transform),
            }"
            :initH="parseInt(transform.height)"
            :minW="16"
            :minH="16"
            v-model:x="resizeData.x"
            v-model:y="resizeData.y"
            v-model:w="resizeData.w"
            v-model:h="resizeData.h"
            v-model:active="resizeData.active"                  
            :draggable="!settings.static && selectedComponent?.id == settings.id"
            :resizable="!settings.static && selectedComponent?.id == settings.id"
            :parent="settings.lockBox"
            @mouseover.stop="() => { state.componentOver  = settings }"
            @mouseleave="() => { state.componentOver = null }"
            @dragging="(d) => resizeOrMove(d, false)"
            @resizing="(d) =>resizeOrMove(d, false)"
            @resize-end="(d) =>resizeOrMove(d, true)"
            @drag-end="(d) => resizeOrMove(d, true)"            
            v-if="settings && resizeData"
        > 
            <div             
                v-if="resizeData"
                :class="[
                    (selectedComponent?.id == settings.id) ? 'border-red-300' : 'border-purple-200 hover:border-purple-500 border-dashed',
                    (settings.metadata.moveble && !settings.static) ? 'cursor-move' : '',
                    'border w-full h-full relative overflow-hidden'
                ]"
                :title="settings.id"
            >     
                <div ref="component" class="w-full h-full relative">
                    <client-only placeholder="Loading...">
                        <dynamic-renderer 
                            v-if="settings && style" 
                            class="w-full h-full absolute"
                            :style="style"
                            :component="settings"
                        >
                            <template v-if="settings?.hierarchy">  
                                <div>                     
                                    <visual-component 
                                        v-for="(subcomponent, key) in settings?.hierarchy" 
                                        :key="key" 
                                        :componentIndex="key"
                                        :settings="subcomponent"
                                        :editorOffset="editorOffset"
                                        :selectedComponent="selectedComponent"
                                        :tab="tab"
                                        @selectItem="$emit('selectItem', subcomponent?.id)"
                                        @saveState="$emit('saveState')"
                                    ></visual-component>
                                </div>  
                            </template>
                        </dynamic-renderer>
                    </client-only>
                </div>
            </div>
        </vue-drag-resize>
    </client-only>
</template>

<style>
.vdr-handle{
    z-index: 500;
}
</style>

<script>
import { useStateStore } from "~~/store/state.store";

export default {
    name: 'Component',

    props: {
        tab: { type: Object },
        selectedComponent: { 
            type: Object,
            default: null 
        },
        editorOffset: {
            type: Object,
            required: true
        },  
        componentIndex: {
            type: Number,
            required: true,
            default: 0
        },
        settings: {
            type: Object,
            default: {}
        }
    },

    data(){
        return {
            state: useStateStore(),
            moveble: false,
            moveEvent: false,
            position: { top: 0, left: 0, scale: 1, position: "absolute", zIndex: 1, rotate: 0 },
            componentsIndex: {},
            resizeData: { w: 0, h: 0, x: 0, y: 0, active: false },
            style: {},
            transformComponent: null
        }
    },

    watch: {
        settings() {
            this.update();
        },
        
        selectedComponent(){
            this.update(false);
        }
    },

    mounted(){
        this.update(true);
    },

    methods: {
        updateComponentStyle(updateSubComponents = true){
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

                let defaultStyle = {
                    width: (this.transform.widthAuto) ? 'auto' : `${this.transform.width}px`, 
                    height: (this.transform.heightAuto) ? 'auto' : `${this.transform.height}px`,
                    transform: `scale(${this.transform.scale}) rotate(${this.transform.rotate}deg)`,
                    visibility: this.settings.visibility ? 'visible' : 'hidden',
                    zIndex: this.transform.zIndex
                };

                if(updateSubComponents){
                    for(let component of this.settings.components){
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
                }
                else {
                    finalStyles = { ...this.style, ...defaultStyle };
                }

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

                if(finalStyles)
                    this.style = finalStyles;
            }
            catch(e){}
            
        },

        update(updateStyle = true){
            try{
                if(this.settings){
                    if(!this.settings.label)
                        this.settings.label = this.settings.id || "";
                        
                    if(!this.settings.visibility && this.settings.visibility != false)
                        this.settings.visibility = true;

                    if(!this.settings.static && this.settings.static != false)
                        this.settings.static = false;

                    if(!this.settings.lockBox && this.settings.lockBox != false)
                        this.settings.lockBox = true;

                    for(let key in this.settings.components)
                        this.componentsIndex[this.settings.components[key].component] = key;
                                
                    //Transform
                    this.transformComponent = this.getSubcomponent("Transform");

                    if(this.transformComponent){
                        if(this.settings.position && !this.transformComponent.value)
                            this.transform = this.settings.position;                
                        else if(this.transformComponent.value)
                            this.transform = this.transformComponent.value;
                        
                        if(!this.transformComponent.value)
                            this.transformComponent.value = this.transform;
                    }

                    //Parse values
                    for(let key in this.settings.components){
                        const component = this.settings.components[key];

                        if((
                            component.component === "Class" ||
                            component.component === "Transform" ||
                            component.component === "Border" || 
                            component.component === "Background" ||
                            component.component === "Font") && 
                            !component.open && component.open !== true
                        )
                            component.open = false;

                        if(this.settings.componentsDafaults?.length > 0){
                            for(let componentDefault of this.settings.componentsDafaults){
                                if(componentDefault.component == component.component?.toLowerCase()){
                                    component.default[componentDefault.property] = componentDefault.value;
                                }
                            }
                        }

                        if(!this.settings.components[key].value)
                            this.settings.components[key].value = (component.default) ? component.default : {};
                    
                        this.settings[this.settings.components[key].component] = this.settings.components[key].value;
                    }

                    this.resizeData = {
                        w: parseInt(this.transform.width),
                        h: parseInt(this.transform.height),
                        x: parseInt(this.transform.left),
                        y: parseInt(this.transform.top),
                        active: (this.selectedComponent?.id == this.settings.id)
                    }

                    if(updateStyle)
                        this.updateComponentStyle();
                        
                    this.$forceUpdate();
                    this.$nextTick();
                }
            }
            catch(e){}
        },

        getSubcomponentIndex(namespace){
            return (this.componentsIndex[namespace]) ? this.componentsIndex[namespace] : null;
        },

        getSubcomponent(namespace){
            return (this.componentsIndex[namespace]) ? this.settings.components[this.componentsIndex[namespace]] : null;
        },

        handleStart(event){
            if(this.moveble){   
                const { clientX, clientY } = event;

                this.moveStartPosition = { 
                    left: clientX, 
                    top: clientY,
                    positionX: this.transform?.left,
                    positionY: this.transform?.top
                };

                this.moveEvent = true;
            }
        },

        handleDrag(event){
            const { clientX, clientY } = event;
               
            if(this.moveEvent){      
                const { left, top, positionX, positionY } = this.moveStartPosition; 
                const diffX = clientX - left;
                const diffY = clientY - top;  
                this.transform.left = positionX + diffX;
                this.transform.top = positionY + diffY;
            }
        },

        handleDragEnd(event){
            if(this.moveEvent){
                this.moveEvent = false;
                this.getSubcomponent("Transform").value = this.transform;
                this.$emit('changeState');
            } 
        },

        returnValueWithSuffix(namespace, data){
            const sufix = data[`${namespace}Sufix`] || 'px';

            switch(sufix){
                case "px":
                case "em":
                case "%":
                case "rem": return `${data[namespace]}${sufix}`;
                default : return sufix;
            }
        },

        resizeOrMove(newRect, updateComponent) {
            if(newRect.x && newRect.y) { 
                if(updateComponent){
                    this.transformComponent.value.left = newRect.x;
                    this.transformComponent.value.top = newRect.y;
                }               
                
                this.transform.left = newRect.x;
                this.transform.top = newRect.y;
                this.updateComponentStyle(false);
            }                
             
            if(newRect.w && newRect.h){       
                if(updateComponent){         
                    this.transformComponent.value.width = newRect.w;
                    this.transformComponent.value.height = newRect.h;
                }

                this.transform.width = newRect.w;
                this.transform.height = newRect.h;
                this.updateComponentStyle(false);
            }    
           
            this.$emit('selectItem', this.settings.id);
        }
    }
}
</script>