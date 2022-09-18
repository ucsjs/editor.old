<template>
    <div class="relative w-screen h-screen" @click.left="closeContextmenu">
        <Top />

        <div ref="move" class="fixed w-screen h-screen bg-transparent z-50" @mousemove="handleDrag" @mouseup="handleDragEnd" v-if="startDrag"></div>

        <div class="flex flex-col select-none h-full absolute">
            <div class="flex flex-row w-full" style="height: calc(100% - 72px)">
                <LeftNavbar />

                <div class="relative" :style="{width: `${widthLeftbar}px !important`}" v-show="state.leftbar.open">
                    <div 
                        :class="[
                            (startDrag) ? 'bg-blue-500' : '',
                            'resizeRight w-2 hover:bg-blue-500 h-full absolute z-50'
                        ]"
                        :style="{right: '-7px' }"
                        @mousedown="handleDragStart"
                        @click="handleDragStart"
                        @dragstart="handleDragStart"                
                    ></div>

                    <filetree-view />
                </div>
                    
                <div class="flex flex-col relative" :style="{width: `calc(100% - ${(state.leftbar.open) ? widthLeftbar : 0}px) !important`}">
                    <TabsIndex ref="tabs" />

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

                        if(_this.state.currentTab()){
                            useApi(`files/save`, {
                                method: "PUT", 
                                body: _this.state.currentTab()
                            }).then((res) => {
                                if(res.sha256 && res.lastModified){
                                    const file = _this.state.currentTab();
                                    file.change = false;
                                    file.lastModified = res.lastModified;
                                    file.sha256 = res.sha256;

                                    if(_this.$refs?.notifications)
                                        _this.$refs?.notifications.open("File saved");

                                    _this.state.loading = false;
                                }

                                _this.state.inSaveProcess = false;
                            }).catch(() => {
                                if(_this.$refs?.notifications)
                                        _this.$refs?.notifications.open("Error to save file");

                                _this.state.inSaveProcess = false;
                            });
                        }

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
            this.widthLeftbar = event.clientX;
            this.state.leftbar.width = this.widthLeftbar;
            this.startDrag = false;
            this.state.dragging = false;
        }
    }
}
</script>