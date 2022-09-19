<template>
    <client-only>
        <!-- eslint-disable -->
        <vue-drag-resize  
            :style="style"
            :initW="dimensions.width" 
            :initH="dimensions.height"
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
                <div ref="component">
                    <client-only placeholder="Loading...">
                        <dynamic-renderer 
                            v-if="settings" 
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
            position: { top: 0, left: 0, scale: 1, position: "absolute", zIndex: 1 },
            dimensions: { width: 0, height: 0, widthAuto: false, heightAuto: false },
            componentsIndex: {},
            resizeData: null,
            style: {},
            transformComponent: null,
            dimensionsComponent: null
        }
    },

    watch: {
        settings() {
            this.update();
        },
        
        dimensions(){
            this.update(false);
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
            let defaultStyle = {
                position: this.position.position,
                width: (this.dimensions.widthAuto) ? 'auto' : `${this.dimensions.width}px`, 
                height: (this.dimensions.heightAuto) ? 'auto' : `${this.dimensions.height}px`,
                top: `${this.position.top}px`, 
                left: `${this.position.left}px`, 
                transform: `scale(${this.position.scale})`,
                visibility: this.settings.visibility ? 'visible' : 'hidden',
                zIndex: this.position.zIndex
            };

            if(updateSubComponents){
                for(let component of this.settings.components){
                    for(let property of component.properties){
                        
                        if(property.changeStyle){
                            if(property.name == "color")
                                defaultStyle[property.changeStyle.styleVue] = component.value[property.name].hex;
                            else
                                defaultStyle[property.changeStyle.styleVue] = component.value[property.name] + ((property.changeStyle.subfix) ? property.changeStyle.subfix : '');
                        }
                    }
                }

                this.style = defaultStyle;
            }
            else {
                this.style = { ...this.style, ...defaultStyle };
            }
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
                        this.position = this.settings.position;                
                    else if(this.transformComponent.value)
                        this.position = this.transformComponent.value;
                    
                    if(!this.transformComponent.value)
                        this.transformComponent.value = this.position;
                }

                //Dimensions
                this.dimensionsComponent = this.getSubcomponent("Dimensions");

                if(this.dimensionsComponent){
                    if(this.dimensionsComponent.value)
                        this.dimensions = this.dimensionsComponent.value;
                    else if(this.dimensionsComponent.default)
                        this.dimensions = this.dimensionsComponent.default;
                        
                    if(!this.dimensionsComponent.value)
                        this.dimensionsComponent.value = this.dimensions;
                }

                //Parse values
                for(let key in this.settings.components){
                    const component = this.settings.components[key];

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
                    w: this.dimensions.width,
                    h: this.dimensions.height,
                    x: this.position.left,
                    y: this.position.top,
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
                    positionX: this.position.left,
                    positionY: this.position.top
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
                this.position.left = positionX + diffX;
                this.position.top = positionY + diffY;
            }
        },

        handleDragEnd(event){
            if(this.moveEvent){
                this.moveEvent = false;
                this.getSubcomponent("Dimensions").value = this.dimensions;
                this.getSubcomponent("Transform").value = this.position;
                this.$emit('changeState');
            } 
        },

        resizeOrMove(newRect, updateComponent){
            if(newRect.x && newRect.y) { 
                if(updateComponent){
                    this.transformComponent.value.left = newRect.x;
                    this.transformComponent.value.top = newRect.y;
                }               
                
                this.position.left = newRect.x;
                this.position.top = newRect.y;
                this.updateComponentStyle(false);
            }                
             
            if(newRect.w && newRect.h){       
                if(updateComponent){         
                    this.dimensionsComponent.value.width = newRect.w;
                    this.dimensionsComponent.value.height = newRect.h;
                }

                this.dimensions.width = newRect.w;
                this.dimensions.height = newRect.h;
                this.updateComponentStyle(false);
            }    
            
            this.selectItem(this.settings.id);
        }
    }
}
</script>