<template>
    <div class="w-full h-full" @click="closeAllWindowOpened">
        <div class="p-2 bg-neutral-900 border-b border-black">{{ $t("Metadata") }}</div>

        <div class="py-2 h-[168px] overflow-scroll">
            <div class="flex flex-col">
                <div 
                    class="flex" 
                    v-for="(item, key) in items"
                    :key="key"
                >
                    <div v-if="item.type == 'BigText'" class="w-full p-2">
                        <textarea 
                            v-model="values[item.name]"
                            v-if="item.type == 'BigText'"
                            class=" w-full h-56 p-1 bg-neutral-900 border-black"
                            placeholder="Text..."
                        ></textarea>
                    </div>
                    <div v-else class="flex-1 flex p-0.5 ">
                        <div class="w-3/6 h-7 flex">
                            <div class="ml-2 text-sm mt-1">
                                {{ item.label || uppercaseFirstLetter(item.name) }}
                            </div>
                        </div>

                        <div 
                            class="w-3/6 h-7 pr-2" 
                            v-if="item"
                        >    
                            <input 
                                v-if="item.type == 'String' || item.type == 'string'" 
                                class="bg-neutral-900 border border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
                                type="text" 
                                v-model="values[item.name]"
                                @change="changeMetadata"
                                @keyup="changeMetadata"
                            />
                            <input 
                                v-else-if="item.type == 'number' || item.type == 'Number' || item.type == 'Int'" 
                                class="bg-neutral-900 border border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
                                type="text" 
                                v-model="values[item.name]"
                                @change="changeMetadata"
                                @keyup="changeMetadata"
                            />
                            <div v-else-if="item.type == 'boolean' || item.type == 'Boolean' || item.type == 'Bool'" class="text-white pt-1">
                                <label :for="item.name" class="relative items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        v-model="values[item.name]" 
                                        :id="item.name" 
                                        class="sr-only peer"
                                        @change="changeMetadata"
                                    />

                                    <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full p after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>  
                            <div v-else-if="item.type == 'color' || item.type == 'Color'" class="text-white pt-1 h-full relative" @click.stop="() => {}">
                                <div 
                                    class="border border-black h-full flex justify-end relative text-sm" 
                                    :style="{backgroundColor: values[item.name]?.hex || '#FFFFFF'}"                                                                                             
                                >
                                    <input 
                                        class="border-0 w-full text-sm" 
                                        type="text" 
                                        v-model="values[item.name].hex"                                                 
                                        :style="{backgroundColor: (values[item.name]?.hex || '#FFFFFF')}"
                                        @click.prevent="item.open = true"
                                        @change="changeMetadata"
                                        @keyup="changeMetadata"
                                    />

                                    <div class="absolute top-6 z-50" v-if="item.open">
                                        <Chrome v-model="values[item.name]"></Chrome>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="item.type == 'object' || item.type == 'Object' || item.type == 'JSON'">
                                <div class="flex flex-row">
                                    <div>
                                        <Tooltip :tooltipText="$t('Edit')" position="right">
                                            <button 
                                                class="ml-2 hover:text-neutral-500" 
                                                @click="$emit('openObjectEdit', { items, metadata: metadataProperty }, { ...item, id: item.name, value: values[item.name] }, key, key, (value) => {
                                                    values[item.name] = value;
                                                    changeMetadata();
                                                })"
                                            >
                                                <client-only><font-awesome-icon icon="fa-solid fa-edit" /></client-only>
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="(item.type == 'image' || item.type == 'Image' || item.type == 'ImageType')">
                                <div 
                                    class="border border-black h-full flex justify-end relative text-sm"                                                                                          
                                >
                                    <input 
                                        type="hidden" 
                                        v-model="values[item.name]" 
                                        @change="changeMetadata"
                                        @keyup="changeMetadata"
                                    />

                                    <input 
                                        class="bg-neutral-900 border border-black text-white px-1 h-6 text-sm w-full rounded-sm"
                                        type="text"     
                                        v-model="values[item.name]"
                                        @keyup.stop="() => {}"
                                    />

                                    <button 
                                        class="px-1 hover:bg-neutral-900" 
                                        @click="state.fileDialogOpen((path) => { 
                                            values[item.name] = path;
                                            state.fileDialog.open = false
                                        })"
                                    >
                                        <Tooltip :tooltipText="$t('Upload')" position="left">
                                            <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" />
                                        </Tooltip>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input{
    text-shadow: 1px 1px 2px black;
}
</style>

<script>
import globalMixin from "@/mixins/globalMixin";
import { Chrome } from '@ckpack/vue-color';
import { useStateStore } from "~~/store/state.store";

export default {
    mixins : [globalMixin],
    components: { Chrome },

    props: ["metadata"],

    watch: {
        metadata() {
            this.refreshMetadata();
        }
    },

    data(){
        return {
            state: useStateStore(),
            items: [
                { name: "importable", type: "Boolean", label: "Importable" },
                { name: "namespace", type: "String", label: "Namespace" },
                { name: "group", type: "String", label: "Group" },
                { name: "headerColor", type: "Color", label: "Header Color", open: false },
                { name: "headerIcon", type: "Image", label: "Header Icon" },
                { 
                    name: "publicVars", 
                    type: "Object", 
                    label: "Public Vars",
                    default: { name: "string", type: "string", value: "string", multi: true } 
                },
                { 
                    name: "inputs", 
                    type: "Object", 
                    label: "Inputs",
                    default: { name: "string", type: "string", value: "string", multi: true } 
                },
                { 
                    name: "outputs", 
                    type: "Object", 
                    label: "Outputs",
                    default: { name: "string", type: "string", value: "string", multi: true } 
                },
            ],
            values: {
                group: "Custom",
                headerColor: { hex: "#CCCCCC" },
                headerIcon: ""
            },
            metadataProperty: {
                type: ["string", "int", "float", "double", "boolean"],
            }
        }
    },

    mounted(){
        this.refreshMetadata();
    },

    methods: {
        refreshMetadata(){
            if(this.metadata)
                this.values = { ...{ headerColor: {hex: "#FFFFFF"} }, ...this.metadata };
        },

        closeAllWindowOpened(){
            for(let item of this.items)
                item.open = false;             
        },

        changeMetadata(){
            this.$emit("changeMetadata", this.values);
        }
    }
}
</script>
