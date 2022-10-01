<template>
    <div :class="[state.darktheme ? 'bg-neutral-800 border-black' : 'bg-neutral-200 border-neutral-300', 'h-full w-16 border-r select-none z-30']">
        <div v-for="(item, key) in items" :key="key">
            <Tooltip :tooltipText="item.title" position="right">
                <button 
                    @click="selectTab(key)" 
                    :class="[(selected === key) ? (state.darktheme ? 'text-gray-100' : 'border-gray-500') : (state.darktheme ? 'text-gray-500 hover:text-gray-300 border-transparent' : 'text-gray-400 hover:text-gray-500 border-transparent'), 'text-3xl w-full p-2 py-4 border-l-2']"
                >
                    <client-only>
                        <font-awesome-icon :icon="item.icon" />
                    </client-only>
                </button>
            </Tooltip>
        </div>
    </div>
</template>

<script>
import { useStateStore } from "~~/store/state.store";

export default {
    data(){
        return {
            state: useStateStore(),
            selected: 0,
            items: [
                { icon: "fa-regular fa-copy", title: "Files" },
                { icon: "fa-solid fa-search", title: "Search" },
                { icon: "fa-solid fa-code-branch", title: "Git" },
                { icon: "fa-solid fa-plug", title: "Plugin" },
                { icon: "fa-solid fa-database", title: "Database" },
                { icon: "fa-brands fa-docker", title: "Docker" }
            ]
        };
    },

    methods: {
        selectTab(key) {
            if(this.selected !== key){
                this.selected = key;

                if(!this.state.leftbar.open){
                    this.state.leftbar.width = 300;
                    this.state.leftbar.open = true;
                    this.$emit("leftbar", true);
                }
            }
            else{
                this.selected = -1;
                this.state.leftbar.open = false;
                this.$emit("leftbar", false);
            }
        }
    }
}
</script>