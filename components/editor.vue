<template>
    <div 
        class="relative w-screen h-screen" 
        @click.left="closeContextmenu" 
        @contextmenu.prevent="() => {}"
    >
        <Top />

        <div ref="move" class="fixed w-screen h-screen bg-transparent z-50" @mousemove="handleDrag" @mouseup="handleDragEnd" v-if="startDrag"></div>

        <div ref="move" class="fixed w-screen h-screen bg-transparent z-50" @mousemove="handleDragTop" @mouseup="handleDragEndTop" v-if="startDragTop"></div>

        <div class="flex flex-col select-none h-full absolute">
            <div class="flex flex-row w-full" style="height: calc(100% - 72px)">
                <LeftNavbar />

                <div class="relative" :style="{width: `${widthLeftbar}px !important`}" v-show="state.leftbar.open">
                    <div 
                        :class="[
                            (startDrag) ? 'bg-blue-500' : '',
                            'resizeRight w-1 hover:bg-blue-500 h-full absolute z-50'
                        ]"
                        :style="{right: '-7px' }"
                        @mousedown="handleDragStart"
                        @click="handleDragStart"
                        @dragstart="handleDragStart"                
                    ></div>

                    <filetree-view />
                </div>
                    
                <div 
                    class="flex flex-col relative" 
                    :style="{width: `calc(100% - ${(state.leftbar.open) ? widthLeftbar : 0}px) !important`}"
                >
                    <div class="flex relative" :style="{height: `calc(100% - ${terminalHeight}px) !important`}"> 
                        <TabsIndex ref="tabs" @save="save" />
                    </div>

                    <div class="flex z-40 overflow-hidden relative" :style="{height: `${terminalHeight}px !important`}">
                        <div 
                            :class="[
                                (startDragTop) ? 'bg-blue-500' : '',
                                'resizeNS hover:bg-blue-500 w-full h-1 absolute left-0 z-40'
                            ]"
                            @mouseup.stop="handleDragEndTop"
                            @mousedown="handleDragStartTop"
                            @click="handleDragStartTop"
                            @dragstart="handleDragStartTop"                
                        ></div>

                        <TermsView />
                    </div>
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

.resizeNS{
    cursor: ns-resize;
}
</style>
    
<script>
import { useUserStore } from "~/store/user.store";

export default {
    data(){
        return {
            state: useUserStore(),
            startDragTop: false,
            startDrag: false,
            widthLeftbar: 300,
            withMiddle: "",
            terminalHeight: 300
        };
    },  

    async mounted(){
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
}
</script>