<template>
    <ol v-if="itemsFiltred.length == 0">
        <li 
            v-for="(item, key) in items" 
            v-show="key != 'undefined'" 
            :key="key" 
            class="flex flex-col rounded-md cursor-pointer" 
            @click="toggle(key)"
        > 
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
                        class="flex hover:bg-neutral-800 rounded-md p-1" 
                        @click="openedState[key] = !openedState[key]"
                        @mousedown.stop="createGhost(subitem)"
                    >
                        <div>
                            <client-only><font-awesome-icon :icon="(subitem.metadata.headerIcon) ? subitem.metadata.headerIcon : headerIcon(subitem.metadata.group)" v-if="openedState[key]" /></client-only>
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
            <div>
                <client-only><font-awesome-icon :icon="(item.metadata.headerIcon) ? item.metadata.headerIcon : headerIcon(item.metadata.group)" /></client-only>
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
        },

        fixed: {
            type: Boolean,
            default: false
        },
    },

    data() {
        return {
            openedState: {}
        }
    },

    mounted() {
        const cache = localStorage.getItem('blueprint-navbar');

        for(let key in this.items){
            this.openedState[key] = false;
        }

        if(cache){
            const cacheParsed = JSON.parse(cache);

            for(let key in cacheParsed)
                this.openedState[key] = cacheParsed[key];

            this.$forceUpdate();
        }
    },

    methods: {
        toggle(key){
            this.openedState[key] = !this.openedState[key];
            this.saveState();
        },

        addComponent(item){
            if(!this.fixed)
                this.$emit("addComponent", item);
        },

        createGhost(item){
            if(this.fixed)
                this.$emit("createGhost", item);
        },

        saveState(){
            localStorage.setItem(`blueprint-navbar`, JSON.stringify(this.openedState));
        }
    }
}
</script>