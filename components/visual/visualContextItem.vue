<template>
    <ol v-if="itemsFiltred.length == 0">
        <li v-for="(item, key) in items" v-show="key != 'undefined'" :key="key" class="flex flex-col rounded-md cursor-pointer" @click="openedState[key] = !openedState[key]"> 
            <div class="flex flex-row w-full hover:bg-neutral-800 rounded-md p-1">
                <div class="pr-2 w-6">
                    <client-only>
                        <font-awesome-icon icon="fa-solid fa-angle-down" v-if="openedState[key]" />
                        <font-awesome-icon icon="fa-solid fa-angle-right" v-if="!openedState[key]" />
                    </client-only>
                </div>

                <div>
                    {{ key }}
                </div>
            </div>    
            
            <div class="flex-row w-full" v-if="openedState[key]">
                <ol class="ml-4">
                    <li 
                        v-for="(subitem, key2) in item" :key="key2" 
                        class="flex hover:bg-neutral-800 rounded-md p-1 cursor-pointer" 
                        @click="openedState[key] = !openedState[key]"
                    >
                        <div class="w-6 text-center">
                            <client-only><font-awesome-icon :icon="(subitem.metadata.icon) ? subitem.metadata.icon : headerIcon(subitem.metadata.group)" v-if="openedState[key]" /></client-only>
                        </div>

                        <div class="ml-2 cursor-pointer" @click="addComponent(subitem)">
                            {{ subitem.metadata.namespace }}
                        </div>
                    </li>
                </ol>                
            </div>
        </li>
    </ol>
    <ol v-else>
        <li v-for="(item, key) in itemsFiltred" v-show="key != 'undefined'" :key="key" class="flex rounded-md p-1"> 
            <div class="w-6 text-center">
                <client-only><font-awesome-icon :icon="(subitem.metadata.icon) ? subitem.metadata.icon : headerIcon(subitem.metadata.group)" /></client-only>
            </div>

            <div class="ml-2 cursor-pointer" @click="addComponent(item)">
                {{ item.metadata.group }} :: {{ item.metadata.namespace }}
            </div>
        </li>  
    </ol>
</template>

<script>
import globalMixin from "@/mixins/globalMixin";

export default{
    mixins: [globalMixin],

    props: {
        items: {
            type: Object,
            required: true
        },
        itemsFiltred: {
            type: Array,
            default: []
        }
    },

    data() {
        return {
            openedState: {}
        }
    },

    mounted() {
        for(let key in this.items){
            this.openedState[key] = false;
        }
    },

    methods: {
        addComponent(item){
            this.$emit("addComponent", item);
        }
    }
}
</script>