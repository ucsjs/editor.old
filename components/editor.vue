<template>
    <div 
        class="w-screen h-screen select-none" 
        @click.left="closeContextmenu" 
        @contextmenu.prevent="() => {}"
    >
        <Top />
        
        <div class="select-none w-screen absolute" style="height: calc(100% - 32px)">
            <layout
                ref="layout"
                path="../"
                style="width: 100%; height: 100%"
            ></layout>

            <!--<div class="flex flex-row w-full">
                <Footer />
            </div>-->
        </div>

        <context-menu />

        <file-dialog />

        <new-file-dialog />

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
                            id: "files",
                            type: "component",
                            title: "Files",
                            componentName: "Files",
                            header: { popout: false, maximise: false, minimise: false },                       
                            componentType: "filetree/filetreeWindow",
                            width: 10,
                        },
                        {
                            type: "column",
                            content: [{
                                id: "content",
                                type: "component",
                                title: "Content",
                                header: { position: false, popout: false, close: false },
                                isClosable: false,                                
                                componentType: "tabsIndex",
                            }, {
                                id: "terminals",
                                type: "component",
                                title: "Terminals",
                                name: "Terminals",
                                header: { show: "top", popout: false },
                                componentType: "terms/termsView",
                            }]
                        }
                    ],
                }
            }
        }

        this.$refs.layout.loadGLLayout(layout);
        this.state.layout = this.$refs.layout;

        setTimeout(() => {
            this.state.layout = this.$refs.layout;
        }, 100)

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

        async leftbar(opened){
            const layout = this.$refs.layout?.getLayout();

            if(layout){
                const container = await this.$refs.layout?.getContainer("files");
            }
        },

        async getLayoutComponent(root, index){
            if(root.content){
                for(let component of root.content){
                    if(component?.title == index)
                        return component;
                    else if(component?.content){
                        const subcomponent = await this.getLayoutComponent(component, index);

                        if(subcomponent)
                            return subcomponent;

                        break;
                    }
                }
            }
            else{
                return null;
            }
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