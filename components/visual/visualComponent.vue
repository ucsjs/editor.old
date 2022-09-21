<template>
    <client-only>
        <!-- eslint-disable -->
        <vue-drag-resize  
            :style="{ position: transform.position }"
            :initW="transform.width" 
            :initH="transform.height"
            :minW="50"
            :minH="30"
            v-model:x="resizeData.x"
            v-model:y="resizeData.y"
            v-model:w="resizeData.w"
            v-model:h="resizeData.h"
            v-model:active="resizeData.active"                  
            :draggable="!settings.static && selectedComponent?.id == settings.id"
            :resizable="!settings.static && selectedComponent?.id == settings.id"
            :parent="settings.lockBox"
            @mouseover.stop="() => {}"
            @dragging="(d) => resizeOrMove(d, false)"
            @resizing="(d) =>resizeOrMove(d, false)"
            @resize-end="(d) =>resizeOrMove(d, true)"
            @drag-end="(d) => resizeOrMove(d, true)"
            @click.stop="selectItem(settings?.id)"
            v-if="settings"
        > 
            <!--<div 
                :class="[
                    (selectedComponent?.id == settings.id) ? 'bg-orange-500' : 'border-purple-300',
                    'absolute -top-5 px-2 text-sm rounded-t-md'
                ]" 
                style="font-size: 10px"
            >
                {{ settings?.label }}
            </div>-->

            <div             
                v-if="resizeData"
                :class="[
                    (selectedComponent?.id == settings.id) ? 'border-red-300' : 'border-purple-300 hover:border-purple-500 border-dashed',
                    (settings.metadata.moveble && !settings.static) ? 'cursor-move' : '',
                    'border w-full h-full'
                ]"
            >     
                <div ref="component" class="w-full h-full">
                    <div class="w-full h-full absolute z-40"></div>
                    
                    <client-only placeholder="Loading...">
                        <dynamic-renderer 
                            v-if="settings" 
                            class="w-full h-full"
                            :style="style"
                            :component="settings"
                        >
                        </dynamic-renderer>
                    </client-only>
                </div>

                <visual-component 
                    v-for="(component, key) in settings.hierarchy" 
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
        </vue-drag-resize>
    </client-only>
</template>

<script>
export default {
    name: 'Component',

    props: {
        tab: { type: Object },
        selectedComponent: { type: Object },
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
            moveble: false,
            moveEvent: false,
            position: { top: 0, left: 0, scale: 1, position: "absolute", zIndex: 1, rotate: 0 },
            componentsIndex: {},
            resizeData: null,
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
        this.update();
    },

    methods: {
        updateComponentStyle(updateSubComponents = true){
            let finalStyles = null;

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
                            if(property.name == "color")
                                defaultStyle[property.changeStyle.styleVue] = component.value[property.name].hex;
                            else if(typeof component.value[property.name] == "object" && component.value[property.name].src)
                                defaultStyle[property.changeStyle.styleVue] =component.value[property.name].src;
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
                }
            }

            this.style = finalStyles;
        },

        update(updateStyle = true){
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

                    if(component.component === "Class" && !component.open && component.open !== true)
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
                    w: this.transform.width,
                    h: this.transform.height,
                    x: this.transform.left,
                    y: this.transform.top,
                    active: (this.selectedComponent?.id == this.settings.id)
                }

                if(updateStyle)
                    this.updateComponentStyle();
                    
                this.$forceUpdate();
                this.$nextTick();
            }
        },

        selectItem(id){
            this.$emit('selectItem', (id) ? id : this.settings.id);
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
                    positionX: this.transform.left,
                    positionY: this.transform.top
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

        resizeOrMove(newRect, updateComponent){
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
            
            this.selectItem(this.settings.id);
        }
    }
}
</script>