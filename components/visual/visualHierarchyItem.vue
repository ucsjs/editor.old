<template>
    <div 
        ref="element"
        v-if="item && tab"
        @mouseover.stop="overElement(item)" 
        @mouseout.stop="outElement(item)"
    >
        <div 
            :class="[
                (state.hierarchy.selectedItem?.id === item.id) ? 'border border-[#007fd4] bg-[#04395e] text-white' : 'border border-transparent',
                state.darktheme ? 'text-white hover:bg-neutral-800' : 'hover:bg-neutral-200', 
                'p-1 px-4 cursor-default flex select-none'
            ]" 
            @mousedown.left="createGhost(item, root)"
            @mouseover="selectItem(item)"
            @click.left="selectItem"
        >
            <div :style="{ paddingLeft: `${padding*20}px` }" class="flex">
                <div 
                    class="pr-2 w-6" 
                    v-if="tab && item.hierarchy.length > 0" 
                    @mousedown.left.stop="toggle"
                >
                    <client-only>
                        <font-awesome-icon icon="fa-solid fa-angle-down" v-if="item.open" />
                        <font-awesome-icon icon="fa-solid fa-angle-right" v-if="!item.open" />
                    </client-only>
                </div>
                <div v-else class="pr-2 w-6"></div>

                <div class="pr-2" v-if="item.metadata.icon">
                    <client-only>
                        <font-awesome-icon :icon="item.metadata.icon" />
                    </client-only>
                </div>

                <div style="white-space:nowrap; text-overflow: ellipsis; overflow:hidden; ">
                    {{ item.id }}
                </div>
            </div>
        </div>

        <div v-if="item.open">
            <div v-if="tab && item.hierarchy">
                <visual-hierarchy-item 
                    v-for="(subItem, key) in item.hierarchy" 
                    :key="key" 
                    :item="subItem" 
                    :tab="tab"
                    :padding="padding+1" 
                    @createGhost="createGhost"
                    @selectItem="selectItem" 
                />
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from "~/store/user.store";

export default {
    props: {
        padding: { type: Number },
        item: { type: Object },
        tab: { type: Object },
        root: { type: Object }
    },

    data(){
        return {
            state: useUserStore(),
            selected: -1
        }
    },

    mounted(){
        try{
            if(this.item && this.item.hierarchy && this.state.hierarchy.items){
                for(let subItem of this.item.hierarchy){
                    if(subItem && subItem.id && this.tab.pathHash)
                        this.state.hierarchy.items[this.tab.pathHash][subItem.id] = { ...{ open: false }, ...subItem };
                }  
            }
        }
        catch(e){}
    },  

    methods: {
        selectItem(item){
            this.$emit("selectItem", (item) ? item : this.item);
        },

        toggle(){
            if(this.item && this.item.id){
                this.item.open = !(this.item.open);               
                this.$emit("selectItem", { ...this.item });
            }            
        },

        overElement(item){
            this.state.hierarchy.overElement = item;
        },

        outElement(){
            this.state.hierarchy.overElement = null;
        },
        
        createGhost(item, root){
            this.$emit("createGhost", (item) ? { item, root } : { item: this.item, root: this.root});
        }
    },
}
</script>