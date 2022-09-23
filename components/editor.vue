<template>
    <div 
        class="w-screen h-screen select-none" 
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

        <file-dialog />

        <Notifications ref="notifications" />
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
import { useStateStore } from "~~/store/state.store";
import { ItemType } from "golden-layout";

export default {
    data(){
        return {
            state: useStateStore(),
            startDragTop: false,
            startDrag: false,
            widthLeftbar: 300,
            withMiddle: "",
            terminalHeight: 300,
            terminalsOpened: false
        };
    },  

    async created(){
        if(process.client){
            console.log("Editor created");
            const useHotkey = await import('vue3-hotkey').then(m => m?.default);
            const _this = this;

            const hotkeys = ref([
                {
                    keys: ["delete"],
                    preventDefault: true,
                    stop: true,
                    async handler(keys) {
                        try{
                            if(_this.state.editor[0])
                                _this.state.editor[0].onDelete();
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
                                if(_this.state.editor[0])
                                    _this.state.editor[0].onSave();
                            }catch(e){}
                        }   
                    }
                }
            ]);

            useHotkey(hotkeys.value);
        }
    },

    async mounted(){
        let layout;
        const cache = localStorage.getItem("editor_layout");

        if(cache){
            layout = JSON.parse(cache);
        }
        else{
            layout = {
                root: {
                    type: ItemType.row,
                    content: [
                        {
                            type: "component",
                            title: "Files",
                            header: { position: false, show: false, popout: false, close: false },
                            isClosable: false,                        
                            componentType: "filetree/filetreeWindow",
                            width: 10,
                        },
                        {
                            type: "column",
                            content: [{
                                type: "component",
                                title: "Content",
                                header: { position: false, show: false, popout: false, close: false },
                                isClosable: false,  
                                hasHeaders: false,
                                componentType: "tabsIndex",
                            }, {
                                type: "component",
                                title: "Terminals",
                                header: { show: "top", popout: false },
                                componentType: "terms/termsView",
                            }]
                        }
                    ],
                }
            }
        }

        this.$refs.layout.loadGLLayout(layout);

        setInterval(() => {
            if(this.$refs.layout && this.$refs.layout?.getLayoutConfig){
                const config = this.$refs.layout?.getLayoutConfig();

                if(config && config.root && config.root.content)
                    localStorage.setItem("editor_layout", JSON.stringify(config));
            }                
        }, 10000);

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
}
</script>