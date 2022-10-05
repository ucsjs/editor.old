<template>
    <editor>
        <Notifications ref="notifications" />
    </editor>
</template>

<script>
import { useStateStore } from "~/store/state.store";

export default {
    data(){
        return {
            state: useStateStore()
        }
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
                                if(state.editor[0])
                                    _this.state.editor[0].onSave();
                            }catch(e){}
                        }   
                    }
                }
            ]);

            useHotkey(hotkeys.value);
        }
    },

    methods: {
        save(tab){
            if(tab.expression){
                const content = JSON.parse(tab.content);

                for(let tabState of this.state.tabs){
                    if(tabState.filename === tab.blueprint.tab.filename){
                        const content = JSON.parse(tabState.content);

                        for(let keyItem in content.items){
                            if(content.items[keyItem].componentKey == tab.blueprint.component){
                                content.items[keyItem].value = tab.blueprint;
                                console.log("break");
                                break;
                            }
                        }

                        for(let keyItem in content.itemsClient){
                            if(content.itemsClient[keyItem].componentKey == tab.blueprint.component){
                                content.itemsClient[keyItem].value = tab.blueprint;
                                console.log("break");
                                break;
                            }
                        }
                    }
                }  
                
                tab.content = JSON.stringify(content);
                tab.change = false;
                
                this.state.inSaveProcess = false;
            }
            else{
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
}
</script>