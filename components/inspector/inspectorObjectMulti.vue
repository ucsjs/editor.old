<template>
    <div class="w-full select-none">
        <div class="absolute top-0 right-0 w-72 bottom-0 bg-neutral-800/50 z-50" @click="close" v-if="windowOpened"></div>

        <div class="w-full border-t border-neutral-900 flex flex-col bg-neutral-800 px-0.5 py-1 mt-1">
            <div class="flex flex-1">
                <div class="w-3/6 h-7 flex ml-1 z-10">
                    <div class="mt-1" v-if="subComponent && subComponent.metadata && subComponent.metadata[`${property.name}Help`]">
                        <Tooltip :tooltipText="$t('Help')" position="right">
                            <a :href="subComponent.metadata[`${property.name}Help`]" target="_blank" class="text-sm ml-1 hover:bg-neutral-600">
                                <font-awesome-icon icon="fa-solid fa-circle-question" />
                            </a>
                        </Tooltip>
                    </div>

                    <div 
                        class="ml-2 text-sm mt-1 text-ellipsis overflow-hidden whitespace-nowrap w-[100px]"
                        :title="uppercaseFirstLetter(property.name)"
                    >
                        {{ property.label.replace('Border ', '') || uppercaseFirstLetter(property.name) }}
                    </div>
                </div>

                <div class="h-7 pr-2 w-3/6 flex">
                    <div class="flex flex-row flex-1">
                        
                    </div>

                    <div class="flex">
                        <button class="ml-2 mt-1 hover:text-neutral-500" @click="addItem">
                            <client-only><font-awesome-icon icon="fa-solid fa-plus" /></client-only>
                        </button>
                    </div>
                </div>
            </div>

            <div class="bg-neutral-900 flex flex-1 flex-col m-1 rounded-md">
                <div 
                    v-for="(item, key) in items" 
                    :key="key" 
                    :class="[
                        (item.visible) ? 'text-neutral-300' : 'text-neutral-500',
                        'p-1 px-2 text-sm flex flex-1 border border-neutral-800'
                    ]"
                >
                    <div class="h-5 overflow-hidden flex flex-1 cursor-default" style="font-size: 12px;" @click="selectItem(key)">
                        {{ property.changeStyle.style }}: 

                        {{ item.value.parsed }}
                    </div>

                    <div class="flex">
                        <button class="ml-2 hover:text-neutral-100" v-if="item.visible" @click="toggleVisible(key)">
                            <client-only><font-awesome-icon icon="fa-solid fa-eye" /></client-only>
                        </button>
                        <button class="ml-2 hover:text-neutral-100" v-else @click="toggleVisible(key)">
                            <client-only><font-awesome-icon icon="fa-solid fa-eye-slash" /></client-only>
                        </button>

                        <button class="ml-2 hover:text-neutral-100" @click="removeItem(key)">
                            <client-only><font-awesome-icon icon="fa-solid fa-trash" /></client-only>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div 
            v-if="windowOpened"
            class="bg-neutral-800 border border-black fixed z-50 rounded-sm shadow-md m-2 -mt-2" 
            style="width: 275px"
        >
            <inspector-item 
                :component="items[indexSelected]"
                :subComponent="items[indexSelected].component"
                @changeProperty="changeProperty"
            />
        </div>
    </div>
</template>

<script>
import globalMixin from "@/mixins/globalMixin";

export default {
    mixins: [globalMixin],

    props: ["modelValue", "subComponent", "property"],

    data(){
        return {
            windowOpened: false,
            indexSelected: null,
            items: []
        }
    },

    mounted(){
        this.items = (this.modelValue.items) ? this.modelValue.items : [];
    },

    methods: {
        addItem(){
            const value = this.parserFormatter(this.subComponent.metadata[this.property.default.formater], this.subComponent.metadata[this.property.default.defaults]);

            this.items.push({
                visible: true,
                value: value,
                namespace: this.property.name,
                component: this.generateComponent(value) 
            });

            this.indexSelected = this.items.length - 1;
            this.windowOpened = true;
        },

        toggleVisible(index){
            this.items[index].visible = !this.items[index].visible;
            this.changeProperty();
        },

        removeItem(index){
            this.items.splice(index, 1);
        },

        selectItem(index){
            this.indexSelected = index;
            this.windowOpened = true;
        },

        close(){
            this.windowOpened = false;
        },

        generateComponent(values){
            let component = {                
                properties: [],
                metadata: {},
                value: values.defaults
            };

            for(let key in this.property.default){
                if(key === "formater" || key === "defaults" || key === "multi") continue;

                component.properties.push({
                    name: key,
                    type: this.property.default[key],
                    namespace: this.property.name,
                });
            }

            return component;
        },

        parserFormatter(formater, defaults){
            let result = formater;
            let resultObject = {};
            let variables = formater.match(/{[a-zA-Z0-9]+}/g);
            let variablesSubObject = formater.match(/\{[a-zA-Z0-9]+\.[a-zA-Z0-9]+\}/g);
            
            for(let variable of variables){
                let variableName = variable.replace("{", "").replace("}", "");
                let variableValue = defaults[variableName];

                if(variableValue !== undefined){
                    result = result.replace(variable, variableValue);
                    resultObject[variableName] = variableValue;
                }                    
            }

            for(let variable of variablesSubObject){
                let variableName = variable.replace("{", "").replace("}", "");
                let variableValue = defaults[variableName.split(".")[0]][variableName.split(".")[1]];

                if(variableValue !== undefined){
                    result = result.replace(variable, variableValue);
                    resultObject[variableName] = variableValue;
                }
            }

            let conditions = result.match(/{{\?.*?}}(.*?){{\/.*?}}/g);
            
            if(conditions.length > 0){
                for(let condition of conditions){
                    try{
                        let conditionValue = [ ...condition.matchAll(/{{\?.*?}}(.*?){{\/.*?}}/g) ][0][1];
                    
                        if(conditionValue !== undefined)
                            result = result.replace(condition, conditionValue);
                        else
                            result = result.replace(condition, "");
                    }
                    catch(e){}
                }
            }

            resultObject.defaults = defaults;
            resultObject.formater = formater;
            resultObject.parsed = result;
            return resultObject;
        },

        processValue(items){
            let result = [];

            for(let item of items)
                if(item.visible)
                    result.push(item.value.parsed);
            
            return result.join(", ");
        },  

        changeProperty(){
            if(this.indexSelected !== null){
                const tmpValue = this.items[this.indexSelected].value;
                this.items[this.indexSelected].value = this.parserFormatter(tmpValue.formater, tmpValue.defaults);
                this.items[this.indexSelected].component = this.generateComponent(this.items[this.indexSelected].value);
            }

            this.$emit('update:modelValue', {
                multi: true,
                items: this.items,
                value: this.processValue(this.items),
            });

            this.$emit('changeValue');
        }
    }
}
</script>