<template>
    <div class="py-2" v-if="subComponent && subComponent.properties && subComponent.properties.length > 0">                            
        <div 
            class="flex" 
            v-for="(property, keySubcomponent) in subComponent.properties"
            :key="keySubcomponent"
            @click="$emit('selectInput', { property, subComponent })"
        >
            <div class="flex flex-1" v-if="component.namespace !== 'Body' || isBodyHiddenProperty(property.name)">
                <div v-if="property.type == 'BigText'" class="w-full p-2">
                    <inspector-big-text 
                        v-model="subComponent.value[property.name]"                                             
                        @changeValue="changeProperty"
                    />
                </div>
                <div v-else class="flex-1 flex p-0.5">
                    <div class="w-3/6 h-7 flex ml-1 z-10">
                        <div class="mt-1" v-if="subComponent && subComponent.metadata && subComponent.metadata[`${property.name}Help`]">
                            <Tooltip :tooltipText="$t('Help')" position="right">
                                <a :href="subComponent.metadata[`${property.name}Help`]" target="_blank" class="text-sm ml-1 hover:bg-neutral-600">
                                    <font-awesome-icon icon="fa-solid fa-circle-question" />
                                </a>
                            </Tooltip>
                        </div>

                        <div class="ml-2 text-sm mt-1">{{ property.label.replace('Border ', '') || uppercaseFirstLetter(property.name) }}</div>
                    </div>

                    <div class="h-7 pr-2 w-3/6">
                        <inspector-dynamic-type
                            v-if="component?.editor && component.editor[subComponent.component] && component.editor[subComponent.component][property.name]"
                            :component="{ ...component.editor[subComponent.component][property.name], value: subComponent.value[property.name] }"
                            :defaultValue="subComponent.value[property.name]"
                            @changeValue="(v) => { 
                                subComponent.value[property.name] = v;
                                changeProperty(); 
                            }"
                        />                                            
                        <inspector-icon
                            v-else-if="property.type == 'IconType'"
                            v-model="subComponent.value[property.name]"
                            @changeValue="changeProperty"                                               
                        />
                        <inspector-selector-metadata
                            v-else-if="subComponent.metadata && subComponent.metadata[property.name]"
                            v-model="subComponent.value[property.name]"
                            :metadata="subComponent.metadata[property.name]"
                            @changeValue="(v) => {
                                subComponent.value[property.name] = v;
                                changeProperty();
                            }"
                        />
                        <inspector-pixel-property 
                            v-else-if="proprityPixel.includes(property.name)" 
                            v-model="subComponent.value[property.name]"
                            :sufix="subComponent.value[`${property.name}Sufix`]"
                            :property="property.name"
                            @changeValue="(v) => {
                                subComponent.value[property.name] = v;
                                changeProperty()
                            }"
                            @changeSufix="(v) => {
                                subComponent.value[`${property.name}Sufix`] = v;
                                changeProperty()
                            }"
                        />
                        <inspector-string
                            v-else-if="property.type == 'String' || property.type == 'string'" 
                            v-model="subComponent.value[property.name]"
                            @changeValue="changeProperty"
                        />
                        <inspector-number
                            v-else-if="property.type == 'number' || property.type == 'Number' || property.type == 'Int'"
                            v-model="subComponent.value[property.name]"
                            @changeValue="changeProperty"
                        />
                        <inspector-bool
                            v-else-if="property.type == 'boolean' || property.type == 'Boolean' || property.type == 'Bool'"
                            v-model="subComponent.value[property.name]"
                            :id="property.name"
                            @changeValue="changeProperty"
                        />
                        <inspector-ranger   
                            v-else-if="property.type == 'range' || property.type == 'Range'"
                            v-model="subComponent.value[property.name]"    
                            :min="property.default?.min" 
                            :max="property.default?.max"
                            :step="property.default?.step"
                            @changeValue="changeProperty"
                        />                                
                        <inspector-object
                            v-else-if="property.type == 'object' || property.type == 'Object' || property.type == 'JSON'"
                            @openObjectEdit="$emit('openObjectEdit', subComponent, property, keyItem)"
                        />
                        <inspector-color
                            v-else-if="property.type == 'color' || property.type == 'Color'"
                            v-model="subComponent.value[property.name]"
                            :defaultValue="property.default?.hex"
                            @changeValue="(v) => {
                                subComponent.value[property.name] = v;
                                changeProperty();
                            }"
                        />
                        <inspector-img
                            v-else-if="(property.type == 'image' || property.type == 'Image' || property.type == 'ImageType')"
                            v-model="subComponent.value[property.name]"
                            @changeValue="(v) => {
                                subComponent.value[property.name] = v;
                                changeProperty();
                            }"
                        />     
                        <inspector-component 
                            v-else
                            v-model="subComponent.value[property.name]"
                            :selectInput="selectInput"
                            :property="property"
                            :id="property.id"
                            @mouseup.stop="$emit('dropComponent', subComponent, property.name, property.type, component)"
                        /> 
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ["component", "subComponent", "selectInput", "eventSelectedVariation"],

    data(){
        return {
            proprityPixel: [
                "width", "height", "left", "top", "right", "bottom", "size",
                "borderWidthTop", "borderWidthRight", "borderWidthBottom", "borderWidthLeft",
                "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
                "marginTop", "marginRight", "marginBottom", "marginLeft",
                "borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth",
                "radiusTopLeft", "radiusTopRight", "radiusBottomLeft", "radiusBottomRight",
                "margin", "padding"
            ],
            hiddenBodyProperty: [
                "left", "top", "right", "bottom", "width", "height", "size",
                "zIndex", "scale", "rotate", 
                "radiusTopLeft", "radiusTopRight", "radiusBottomLeft", "radiusBottomRight",
            ]
        }
    },

    methods: {
        changeProperty() {
            this.$emit("changeProperty");
        },

        isBodyHiddenProperty(propertyName){
            if(!this.component.namespace == "Body")
                return true;
            else
                return !this.hiddenBodyProperty.includes(propertyName);
        }
    }
}
</script>