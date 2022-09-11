<template>
    <div class="h-full overflow-hidden">
        <div class="h-full">
            <nav :class="[state.darktheme ? 'text-white bg-neutral-800 border-black' : 'text-gray-800 bg-neutral-200 border-neutral-100', 'flex border-b select-none overflow-auto']" aria-label="Tabs">
                <a 
                    @click="state.selectTab(key)" 
                    v-for="(tab, key) in state.tabs" 
                    :key="key" 
                    :class="[state.selectedTab === key ? (state.darktheme ? 'bg-neutral-900 border-black' : 'bg-neutral-300') : (state.darktheme ? 'text-gray-500 border-black' : 'text-gray-500') , 'py-1 px-4 font-medium text-sm pointer cursor-pointer select-none flex border-r']" 
                    :aria-current="tab.current ? 'page' : undefined"
                    :title="tab.filename"
                >
                    <div class="p-2">
                        <font-awesome-icon :icon="iconFromExt(tab.ext)" class="mr-2" />
                        
                        {{ tab.name }}
                    </div>                     

                    <button class="px-2 h-7 mt-1 hover:bg-neutral-700 hover:text-white rounded-lg" @click.stop="closeFile(key)" v-if="!tab.change">
                        <font-awesome-icon icon="fa-solid fa-xmark" />
                    </button>

                    <button class="p-2 h-7" @click.stop="closeFile(key)" v-if="tab.change">
                        <font-awesome-icon icon="fa-solid fa-circle" />
                    </button>
                </a>
            </nav>

            <div v-for="(tab, key) in state.tabs" :key="key" v-show="key === state.selectedTab" class="h-full">
                <div class="flex w-full h-full" v-if="tab.language != 'blueprint'">
                    <div 
                        :id="`editor-${tab.sha256}`" 
                        :index="key" 
                        :language="tab.language" 
                        :started="false" 
                        ref="editors" 
                        class="w-full h-full"
                    ></div>
                </div> 
                
                <div v-else class="w-full h-full">
                    <blueprint-editor :tab="tab" @changeState="(contents) => changeBlueprint(key, contents)" />
                </div> 
            </div>
        </div>

        <Notifications ref="notifications" :closeTimeout="2000" />
    </div>
</template>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();
</script>

<script>
import globalMixin from "@/mixins/globalMixin";

export default {
    mixins: [globalMixin],

    data(){
        return {
            monaco: null,
            editorElements: []
        }
    },

    watch: {
        state(){
            setTimeout(async() => { await this.updateEdiors() }, 50);
        }
    },

    async mounted(){
        if(process.client){
            const useHotkey = await import('vue3-hotkey').then(m => m?.default);
            const _this = this;

            const hotkeys = ref([{
                keys: ["ctrl", "s"],
                preventDefault: true,
                async handler(keys) {
                    _this.state.loading = true;

                    useApi(`files/save`, {
                        method: "PUT",
                        body: _this.state.currentTab()
                    }).then((res) => {
                        const file = _this.state.currentTab();
                        file.change = false;
                        file.lastModified = res.lastModified;
                        file.sha256 = res.sha256;

                        if(_this.$refs?.notifications)
                            _this.$refs?.notifications.open("File saved");

                        _this.state.loading = false;
                    });
                }
            }]);

            useHotkey(hotkeys.value);
        }
    },

    beforeMount(){
        setTimeout(async() => { await this.updateEdiors() }, 50);
    },

    methods: {
        async updateEdiors(){
            if(this.$refs.editors){
                for(let editor of this.$refs.editors){
                    if(editor.getAttribute("started") === "false"){
                        editor.setAttribute("started", "true");
                        const contents = this.state.tabs[editor.getAttribute("index")]?.content;

                        const loader = await import('@monaco-editor/loader').then(m => m?.default);
                        const monaco = await loader.init();
                        
                        const editorElem = monaco.editor.create(editor, {
                            theme: this.state.darktheme ? 'vs-dark' : 'vs',
                            autoClosingQuotes: true,
                            language: editor.getAttribute("language"),
                            value: (contents) ? contents : "",
                            padding: { top: 10 },
                            automaticLayout: true
                        });

                        this.editorElements.push(editorElem);

                        window.addEventListener('resize', () => {
                            editorElem.layout();
                        });

                        editorElem.getModel().onDidChangeContent((event) => {
                            this.state.changeContents(parseInt(editor.getAttribute("index")), editorElem.getValue());
                        });
                    }
                }  
            }
        },

        changeBlueprint(index, contents){
            if(!contents.isTrusted);
                this.state.changeContents(index, JSON.stringify(contents));
        },

        closeFile(key){
            this.state.closeTab(key);
        }
    }
}
</script>