<template>
    <div>
        <Top />

        <div ref="move" class="fixed w-screen h-screen bg-transparent z-50" @mousemove="handleDrag" @mouseup="handleDragEnd" v-if="startDrag"></div>

        <div class="flex h-screen">
            <LeftNavbar />

            <div class="relative ml-16" :style="{width: `${widthLeftbar}px !important`}" v-show="state.leftbar.open">
                <span 
                    class="resizeRight w-2 hover:bg-blue-500 h-full absolute right-0"
                    @mousedown="handleDragStart"
                    @click="handleDragStart"
                    @dragstart="handleDragStart"                
                ></span>

                <filetree-view />
            </div>
                  
            <div class="flex flex-col w-full h-full">
                <TabsIndex :class="[(state.leftbar.open) ? '' : 'ml-16']" />

                <TermsView :class="[(state.leftbar.open) ? '' : 'ml-16']" />
            </div>
        </div>

        <Footer />

        <Notifications ref="notifications" />
    </div>
</template>

<style scoped>
.resizeRight{
    cursor: ew-resize;
}
</style>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();
let startDrag = ref(false); 
let notifications = ref(null);
let widthLeftbar = ref(state.leftbar.width);
let withMiddle = ref((state.leftbar.open) ? `calc(100% - ${widthLeftbar.value}px)` : '');

watch(state, () => {
    withMiddle.value = (state.leftbar.open) ? `calc(100% - ${widthLeftbar.value}px)` : '';
});

watch(widthLeftbar, () => {
    withMiddle.value = (state.leftbar.open) ? `calc(100% - ${widthLeftbar.value}px)` : '';
});

useHead({
    title: "UCS",
    script: [
        { src: "https://cdn.jsdelivr.net/npm/leader-line-new@1.1.9/leader-line.min.js" },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/rxjs/7.5.6/rxjs.umd.min.js" }, 
        { src: "node_modules/xterm/lib/xterm.js" },
        { src: "node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js" }, 
    ],
    link: [
        { rel: "stylesheet", href: "node_modules/xterm/css/xterm.css" }
    ]
});

if (!state.isAuthentication) {
    const router = useRouter();
    router.push({ path: "/login" });
}

const handleDragStart = (event) => {
    state.dragging = true;
    startDrag.value = true;
}

const handleDrag = (event) => {
    if(startDrag.value){
        if((widthLeftbar.value > 200 || event.clientX > 200) && (widthLeftbar.value <= 1000 || event.clientX <= 1000))
            widthLeftbar.value = event.clientX;
    }
}

const handleDragEnd = (event) => {
    widthLeftbar.value = event.clientX;
    state.leftbar.width = widthLeftbar.value;
    startDrag.value = false;
    state.dragging = false;
}
</script>