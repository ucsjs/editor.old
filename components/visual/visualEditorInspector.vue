<template>
    <div 
        class="bg-neutral-800/80 h-full w-full overflow-hidden overflow-y-auto border-l-2 relative border-black" 
        @click="closeAllWindowOpened"
        @mouseup="dropComponent(null)"
    >
        <div v-if="component" class="relative min-h-screen">
            <div class="bg-neutral-900 border-b border-black text-lg font-bold p-2 uppercase text-center" v-if="eventSelectedLabel && event">
                {{ eventSelectedLabel }}
            </div>
            
            <div class="bg-neutral-800 p-2 flex" v-if="component.namespace !== 'Body' && !event">
                <div class="mr-2">
                    <div class="h-10 w-10 text-3xl align-middle text-center">
                        <client-only>
                            <font-awesome-icon icon="fa-solid fa-cube" />
                        </client-only>
                    </div>
                </div>

                <div class="flex flex-col w-full">
                    <div class="flex flex-1">
                        <div class="mr-2" v-if="component.namespace !== 'Body'">
                            <input 
                                id="visibility" 
                                type="checkbox" 
                                v-model="component.visibility"
                                class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                @change="changeProperty"
                            >
                        </div>

                        <div class="w-full p-0.5">
                            <input  
                                class="bg-neutral-900 border border-black text-white px-1 h-6 text-sm w-full rounded-sm" 
                                type="text" 
                                v-model="component.label"
                                :disabled="component.namespace == 'Body'"
                                @keyup="changeProperty" 
                                @change="changeProperty"
                            />
                        </div>
                    </div>

                    <div class="flex" v-if="component.namespace !== 'Body'">
                        <div class="mr-3 flex pt-1.5">
                            <input 
                                id="static" 
                                type="checkbox" 
                                v-model="component.static"
                                class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                @change="changeProperty"
                            >

                            <label for="static" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Static</label>
                        </div>

                        <div class="flex pt-1.5">
                            <input 
                                id="lockBox" 
                                type="checkbox" 
                                v-model="component.lockBox"
                                class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                @change="changeProperty"
                            >

                            <label for="lockBox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Lock Viewport</label>
                        </div>
                    </div>  
                </div>
            </div>

            <!-- Events -->
            <div 
                v-if="component.namespace !== 'Body' && !event"
                class="bg-neutral-900 border-t border-black text-sm justify-center flex"
            >
                <div class="flex mt-1 mr-2">
                    {{ $t('Events') }}
                </div>

                <div class="h-8">
                    <Tooltip tooltipText="Hover" position="top" class="h-8">
                        <button 
                            type="button" 
                            class="bg-neutral-800 h-8 relative inline-flex items-center border border-black px-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700 focus:z-10 focus:outline-none"
                            :title="$t('Hover')"
                            @click="changeEvent('hover')"
                        >
                            <client-only><font-awesome-icon icon="fa-solid fa-hand-pointer" /></client-only>
                        </button>
                    </Tooltip>
                    <Tooltip tooltipText="Checked" position="top" class="h-8">
                        <button 
                            type="button" 
                            class="bg-neutral-800 -ml-px h-8 relative inline-flex items-center border border-black px-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700 focus:z-10 focus:outline-none"
                            :title="$t('Checked')"
                            @click="changeEvent('checked')"
                        >
                            <client-only><font-awesome-icon icon="fa-regular fa-circle-dot" /></client-only>
                        </button>
                    </Tooltip>
                    <Tooltip tooltipText="Disabled" position="top" class="h-8">
                        <button 
                            type="button" 
                            class="bg-neutral-800 -ml-px h-8 relative inline-flex items-center border border-black px-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700 focus:z-10 focus:outline-none"
                            :title="$t('Disabled')"
                            @click="changeEvent('disabled')"
                        >
                            <client-only><font-awesome-icon icon="fa-solid fa-ban" /></client-only>
                        </button>
                    </Tooltip>
                    <Tooltip tooltipText="Enabled" position="top" class="h-8">
                        <button 
                            type="button" 
                            class="bg-neutral-800 -ml-px h-8 relative inline-flex items-center border border-black px-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700 focus:z-10 focus:outline-none"
                            :title="$t('Enabled')"
                            @click="changeEvent('enabled')"
                        >
                            <client-only><font-awesome-icon icon="fa-solid fa-check" /></client-only>
                        </button>
                    </Tooltip>
                    <Tooltip tooltipText="Focus" position="top" class="h-8">
                        <button 
                            type="button" 
                            class="bg-neutral-800 -ml-px h-8 relative inline-flex items-center border border-black px-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700 focus:z-10 focus:outline-none"
                            :title="$t('Focus')"
                            @click="changeEvent('focus')"
                        >
                            <client-only><font-awesome-icon icon="fa-solid fa-arrows-to-circle" /></client-only>
                        </button>
                    </Tooltip>
                    <Tooltip tooltipText="After" position="top" class="h-8">
                        <button 
                            type="button" 
                            class="bg-neutral-800 -ml-px h-8 relative inline-flex items-center border border-black px-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700 focus:z-10 focus:outline-none"
                            :title="$t('After')"
                            @click="changeEvent('after')"
                        >
                            <client-only><font-awesome-icon icon="fa-solid fa-diagram-predecessor" /></client-only>
                        </button>
                    </Tooltip>
                    <Tooltip tooltipText="Before" position="top" class="h-8">
                        <button 
                            type="button" 
                            class="bg-neutral-800 -ml-px h-8 relative inline-flex items-center border border-black px-2 text-sm font-medium text-neutral-100 hover:bg-neutral-700 focus:z-10 focus:outline-none"
                            :title="$t('Before')"
                            @click="changeEvent('before')"
                        >
                            <client-only><font-awesome-icon icon="fa-solid fa-diagram-successor" /></client-only>
                        </button>
                    </Tooltip>
                </div>
            </div>

            <!-- Viewport -->
            <div 
                v-if="component.namespace !== 'Body' && !event"
                class="bg-neutral-900 p-1 text-sm border-t border-b border-black flex justify-center"
            >
                <div class="flex">
                    <div class="mr-3 flex">
                        <input 
                            id="mobile" 
                            type="checkbox" 
                            v-model="component.smView"
                            class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            @change="changeProperty"
                        >

                        <label for="mobile" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">SM</label>
                    </div>
                </div>

                <div class="flex">
                    <div class="mr-3 flex">
                        <input 
                            id="tablet" 
                            type="checkbox" 
                            v-model="component.mdView"
                            class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            @change="changeProperty"
                        >

                        <label for="tablet" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">MD</label>
                    </div>
                </div>

                <div class="flex">
                    <div class="mr-3 flex">
                        <input 
                            id="desktop" 
                            type="checkbox" 
                            v-model="component.lgView"
                            class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            @change="changeProperty"
                        >

                        <label for="desktop" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">LG</label>
                    </div>
                </div>

                <div class="flex">
                    <div class="mr-3 flex">
                        <input 
                            id="xl" 
                            type="checkbox" 
                            v-model="component['xlView']"
                            class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            @change="changeProperty"
                        >

                        <label for="xl" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">XL</label>
                    </div>
                </div>

                <div class="flex">
                    <div class="mr-3 flex">
                        <input 
                            id="2xl" 
                            type="checkbox" 
                            v-model="component['2xlView']"
                            class="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                            @change="changeProperty"
                        >

                        <label for="2xl" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">2XL</label>
                    </div>
                </div>
            </div>

            <!-- Subcomponents -->
            <div v-if="component.components">
                <div v-for="(subComponent, key) in component.components" :key="key">
                    <div v-show="!(subComponent.component === 'Class' && component.metadata?.removeClass) && !(subComponent.component === 'Transform' && component.metadata?.removeTransform)">
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
                                    {{ subComponent.metadata.label || subComponent.component || subComponent.metadata.namespace }}
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
                            <inspector-item 
                                :component="component"
                                :subComponent="subComponent"
                                :selectInput="selectInput"
                                :eventSelectedVariation="eventSelectedVariation"
                                @changeProperty="changeProperty"
                                @selectInput="(v) => { selectInput = v }"
                                @dropComponent="(subComponent, propertyName, propertyType, component) => dropComponent(subComponent, propertyName, propertyType, component)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Component -->
            <div class="m-auto mt-2 w-full text-center text-sm text-neutral-400 mb-16" v-if="!eventSelectedVariation && !event">
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

            <!-- Event Inspector -->
            <div class="bg-transparent fixed top-0 left-0 bottom-0 right-0 z-50" v-if="eventSelectedVariation" @click="eventSelectedVariation = null"></div>

            <div 
                :class="[
                    (eventSelectedVariation) ? 'right-0' : '-right-96',
                    'bg-black/50 transition-all duration-500 w-full h-full absolute top-0  z-50'
                ]" 
                v-show="eventSelectedVariation"
            >
                <div 
                    class="absolute bg-black h-full top-0 right-0" 
                    :style="{width: `calc(100% - 20px)`, 'z-index': 1000}"
                >
                    <visual-editor-inspector 
                        ref="inspector"    
                        :componentsDefaults="components"               
                        :component="eventSelectedVariation"    
                        :event="true"    
                        :eventSelectedLabel="eventSelected"      
                        @changeProperty="() => {
                            eventsVariant[eventSelected] = { ...eventSelectedVariation };

                            if(!component.eventsVariant)
                                component.eventsVariant = {};

                            component.eventsVariant[eventSelected] = { ...eventSelectedVariation };
                            changeProperty();
                        }"          
                        @changeState="saveStateContents"                    
                    />
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
import ComponentsMixin from "@/mixins/components";
import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild } from "@headlessui/vue";
import { useStateStore } from "~/store/state.store";

export default {
    mixins : [globalMixin, ComponentsMixin],
    components: { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild },

    props: {
        component: { 
            type: Object,
            default: null 
        },
        componentsDefaults: { 
            type: Object,
            default: null 
        },
        width: { 
            type: Number, 
            default: 300 
        },
        event: {
            type: Boolean,
            default: false
        },
        eventSelectedLabel: {
            type: String,
            default: null
        }
    },

    data(){
        return {
            state: useStateStore(),
            search: null,
            selectInput: null,
            openedAddComponent: false,
            components: [],
            componentsCategories: {},
            componentsFiltred: [],            
            events: ["checked", "default", "focus", "disabled", "fullscreen", "hover", "required"],
            eventsVariant: {},
            eventSelected: null,
            eventSelectedVariation: null
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

            if(this.component?.eventsVariant)
                this.eventsVariant = this.component?.eventsVariant;
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
                            if(
                                this.component.components[key].namespace === "Class" ||
                                this.component.components[key].namespace === "Border" ||
                                this.component.components[key].namespace === "Background" ||
                                this.component.components[key].namespace === "Margin" ||
                                this.component.components[key].namespace === "Transform"
                            )
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

        changeProperty(){
            if(this.component.events){
                const diff = this.diffComponents(this.eventSelectedVariation.components, 
                this.component.components);

                console.log(diff);
            }
            else{
                this.$emit('changeProperty', this.component);  
            }
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

        dropComponent(subComponent, propertyName, propertyType, component){
            if(subComponent){
                for(let key in this.state.hierarchy.ghost){
                    if(key === propertyType){
                        subComponent.value[propertyName] = {
                            id: this.state.hierarchy.ghost.id,
                            propertyType,
                            propertyName
                        };
                    }
                }

                this.changeProperty(component);
            }   
            
            this.state.hierarchy.ghost = null;
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
        },

        onDelete(){
            const value = this.selectInput.subComponent.default[this.selectInput.property.name] || null;
            
            if(value?.src)
                value.src = "";

            if(this.selectInput)
                this.selectInput.subComponent.value[this.selectInput.property.name] = value;

            this.changeProperty();
        },

        getDefaultComponent(namespace){
            for(let component of this.componentsDefaults){
                if(component.namespace === namespace)
                    return { ...this.parseComponent(component, this.componentsDefaults) };
            }

            return null;
        },

        getComponentsByEvent(){
            if(this.eventSelectedVariation)
                return this.eventSelectedVariation.components;
            else
                return this.component.components
        },

        changeEvent(eventSelected){
            if(eventSelected){
                const defaultComponent = this.getDefaultComponent(this.component.namespace);
                this.eventSelected = eventSelected;

                if(defaultComponent && !this.eventsVariant[eventSelected])
                    this.eventsVariant[eventSelected] = { ...defaultComponent };

                if(this.eventsVariant[eventSelected])
                    this.eventSelectedVariation = { ...this.eventsVariant[eventSelected] };
            }
            else{
                this.eventSelectedVariation = null;
            }            
        }
    }
}
</script>