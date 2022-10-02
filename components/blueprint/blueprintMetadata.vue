<template>
    <div class="w-full h-full">
        <div class="p-2 bg-neutral-900 border-b border-black">{{ $t("Metadata") }}</div>

        <div class="pb-2 h-[268px] overflow-auto">
            <div class="flex flex-col">
                <div class="flex" v-if="items.value">
                    <inspector-item 
                        :component="items"
                        :subComponent="items"
                        @changeProperty="changeMetadata"
                        @openObjectEdit="(subComponent, property, keyItem) => $emit('openObjectEdit', items, property, keyItem, null, (v) => {
                            items.value[property.name] = v;
                        }, items.value[property.name])"
                    />
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
import { useStateStore } from "~~/store/state.store";

export default {
    mixins : [globalMixin],
  
    props: ["metadata"],

    watch: {
        metadata() {
            this.items.value = this.metadata;
        }
    },

    data(){
        return {
            state: useStateStore(),
            items: {
                namespace: "metadata",
                editor: {},
                metadata: {
                    type: [
                        "string", "int", "float", "double", "boolean", "object", 
                        "array", "image", "color", "blueprint", "component", "any"
                    ],
                },
                publicVars: [],
                outputs: [],
                inputs: [],
                events: [],
                properties: [
                    { name: "importable", type: "boolean", label: "Importable" },
                    { name: "namespace", type: "string", label: "Namespace" },
                    { name: "group", type: "string", label: "Group" },
                    { name: "headerColor", type: "color", label: "Header Color", default: { hex: "#664aba" }, open: false },
                    { name: "headerIcon", type: "IconType", label: "Header Icon", default: { src: "" } },
                    { 
                        name: "publicVars", 
                        type: "object", 
                        label: "Public Vars",
                        default: { name: "string", type: "string", value: "string", multi: true } 
                    },
                    { 
                        name: "inputs", 
                        type: "object", 
                        label: "Inputs",
                        default: { name: "string", type: "string", multi: true } 
                    },
                    { 
                        name: "outputs", 
                        type: "object", 
                        label: "Outputs",
                        default: { name: "string", type: "string", multi: true } 
                    },
                ],
                value: null,
                values: {},           
            }
        }
    },

    mounted(){
        if(this.metadata){
            this.items.value = this.metadata;

            for(let key in this.metadata)
                this.items.properties.value = this.metadata[key];
        }
        else{
            this.items.value = {
                importable: true,
                namespace: "",
                group: "Custom",
                headerColor: { hex: "#664aba" },
                headerIcon: { src: "" },
                publicVars: [],
                inputs: [],
                outputs: [],
                events: []
            }
        }
    },

    methods: {
        changeMetadata(){
            this.$emit('changeMetadata', this.items.value)
        },

        concatProperty(property, plus){
            for(let key in plus)
                property[key] = plus[key];
            
            return property;
        }
    }
}
</script>
