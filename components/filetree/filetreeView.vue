<template>
    <div :class="[state.darktheme ? 'bg-neutral-900 border-black' : 'bg-neutral-100', 'h-screen border-r w-full select-none']">
        <filetree-item v-for="(item, key) in items" :key="key" :item="item" @openFile="openFile" />
    </div>
</template>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();

const items = await useApi("files", {
    method: "GET"
});

const openFile = async (item) => {
    const content = await useApi(`files/stream?filename=${encodeURIComponent(item.filename)}`, {
        method: "GET"
    });

    state.openTab({ ...item, content: await content.text() });
}
</script>