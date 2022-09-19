<template>
    <client-only>
        <!-- eslint-disable -->
        <vue-drag-resize  
            :style="{ 
                position: position.position,
                width: (dimensions.widthAuto) ? 'auto' : `${dimensions.width}px`, 
                height: (dimensions.heightAuto) ? 'auto' : `${dimensions.height}px`,
                top: `${position.top}px`, 
                left: `${position.left}px`, 
                transform: `scale(${position.scale})`,
                visibility: settings.visibility ? 'visible' : 'hidden',
                zIndex: position.zIndex, 
            }"
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
            @resizing="resizeOrMove"
            @dragging="resizeOrMove"
            @click.stop="selectItem(settings?.id)"
            v-if="settings"
        > 
            <div 
                :class="[
                    (selectedComponent?.id == settings.id) ? 'bg-orange-500' : 'border-purple-300',
                    'absolute -top-5 px-2 text-sm rounded-t-md'
                ]" 
                style="font-size: 10px"
            >
                {{ settings?.label }}
            </div>

            <div             
                v-if="resizeData"
                :class="[
                    (selectedComponent?.id == settings.id) ? 'border-red-300' : 'border-purple-300 hover:border-purple-500 border-dashed',
                    (settings.metadata.moveble && !settings.static) ? 'cursor-move' : '',
                    'text-black border w-full h-full'
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
            resizeData: null
        }
    },

    watch: {
        settings() {
            this.update();
        },
        
        dimensions(){
            this.update();
        },

        selectedComponent(){
            this.update();
        }
    },

    mounted(){
        this.update();
    },

    methods: {
        update(){
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
                const transformComponent = this.getSubcomponent("Transform");

                if(transformComponent){
                    if(this.settings.position && !transformComponent.value)
                        this.position = this.settings.position;                
                    else if(transformComponent.value)
                        this.position = transformComponent.value;
                    
                    if(!transformComponent.value)
                        transformComponent.value = this.position;
                }

                //Dimensions
                const dimensionsComponent = this.getSubcomponent("Dimensions");

                if(dimensionsComponent){
                    if(dimensionsComponent.value)
                        this.dimensions = dimensionsComponent.value;
                    else if(dimensionsComponent.default)
                        this.dimensions = dimensionsComponent.default;
                        
                    if(!dimensionsComponent.value)
                        dimensionsComponent.value = this.dimensions;
                }

                //Parse values
                for(let key in this.settings.components){
                    const component = this.settings.components[key];

                    if(this.settings.componentsDafaults?.length > 0){
                        for(let componentDefault of this.settings.componentsDafaults){
                            if(componentDefault.component == component.component.toLowerCase()){
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

        resizeOrMove(newRect){
            if(newRect.x && newRect.y) {
                const transformComponent = this.getSubcomponent("Transform");
                transformComponent.value.left = newRect.x;
                transformComponent.value.top = newRect.y;
                this.position.left = newRect.x;
                this.position.top = newRect.y;
            }                
             
            if(newRect.w && newRect.h){
                const transformComponent = this.getSubcomponent("Dimensions");
                transformComponent.value.width = newRect.w;
                transformComponent.value.height = newRect.h;
                this.dimensions.width = newRect.w;
                this.dimensions.height = newRect.h;
            }                
        }
    }
}
</script>