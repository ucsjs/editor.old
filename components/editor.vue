<template>
    <div class="relative w-screen h-screen" @click.left="closeContextmenu">
        <Top />

        <div ref="move" class="fixed w-screen h-screen bg-transparent z-50" @mousemove="handleDrag" @mouseup="handleDragEnd" v-if="startDrag"></div>

        <div class="flex flex-col select-none h-full absolute">
            <div class="flex flex-row w-full" style="height: calc(100% - 72px)">
                <LeftNavbar />

                <div class="relative" :style="{width: `${widthLeftbar}px !important`}" v-show="state.leftbar.open">
                    <div 
                        class="resizeRight w-2 hover:bg-blue-500 h-full absolute right-0 z-50"
                        @mousedown="handleDragStart"
                        @click="handleDragStart"
                        @dragstart="handleDragStart"                
                    ></div>

                    <filetree-view />
                </div>
                    
                <div class="flex flex-col relative" :style="{width: `calc(100% - ${(state.leftbar.open) ? widthLeftbar : 0}px) !important`}">
                    <TabsIndex />

                    <!--<TermsView :class="[(state.leftbar.open) ? '' : 'ml-16']" />-->
                </div>
            </div>

            <div class="flex flex-row w-full">
                <Footer />
            </div>
        </div>

        <context-menu />
        <Notifications ref="notifications" />
    </div>
</template>

<style scoped>
.resizeRight{
    cursor: ew-resize;
}
</style>
    
<script>
import { useUserStore } from "~/store/user.store";

export default {
    data(){
        return {
            state: useUserStore(),
            startDrag: false,
            widthLeftbar: 300,
            withMiddle: ""
        };
    },  

    mounted(){
        this.widthLeftbar = this.state.leftbar.width;
        this.withMiddle = (this.state.leftbar.open) ? `calc(100% - ${this.widthLeftbar.value}px)` : '';
    },

    watch: {
        widthLeftbar(){
            this.withMiddle = (this.state.leftbar.open) ? `calc(100% - ${this.widthLeftbar.value}px)` : '';
        }
    },

    methods: {
        closeContextmenu(){
            this.state.contextMenu.open = false;
        },

        handleDragStart(event){
            this.state.dragging = true;
            this.startDrag = true;
        },

        handleDrag(event){
            if(this.startDrag){
                if((this.widthLeftbar > 200 || event.clientX > 200) && (this.widthLeftbar <= 1000 || event.clientX <= 1000))
                    this.widthLeftbar = event.clientX;
            }
        },

        handleDragEnd(event){
            this.widthLeftbar = event.clientX;
            this.state.leftbar.width = this.widthLeftbar;
            this.startDrag = false;
            this.state.dragging = false;
        }
    }
}
</script>