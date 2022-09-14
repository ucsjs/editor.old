<template>
    <div :class="[state.darktheme ? 'bg-neutral-800 border-black' : 'bg-neutral-200 border-neutral-300', 'h-screen w-16 fixed border-r select-none z-40']">
        <div v-for="(item, key) in items" :key="key">
            <Tooltip :tooltipText="item.title" position="right">
                <button 
                    @click="selectTab(key)" 
                    :class="[(selected === key) ? (state.darktheme ? 'text-gray-100' : 'border-gray-500') : (state.darktheme ? 'text-gray-500 hover:text-gray-300 border-transparent' : 'text-gray-400 hover:text-gray-500 border-transparent'), 'text-3xl w-full p-2 py-4 border-l-2']"
                >
                    <font-awesome-icon :icon="item.icon" />
                </button>
            </Tooltip>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();
let selected = ref(0);

watch(state, () => {
    if(!state.leftbar.open)
        selected.value = -1;
});

const items = [
    { icon: "fa-solid fa-folder-tree", title: "Files" },
    { icon: "fa-solid fa-search", title: "Search" },
    { icon: "fa-solid fa-code-branch", title: "Git" },
    { icon: "fa-solid fa-plug", title: "Plugin" },
    { icon: "fa-solid fa-database", title: "Database" },
    { icon: "fa-brands fa-docker", title: "Docker" }
];

const selectTab = (key) => {
    if(selected.value !== key){
        selected.value = key;

        if(!state.leftbar.open){
            state.leftbar.width = 300;
            state.leftbar.open = true;
        }
    }
    else{
        selected.value = -1;
        state.leftbar.open = false;
    }
};
</script>