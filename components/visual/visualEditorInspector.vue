<template>
    <div 
        class="bg-neutral-800/80 h-full w-full overflow-hidden overflow-y-auto border-l-2 border-black" 
        @click="closeAllWindowOpened"
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
                </div>
            </div>

            <div class="bg-neutral-700 p-1 text-sm border-t border-b border-black">
                <select 
                    id="events" 
                    v-model="component.events" 
                    class="bg-neutral-900 border border-black text-neutral-300 px-1 h-6 rounded-sm w-full text-sm "
                    :placeholder="$t('Events')"
                >
                    <option :value="null"></option>

                    <option 
                        v-for="tab in events" 
                        :key="tab" 
                        :value="tab"
                        :selected="component.events == tab"
                    >{{ uppercaseFirstLetter(tab) }}</option>
                </select>  
            </div>

            <div v-if="component.components">
                <div v-for="(subComponent, key) in component.components" :key="key">
                    <div class="bg-neutral-900 hover:bg-neutral-700 border-b border-black flex justify-between">
                        <div class="flex flex-1 p-1 cursor-pointer" @click="toggle(subComponent)">
                            <div class="pr-1 pl-1 w-6 text-sm">
                                <client-only>
                                    <font-awesome-icon icon="fa-solid fa-angle-down" v-if="subComponent.open" />
                                    <font-awesome-icon icon="fa-solid fa-angle-right" v-if="!subComponent.open" />
                                </client-only>
                            </div>

                            <div class="pr-2 text-sm">
                                <client-only>
                                    <font-awesome-icon :icon="subComponent.icon || subComponent.metadata.icon" />
                                </client-only>
                            </div>

                            <div class="pr-2 text-sm">
                                {{ subComponent.component || subComponent.metadata.namespace }}
                            </div>
                        </div>   
                        
                        <div class="flex justify-end">
                            <!--<button class="mr-1 text-sm px-1 w-6 hover:bg-neutral-600">
                                <font-awesome-icon icon="fa-solid fa-circle-question" />
                            </button>-->

                            <Menu as="div" class="relative">
                                <div>
                                    <MenuButton class="mr-1 text-sm px-0.5 w-6 h-full pt-1.5 hover:bg-neutral-600">
                                        <font-awesome-icon icon="fa-solid fa-ellipsis-vertical" />
                                    </MenuButton>
                                </div>

                                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                                    <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-sm shadow-lg bg-neutral-800 text-neutral-100 border border-black py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <MenuItem v-slot="{ active }">
                                            <button 
                                                :disabled="subComponent.metadata.fixed || subComponent.fixed" 
                                                @click="removeComponent(key)" 
                                                :class="[
                                                    active && !subComponent.metadata.fixed && !subComponent.fixed ? 'bg-neutral-900' : '', 
                                                    subComponent.metadata.fixed || subComponent.fixed ? 'text-neutral-500 cursor-default' : '',
                                                    'block w-full px-4 py-2 text-sm text-neutral-100'
                                                ]"
                                            >
                                                {{ $t("Remove Component") }}
                                            </button>
                                        </MenuItem>
                                    </MenuItems>
                                </transition>
                            </Menu>
                        </div>
                    </div>

                    <div class="bg-neutral-800 w-full border-b border-black text-sm text-neutral-400" v-if="subComponent.open && subComponent.value">
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
                                        @keyup.stop="changeProperty(component)" 
                                        @change="changeProperty(component)"
                                    ></textarea>
                                </div>
                                <div v-else class="flex-1 flex p-0.5 ">
                                    <div class="w-3/6 h-7 flex">
                                        <div class="mt-1" v-if="subComponent && subComponent.metadata && subComponent.metadata[`${property.name}Help`]">
                                            <Tooltip :tooltipText="$t('Help')" position="right">
                                                <a :href="subComponent.metadata[`${property.name}Help`]" target="_blank" class="text-sm ml-1 hover:bg-neutral-600">
                                                    <font-awesome-icon icon="fa-solid fa-circle-question" />
                                                </a>
                                            </Tooltip>
                                        </div>

                                        <div class="ml-2 text-sm mt-1">{{ property.label || uppercaseFirstLetter(property.name) }}</div>
                                    </div>

                                    <div 
                                        class="w-3/6 h-7 pr-2" 
                                        v-if="subComponent"
                                    >  
                                        <div v-if="component?.editor && component.editor[subComponent.component] && component.editor[subComponent.component][property.name]">
                                            <client-only placeholder="Loading...">
                                                <dynamic-renderer 
                                                    v-if="component.editor[subComponent.component][property.name].content && subComponent.value[property.name]"
                                                    :component="component.editor[subComponent.component][property.name]"
                                                    :state="subComponent.value[property.name]"
                                                    @change="(v) => { 
                                                        subComponent.value[property.name] = v;
                                                        changeProperty(component) 
                                                    }"
                                                >
                                                </dynamic-renderer>
                                            </client-only>
                                        </div>   
                                        <div v-else-if="subComponent.metadata && subComponent.metadata[property.name]">
                                            <select 
                                                class="bg-neutral-900 border border-black text-white px-1 h-7 w-full rounded-sm"
                                                v-model="subComponent.value[property.name]"
                                                @change="changeProperty(component)"
                                            >
                                                <option :value="null"></option>
                                                
                                                <option 
                                                    v-for="(option, key) in subComponent.metadata[property.name]" 
                                                    :key="key" 
                                                    :value="option" 
                                                    :selected="(subComponent?.value[property.name] || property?.default) == option"
                                                >{{ option }}</option>
                                            </select>
                                        </div>
                                        <input 
                                            v-else-if="property.type == 'String' || property.type == 'string'" 
                                            class="bg-neutral-900 border border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
                                            type="text" 
                                            v-model="subComponent.value[property.name]"
                                            @keyup.stop="changeProperty(component)" 
                                            @change="changeProperty(component)"
                                        />
                                        <input 
                                            v-else-if="property.type == 'number' || property.type == 'Number' || property.type == 'Int'" 
                                            class="bg-neutral-900 border border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
                                            type="text" 
                                            v-model="subComponent.value[property.name]"
                                            @keyup.stop="changeProperty(component)" 
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
                                                    type="text"
                                                    @keyup.stop="changeProperty(component)"
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
                                        <div v-else-if="property.type == 'color' || property.type == 'Color'" class="text-white pt-1 h-full relative" @click.stop="() => {}">
                                            <div 
                                                class="border border-black h-full flex justify-end relative text-sm" 
                                                :style="{backgroundColor: subComponent.value[property.name].hex || property.default?.hex || '#FFFFFF'}"                                                                                             
                                            >
                                                <input 
                                                    class="border-0 w-full text-sm" 
                                                    type="text" 
                                                    v-model="subComponent.value[property.name].hex"                                                 
                                                    :style="{backgroundColor: (subComponent.value[property.name].hex || property.default?.hex || '#FFFFFF')}"
                                                    @change="changeProperty(component)" 
                                                    @input="changeProperty(component)" 
                                                    @click.prevent="property.open = true"
                                                />

                                                <div class="absolute top-6 z-50" v-if="property.open">
                                                    <Chrome v-model="subComponent.value[property.name]"></Chrome>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else-if="(property.type == 'image' || property.type == 'Image') && subComponent.value[property.name]">
                                            <div 
                                                class="border border-black h-full flex justify-end relative text-sm"                                                                                          
                                            >
                                                <input 
                                                    type="hidden" 
                                                    v-model="subComponent.value[property.name]" 
                                                    @change="changeProperty(component)" 
                                                    @input="changeProperty(component)" 
                                                />

                                                <input 
                                                    class="bg-neutral-900 border border-black text-white px-1 h-6 text-sm w-full rounded-sm"
                                                    type="text" 
                                                    v-model="subComponent.value[property.name].src"
                                                    @keyup.stop="() => {}"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="m-auto mt-2 w-full text-center text-sm text-neutral-400 mb-16">
                <button
                    class="bg-neutral-800 hover:bg-neutral-700 p-1 px-6 border border-black rounded-sm"
                    @click="toggleAddComponent"
                > 
                    {{ $t("Add Component") }}
                </button>

                <div class="border bg-neutral-800 border-black m-2 mb-10 h-96 flex flex-col" v-if="openedAddComponent">
                    <div class="border-b p-2 border-black w-full">
                        <input v-model="search" class="bg-neutral-900 w-full p-0 pl-2 text-sm rounded-md border border-neutral-700 focus:border-blue-600" type="text" :placeholder="$t('Search...')" />
                    </div>

                    <div class="bg-neutral-700 py-1 align-middle text-center">{{ $t("Component") }}</div>

                    <div class="overflow-y-scroll w-full h-full flex flex-1 p-1">
                        <visual-context-item 
                            :items="componentsCategories" 
                            :itemsFiltred="componentsFiltred" 
                            @addComponent="addComponent" 
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
* {
    scrollbar-width: auto;
    scrollbar-color: #171717 #000000;
}

*::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner {
    background: #1E1E1E;
}

*::-webkit-scrollbar-thumb {
    background-color: #383838;
    border-radius: 0px;
    border: 3px solid #383838;
    border-radius: 30px;
}

input{
    text-shadow: 1px 1px 2px black;
}
</style>

<script>
import globalMixin from "@/mixins/globalMixin";
import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild } from "@headlessui/vue";
import { Chrome } from '@ckpack/vue-color';

export default {
    mixins : [globalMixin],
    components: { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild, Chrome },

    props: {
        component: { type: Object },
        width: { 
            type: Number, 
            default: 300 
        }
    },

    data(){
        return {
            search: null,
            openedAddComponent: false,
            components: [],
            componentsCategories: {},
            componentsFiltred: [],
            events: ["checked", "default", "focus", "disabled", "fullscreen", "hover", "required"]
        }
    },

    watch:{
        component(){
            this.refreshToggles();

            if(this.component && this.component.editor){
                for(let key in this.component.editor){
                    for(let keyEditorProperty in this.component.editor[key]){
                        if(this.component.editor[key][keyEditorProperty].script){
                            try{
                                let script = null
                                eval("script = " + this.component.editor[key][keyEditorProperty].script)

                                this.component.editor[key][keyEditorProperty] = {
                                    content: this.component.editor[key][keyEditorProperty]?.content,
                                    style: this.component.editor[key][keyEditorProperty]?.style,
                                    ...script
                                }
                            }
                            catch(e){}
                        }
                    }
                }
            }
        },

        search(){
            this.filterComponents();
        }
    },

    async mounted(){
        this.refreshToggles();
        this.loadComponents();
    },

    methods: {
        async loadComponents(){
            this.components = await useApi(`visual/subcomponents`, { method: "GET" });
            this.sortComponentsCategories();
            this.$forceUpdate();
        },

        sortComponentsCategories() {
            for(let item of this.components){
                
                if(!this.componentsCategories[item.metadata.group])
                    this.componentsCategories[item.metadata.group] = [];
                
                this.componentsCategories[item.metadata.group].push(item);
            }

            this.componentsCategories = Object.keys(this.componentsCategories).sort().reduce(
                (obj, key) => { 
                    obj[key] = this.componentsCategories[key]; 
                    return obj;
                }, {}
            );

            this.$forceUpdate();
            this.$nextTick();
        },

        filterComponents(){
            if(this.search){
                this.componentsFiltred = this.components.filter(item => {
                    return item.namespace.toLowerCase().includes(this.search.toLowerCase());
                });
            }
            else{
                this.componentsFiltred = [];
            }
        },

        refreshToggles(){
            if(this.component){
                for(let key in this.component.components){
                    try{
                        if(!this.component.components[key].open && this.component.components[key].open !== false){
                            if(this.component.components[key].namespace === "Class")
                                this.component.components[key].open = false;
                            else
                                this.component.components[key].open = true;
                        }

                        if(this.component.components[key] && this.component.components[key]?.value){
                            if(this.component.components[key]?.default)
                                this.component.components[key].value = { ...this.component.components[key]?.default, ...this.component.components[key]?.value };
                            else 
                                this.component.components[key].value = null;
                        }

                        for(let keyValue in this.component.components[key]?.value){
                            if(typeof this.component.components[key].value[keyValue] == "object" && this.component.components[key].value[keyValue]?.default)
                                this.component.components[key].value[keyValue] = this.component.components[key].value[keyValue]?.default
                        }
                    }   
                    catch(e){}
                }
            }  
        },

        toggle(component){
            component.open = !component.open;
            this.$emit('changeState');
        },

        toggleAddComponent(){
            this.openedAddComponent = !this.openedAddComponent;
        },

        changeProperty(component){
            this.$emit('changeProperty', component);    
        },

        addComponent(component){
            this.$emit('addComponent', component);
            this.$emit('changeProperty', this.component);
            this.openedAddComponent = false;
        },

        removeComponent(key){
            this.$emit('removeComponent', key);
            this.$emit('changeProperty', this.component);
        },

        closeAllWindowOpened(){
            let closeWindow = false;

            for(let component of this.component.components){
                for(let property of component.properties){
                    if(property.open){
                        closeWindow = true;
                        property.open = false;
                    }
                }
            }

            if(closeWindow)
                this.changeProperty(this.component);
        }
    }
}
</script>