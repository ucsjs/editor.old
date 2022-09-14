<template>
    <ol>
        <li v-for="(item, key) in items" v-show="key != 'undefined'" :key="key" class="flex flex-col rounded-md" @click="openedState[key] = !openedState[key]"> 
            <div class="flex flex-row w-full hover:bg-neutral-800 rounded-md p-1">
                <div class="pr-2 w-6">
                    <font-awesome-icon icon="fa-solid fa-angle-down" v-if="openedState[key]" />
                    <font-awesome-icon icon="fa-solid fa-angle-right" v-if="!openedState[key]" />
                </div>

                <div>
                    {{ key }}
                </div>
            </div>    
            
            <div class="flex-row w-full" v-if="openedState[key]">
                <ol class="ml-4">
                    <li 
                        v-for="(subitem, key2) in item" :key="key2" 
                        class="flex hover:bg-neutral-800 rounded-md p-1" 
                        @click="openedState[key] = !openedState[key]"
                    >
                        <div>
                            <font-awesome-icon :icon="headerIcon(subitem.metadata.group)" v-if="openedState[key]" />
                        </div>

                        <div class="ml-2 cursor-pointer" @click="addComponent(subitem)">
                            {{ subitem.metadata.namespace }}
                        </div>
                    </li>
                </ol>                
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