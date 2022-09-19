<template>
    <div ref="itemTree" :id="item.pathHash">
        <div 
            :class="[
                (state.fileTree.selectedItem?.pathHash === item.pathHash) ? 'border border-[#007fd4] bg-[#04395e] text-white' : 'border border-transparent',
                state.darktheme ? 'text-white hover:bg-neutral-800' : 'hover:bg-neutral-200', 
                'p-1 px-4 cursor-pointer flex select-none'
            ]" 
            @click.left="toggleItem(item)"
            @click.right="selectItem(item)"
        >
            <div :style="{ paddingLeft: `${padding*20}px` }" class="flex">
                <div class="pr-2 w-6" v-if="item.isDirectory">
                    <client-only>
                        <font-awesome-icon icon="fa-solid fa-angle-down" v-if="state.fileTree.items[item.pathHash].open" />
                        <font-awesome-icon icon="fa-solid fa-angle-right" v-if="!state.fileTree.items[item.pathHash].open" />
                    </client-only>
                </div>

                <div class="pr-2" :style="{color: iconFromExt(item.filename).color}" v-if="item.isFile">
                    <client-only>
                        <font-awesome-icon :icon="iconFromExt(item.filename).icon"  v-if="iconFromExt(item.filename)" />
                    </client-only>
                </div>

                <div style="white-space:nowrap; text-overflow: ellipsis; overflow:hidden; ">
                    {{ item.name }}
                </div>
            </div>
        </div>

        <div v-if="state.fileTree.items[item.pathHash].open">            
            <div 
                :class="[
                    state.darktheme ? 'text-white hover:bg-neutral-800' : 'hover:bg-neutral-200', 
                    'p-1 px-4 cursor-pointer flex select-none'
                ]" 
                v-if="state.fileTree.items[item.pathHash].newFile"
            >
                <div :style="{ paddingLeft: `${(padding+1)*20}px` }" class="flex">
                    <div class="pr-2">
                        <client-only>
                            <font-awesome-icon icon="fa-solid fa-align-left" />
                        </client-only>
                    </div>

                    <div style="white-space:nowrap; text-overflow: ellipsis; overflow:hidden; ">
                        <input 
                            type="text" 
                            class="w-full bg-neutral-800 border-[#007fd4] border outline-none h-6" 
                            @keydown.enter="createFile"
                            @blur="closeNewFile"
                            @keydown.esc="closeNewFile"
                            ref="inputNewFile"
                        />
                    </div>
                </div>
            </div>

            <filetree-item 
                v-for="(item, key) in items" 
                :key="key" 
                :item="item" 
                :padding="padding+1"
                @selectItem="selectItem"
                @openFile="openFile" 
                @createFile="createFile"
            />
        </div>
    </div>
</template>

<script>
import { useUserStore } from "~/store/user.store";
import globalMixin from "@/mixins/globalMixin";

export default {
    mixins: [globalMixin],

    props: {
        item: {
            type: Object,
            default: ""
        },
        padding: {
            type: Number,
            default: 0
        }
    },

    data: () => ({
        state: useUserStore(),
        items: []
    }),

    async mounted(){
        if(this.item && this.item.pathHash && this.state.fileTree.items[this.item.pathHash]){
            if(this.state.fileTree.items[this.item.pathHash].open)
                await this.listFiles();

            setInterval(() => {
                if(this.state.fileTree.items[this.item.pathHash].newFile){
                    this.$nextTick(() => {
                        if(this.$refs.inputNewFile)
                            this.$refs.inputNewFile.focus();
                    });
                }
            }, 100);
        }
    },  

    methods: {
        async toggleItem(item) {
            if(item.isDirectory){
                if(item && item.pathHash)
                    this.state.changeFileTreeState(item.pathHash, "open", !this.state.fileTree.items[this.item.pathHash].open);
                
                if(this.state.fileTree.items[this.item.pathHash].open)
                    await this.listFiles();
                
                this.$emit("selectItem", item);
            }
            else{
                this.$emit("selectItem", item);
                this.$emit("openFile", item);
            }       
        },

        async listFiles(){
            const items = await useApi(`files?path=${encodeURIComponent(this.item.path)}`, {
                method: "GET"
            });

            if(items)
                this.items = items;

            for(let item of this.items)
                if(item && item.pathHash)
                    this.state.fileTree.items[item.pathHash] = { ...this.state.fileTree.items[item.pathHash], ...item};
        },

        async selectItem(item){
            this.$emit("selectItem", item);
        },

        createFile(event, item, ref){            
            if(event.target){
                this.$emit("createFile", event.target.value, this.state.fileTree.selectedItem, this);   
                event.target.value = "";      
                this.state.fileTree.items[this.item.pathHash].newFile = false;
            }
            else{
                this.$emit("createFile", event, item, ref);   
            }
        },

        async openFile(item){
            this.$emit("openFile", item);
        },

        closeNewFile(event){
            event.target.value = "";
            this.state.fileTree.items[this.item.pathHash].newFile = false
        }
    }
}
</script>