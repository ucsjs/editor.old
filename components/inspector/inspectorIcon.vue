<template>
    <div class="text-white  h-full relative">
        <div 
            class="bg-neutral-900 border border-black text-white px-1 h-7 w-full rounded-sm cursor-pointer flex"
            @click="open = (open) ? !open : true"
        >
            <div class="pt-0.5 w-4">  
                <font-awesome-icon :icon="modelValue?.icon" /> 
            </div>

            <div class="pt-0.5 ml-2 w-24 overflow-hidden">
                {{ modelValue?.icon }}
            </div>

            <div class="text-neutral-500">
                <font-awesome-icon icon="fa-solid fa-angle-down" />
            </div>
        </div>

        <div class="w-72 bg-neutral-800 border border-black shadow-lg right-0 absolute p-2 rounded-md mt-1" v-if="open">
            <div>
                <input v-model="search" class="w-full p-2 bg-neutral-900 rounded-md" :placeholder="$t('Search')" />
            </div>

            <div class="bg-neutral-900 mt-2 h-72 p-2 rounded-md overflow-auto">
                <div class="grid grid-cols-5 gap-2 pr-2">
                    <div 
                        class="h-9 bg-neutral-800 hover:bg-neutral-700 rounded-lg p-2 text-center text-sm cursor-pointer"
                        title="Empty"
                        @click="changeIcon(null)"
                    ></div>

                    <div 
                        class="h-9 bg-neutral-800 hover:bg-neutral-700 rounded-lg p-2 text-center text-sm cursor-pointer"
                        v-for="(item, key) of iconsFontAwesome.filter((item) => (search?.length > 2) ? ((new RegExp(search, 'i').test(item.search.join(','))) ? item : false) : item)"
                        :key="key"
                        :title="item"
                        @click="changeIcon(item.classes[0])"
                    >
                        <font-awesome-icon :icon="item.classes[0]" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { iconsListByStyle } from "fontawesome-5-icons-list";

export default {
    props: ["modelValue"],

    data(){
        return {
            open: false,
            search: "",
            iconsFontAwesome: iconsListByStyle("solid")
        }
    },

    methods: {
        changeIcon(v){
            this.$emit('update:modelValue', { icon: v });
            this.open = false;
            this.$emit('changeValue');
        }
    }
}
</script>