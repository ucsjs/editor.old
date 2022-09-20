<template>
    <div 
        class="w-screen h-screen" 
        @click.left="closeContextmenu" 
        @contextmenu.prevent="() => {}"
    >
        <Top />

        <div ref="move" class="fixed w-screen h-screen bg-transparent z-50" @mousemove="handleDrag" @mouseup="handleDragEnd" v-if="startDrag"></div>

        <div ref="move" class="fixed w-screen h-screen bg-transparent z-50" @mousemove="handleDragTop" @mouseup="handleDragEndTop" v-if="startDragTop"></div>

        <div class="flex flex-col select-none h-full absolute">
            <div class="flex flex-row w-full" style="height: calc(100% - 72px)">
                <!--<LeftNavbar />-->

                <layout
                    ref="layout"
                    path="../"
                    style="width: 100%; height: 100%"
                ></layout>
            </div>

            <div class="flex flex-row w-full">
                <Footer />
            </div>
        </div>

        <context-menu />
        <Notifications ref="notifications" />-->
    </div>
</template>

<style>
html {
    height: 100%;
}
body {
    height: 100%;
    margin: 0;
    overflow: hidden;
}
.full-height, #app {
    height: 100%;
}
</style>

<style src="golden-layout/dist/css/goldenlayout-base.css"></style>
<style src="golden-layout/dist/css/themes/goldenlayout-dark-theme.css"></style>

<style scoped>
.resizeRight{
    cursor: ew-resize;
}

.resizeNS{
    cursor: ns-resize;
}
</style>

<script>
import { defineComponent } from 'vue';
import { useUserStore } from "~/store/user.store";
import { ItemType } from "golden-layout";

export default defineComponent({
    data(){
        return {
            state: useUserStore(),
            startDragTop: false,
            startDrag: false,
            widthLeftbar: 300,
            withMiddle: "",
            terminalHeight: 300,
            terminalsOpened: false
        };
    },  

    async mounted(){
        this.$refs.layout.loadGLLayout({
            root: {
                type: ItemType.row,
                content: [
                    {
                        type: "component",
                        title: "Files",
                        header: { show: "top", popout: false, close: false },
                        isClosable: false,                        
                        componentType: "filetree/filetreeWindow",
                        width: 10,
                    },
                    {
                        type: "column",
                        content: [{
                            type: "component",
                            title: "Content",
                            header: { show: "top", popout: false, close: false },
                            isClosable: false,  
                            componentType: "tabsIndex",
                        }, {
                            type: "component",
                            title: "Terminals",
                            header: { show: "top" },
                            componentType: "terms/termsView",
                        }]
                    }
                ],
            }
        });

        this.widthLeftbar = this.state.leftbar.width;
        this.withMiddle = (this.state.leftbar.open) ? `calc(100% - ${this.widthLeftbar.value}px)` : '';

        if(process.client){
            const useHotkey = await import('vue3-hotkey').then(m => m?.default);
            const _this = this;

            const hotkeys = ref([
            {
                keys: ["delete"],
                preventDefault: true,
                async handler(keys) {
                    try{
                        if(_this.$refs.tabs.$refs.editor[0])
                            _this.$refs.tabs.$refs.editor[0].onDelete();
                    }catch(e){}
                }
            },
            {
                keys: ["ctrl", "s"],
                preventDefault: true,
                stop: true,
                async handler(keys) {
                    if(!_this.state.inSaveProcess){
                        _this.state.loading = true;
                        _this.state.inSaveProcess = true;

                        if(_this.state.currentTab())
                            _this.save(_this.state.currentTab())
                        
                        try{
                            if(_this.$refs.tabs.$refs.editor[0])
                                _this.$refs.tabs.$refs.editor[0].onSave();
                        }catch(e){}
                    }   
                }
            }]);

            useHotkey(hotkeys.value);
        }
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
                    this.widthLeftbar = event.clientX - 8;
            }
        },

        handleDragEnd(event){
            this.widthTop = event.clientY;
            this.state.leftbar.width = this.widthLeftbar;
            this.startDrag = false;
            this.state.dragging = false;
        },

        //Top
        handleDragStartTop(event){
            this.startDragTop = true;
            this.startDragTopEvent = { event, height: this.terminalHeight };
        },

        handleDragTop(event){
            if(this.startDragTop){
                const diffY = event.clientY - this.startDragTopEvent.event.clientY;
                const newHeight = this.startDragTopEvent.height - diffY;

                if(newHeight > 200  && newHeight <= 1000)
                    this.terminalHeight = newHeight;
            }
        },

        handleDragEndTop(event){
            this.startDragTopEvent = null;
            this.startDragTop = false;
        },

        save(tab){
            useApi(`files/save`, {
                method: "PUT", 
                body: tab
            }).then((res) => {
                if(res.sha256 && res.lastModified){
                    const file = tab;
                    file.change = false;
                    file.lastModified = res.lastModified;
                    file.sha256 = res.sha256;

                    if(this.$refs?.notifications)
                        this.$refs?.notifications.open("File saved");

                    this.state.loading = false;
                }

                this.state.inSaveProcess = false;
            }).catch(() => {
                if(this.$refs?.notifications)
                    this.$refs?.notifications.open("Error to save file");

                this.state.inSaveProcess = false;
            });
        }
    }
})
</script>