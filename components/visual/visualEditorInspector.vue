<template>
    <div 
        class="bg-neutral-800/80 h-full w-full overflow-hidden overflow-y-auto border-l-2 border-black" 
    >
        <div v-if="component">
            <div class="bg-neutral-800 p-2 flex">
                <div class="mr-2">
                    <div class="h-10 w-10 text-3xl align-middle text-center">
                        <client-only>
                            <font-awesome-icon icon="fa-solid fa-cube" />
                        </client-only>
                    </div>
                </div>

                <div class="flex flex-col w-full">
                    <div class="flex flex-1">
                        <div class="mr-2">
                            <input 
                                id="visibility" 
                                type="checkbox" 
                                v-model="component.visibility"
                                class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            >
                        </div>

                        <div class="w-full p-0.5">
                            <input  
                                class="bg-neutral-900 border border-black text-white px-1 h-6 text-sm w-full rounded-sm" 
                                type="text" 
                                v-model="component.label"
                                @keyup="changeProperty(component)" 
                                @change="changeProperty(component)"
                            />
                        </div>
                    </div>

                    <div class="flex">
                        <div class="mr-3 flex pt-1.5">
                            <input 
                                id="static" 
                                type="checkbox" 
                                v-model="component.static"
                                class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            >

                            <label for="static" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Static</label>
                        </div>

                        <div class="flex pt-1.5">
                            <input 
                                id="lockBox" 
                                type="checkbox" 
                                v-model="component.lockBox"
                                class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            >

                            <label for="lockBox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Lock Viewport</label>
                        </div>
                    </div>

                    <div class="flex w-full mt-2">                        
                        <label for="layer" class="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-400 mr-2">{{ $t("Layer") }}</label>
                        
                        <select 
                            id="layer" 
                            v-model="component.layer" 
                            class="bg-neutral-900 border border-black text-white px-1 h-6 w-full rounded-sm"
                        >
                            <option selected>Choose a country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="FR">France</option>
                            <option value="DE">Germany</option>
                        </select>                        
                    </div>
                </div>
            </div>

            <div v-for="(subComponent, key) in component.components" :key="key">
                <div class="bg-neutral-900 hover:bg-black border-b border-black">
                    <div class="flex flex-1 p-1" @click="toggle(subComponent)">
                        <div class="pr-1 pl-1 w-6" >
                            <client-only>
                                <font-awesome-icon icon="fa-solid fa-angle-down" v-if="subComponent.open" />
                                <font-awesome-icon icon="fa-solid fa-angle-right" v-if="!subComponent.open" />
                            </client-only>
                        </div>

                        <div class="pr-2">
                            <client-only>
                                <font-awesome-icon :icon="subComponent.icon" />
                            </client-only>
                        </div>

                        <div class="pr-2">
                            {{ subComponent.component }}
                        </div>
                    </div>            
                </div>

                <div class="bg-neutral-800 w-full border-b border-black text-sm text-neutral-400" v-if="subComponent.open">
                    <div class="py-2">
                        <div 
                            class="flex" 
                            v-for="(property, keySubcomponent) in subComponent.properties"
                            :key="keySubcomponent"
                        >
                            <div v-if="property.type == 'BigText'" class="w-full p-2">
                                <textarea 
                                    v-model="subComponent.value[property.name]"
                                    v-if="property.type == 'BigText'"
                                    class=" w-full h-56 p-1 bg-neutral-900 border-black"
                                    placeholder="Text..."
                                ></textarea>
                            </div>
                            <div v-else class="flex-1 flex p-0.5 pr-2">
                                <div class="w-3/6 h-7">
                                    <div class="ml-4 text-sm mt-1">{{ uppercaseFirstLetter(property.name) }}</div>
                                </div>

                                <div class="w-3/6 h-7">     
                                    <div v-if="subComponent.metadata && subComponent.metadata[property.name]">
                                        <select 
                                            class="bg-neutral-900 border border-black text-white px-1 h-7 w-full rounded-sm"
                                            v-model="subComponent.value[property.name]"
                                            @change="changeProperty(component)"
                                        >
                                            <option 
                                                v-for="(option, key) in subComponent.metadata[property.name]" 
                                                :key="key" 
                                                :value="option" 
                                                :selected="(subComponent?.value[property.name] || property.default) == option"
                                            >{{ option }}</option>
                                        </select>
                                    </div>
                                    <input 
                                        v-else-if="property.type == 'String' || property.type == 'string'" 
                                        class="bg-neutral-900 border border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
                                        type="text" 
                                        v-model="subComponent.value[property.name]"
                                        @keyup="changeProperty(component)" 
                                        @change="changeProperty(component)"
                                    />
                                    <input 
                                        v-else-if="property.type == 'number' || property.type == 'Number' || property.type == 'Int'" 
                                        class="bg-neutral-900 border border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
                                        type="number" 
                                        v-model="subComponent.value[property.name]"
                                        @keyup="changeProperty(component)" 
                                        @change="changeProperty(component)"
                                    />
                                    <div v-else-if="property.type == 'boolean' || property.type == 'Boolean' || property.type == 'Bool'" class="text-white pt-1">
                                        <label :for="property.name" class="relative items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                v-model="subComponent.value[property.name]" 
                                                :id="property.name" 
                                                class="sr-only peer"
                                                @change="changeProperty(component)"
                                            >
                                            <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full p after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div v-else-if="property.type == 'range' || property.type == 'Range'" class="flex h-6">
                                        <div class="w-4/6 mr-2">
                                            <input      
                                                v-model="subComponent.value[property.name]"                                   
                                                id="default-range" 
                                                type="range" 
                                                :min="property.default?.min" 
                                                :max="property.default?.max"
                                                :step="property.default?.step"
                                                class="w-full h-1 bg-gray-200 rounded-lg appearance-none range-sm cursor-pointer dark:bg-gray-700"
                                                @change="changeProperty(component)"
                                            >
                                        </div>
                                        <div class="w-2/6">
                                            <input 
                                                v-model="subComponent.value[property.name]" 
                                                class="bg-neutral-900 border border-black text-white px-1 h-6 text-sm w-full rounded-sm" 
                                                type="number"
                                                @change="changeProperty(component)"
                                            />
                                        </div>
                                    </div>                                  
                                    <div v-else-if="property.type == 'object' || property.type == 'Object' || property.type == 'JSON'">
                                        <div class="flex flex-row">
                                            <div>
                                                <Tooltip :tooltipText="$t('Edit')" position="right">
                                                    <button class="ml-2 hover:text-neutral-500" @click="$emit('openObjectEdit', subComponent, property, keyItem)">
                                                        <client-only><font-awesome-icon icon="fa-solid fa-edit" /></client-only>
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="m-auto mt-2 w-full text-center text-sm text-neutral-400">
                <button
                    class="bg-neutral-800 hover:bg-neutral-700 p-1 px-6 border border-black rounded-sm"
                > 
                    {{ $t("Add Component") }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
import globalMixin from "@/mixins/globalMixin";
export default {
    mixins : [globalMixin],

    props: {
        component: { type: Object },
        width: { 
            type: Number, 
            default: 300 
        }
    },

    watch:{
        component(){
            this.refreshToggles();
        }
    },

    mounted(){
        this.refreshToggles();
    },

    methods: {
        refreshToggles(){
            if(this.component){
                for(let key in this.component.components){
                    if(!this.component.components[key].open && this.component.components[key].open !== false)
                        this.component.components[key].open = true;

                    if(this.component.components[key] && this.component.components[key].value){
                        if(this.component.components[key].default)
                            this.component.components[key].value = { ...this.component.components[key].default, ...this.component.components[key].value };
                        else 
                        this.component.components[key].value = null;
                    }

                    for(let keyValue in this.component.components[key].value){
                        if(typeof this.component.components[key].value[keyValue] == "object" && this.component.components[key].value[keyValue].default)
                            this.component.components[key].value[keyValue] = this.component.components[key].value[keyValue].default
                    }
                }
            }  
        },

        toggle(component){
            component.open = !component.open;
        },

        changeProperty(component){
            this.$emit('changeProperty', component);    
        }
    }
}
</script>