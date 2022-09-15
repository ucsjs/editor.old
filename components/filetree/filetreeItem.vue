<template>
    <div>
        <div :class="[state.darktheme ? 'text-white hover:bg-neutral-800' : 'text-gray-800 hover:bg-neutral-200', 'p-1 px-4 cursor-pointer flex select-none']" @click="toggleItem(item)">
            <div :style="{ paddingLeft: `${padding*20}px` }" class="w-full flex">
                <div class="pr-2 w-6" v-if="item.isDirectory">
                    <font-awesome-icon icon="fa-solid fa-angle-down" v-if="open" />
                    <font-awesome-icon icon="fa-solid fa-angle-right" v-if="!open" />
                </div>

                <div class="pr-2" :style="{color: iconFromExt(item.filename).color}" v-if="item.isFile">
                    <client-only>
                        <font-awesome-icon :icon="iconFromExt(item.filename).icon"  v-if="iconFromExt(item.filename)" />
                    </client-only>
                </div>

                {{ item.name }}
            </div>
        </div>

        <div class="w-full" v-if="open">
            <filetree-item v-for="(item, key) in items" :key="key" :item="item" :padding="padding+1" @openFile="openFile" />
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();
</script>

<script>
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
        open: false,
        items: []
    }),

    methods: {
        async toggleItem(item) {
            if(item.isDirectory){
                this.open = !this.open;

                if(this.open){
                    const items = await useApi(`files?path=${encodeURIComponent(this.item.path)}`, {
                        method: "GET"
                    });

                    if(items)
                        this.items = items;
                }  
            }
            else{
                this.$emit("openFile", item);
            }       
        },

        async openFile(item){
            this.$emit("openFile", item);
        }
    }
}
</script>