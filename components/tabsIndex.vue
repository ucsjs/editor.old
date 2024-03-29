<template>
    <div class="overflow-hidden h-full w-full relative">
        <nav 
            :class="[
                state.darktheme ? 'text-white bg-neutral-800 border-black' : 'text-gray-800 bg-neutral-200 border-neutral-100', 
                'flex border-b select-none overflow-auto h-8 z-30 shadow-lg w-full'
            ]" 
            aria-label="Tabs"
            v-if="state.tabs.length > 0"
        >
            <draggable 
                v-model="state.tabs" 
                itemKey="sha256"
                class="flex" 
                @end="(event) => state.selectTab(event.newIndex)"
            >
                <template 
                    #item="{ element, index }" 
                    :list="list" 
                    :animation="100" 
                    :group="{ name: 'tabs', pull: 'clone', put: false }"
                    tag="transition-group" 
                    v-bind="dragOptions"
                    @end="$forceUpdate()"
                >
                    <div class="flex">
                        <a 
                            @click="state.selectTab(index)" 
                            :class="[state.selectedTab === index ? (state.darktheme ? 'bg-neutral-900 border-black' : 'bg-neutral-300') : (state.darktheme ? 'text-gray-500 border-black' : 'text-gray-500') , 'py-1 px-2 pr-1 font-medium text-sm pointer cursor-pointer select-none flex border-r']" 
                            :aria-current="element.current ? 'page' : undefined"
                            :title="element.filename"
                        >
                            <div class="flex">
                                <div :style="{color: iconFromExt(element.filename).color}">
                                    <client-only><font-awesome-icon :icon="iconFromExt(element.filename).icon" class="mr-3" v-if="iconFromExt(element.filename)" /></client-only>
                                </div>
                                
                                {{ element.name }}
                            </div>         
                            
                            <div class="flex">

                                <button class="-mt-1 mx-2 mr-0 px-2 h-7 hover:bg-neutral-700 hover:text-white rounded-lg" @click.stop="closeFile(index)" v-if="!element.change">
                                    <client-only><font-awesome-icon icon="fa-solid fa-xmark" /></client-only>
                                </button>

                                <button class="-mt-1 mx-2 h-7" @click.stop="closeFile(index)" v-if="element.change">
                                    <client-only><font-awesome-icon icon="fa-solid fa-circle" /></client-only>
                                </button>
                            </div>
                        </a> 
                    </div>
                </template>
            </draggable>
        </nav>

        <div v-for="(tab, key) in state.tabs" :key="key" class="text-white" ref="tabs">
            <div 
                v-if="key === state.selectedTab" 
                ref="activeTab" 
                class="w-full h-full absolute"
            >
                <div v-if="tab.language == 'page'">
                    <visual-editor 
                        ref="editor"
                        :tab="tab" 
                        :tabKey="key"
                        @changeState="(contents) => change(key, contents)"  
                    />
                </div>

                <div v-else-if="tab.language == 'blueprint' && tab.hasMetadata">
                    <blueprint-editor 
                        ref="editor"
                        :tab="tab" 
                        :tabKey="key"
                        :expEditor="tab.expression"
                        :expContents="tab.content"
                        @changeState="(contents) => change(key, contents)"
                    />
                </div>

                <div 
                    v-else-if="tab.language == 'html'" 
                    class="h-full w-full absolute z-40"
                    style="height: calc(100% - 45px);"
                >
                    <tinymce 
                        ref="editor"
                        api-key="lofxn2k4on3u8bcyc74b9ek6ceetphyxvods907pemqglvda"
                        model-events="change keydown blur focus paste"
                        :disabled="false"
                        :initial-value="tab.content"
                        :init="tinymceSettings"
                        @saveContent="(contents) => change(key, contents.target.getContent(), true)"
                        @change="(contents) => change(key, contents.target.getContent(), true)"
                    />
                </div>

                <div v-else>
                    <monaco-editor 
                        ref="editor"
                        :value="state.tabs[key]?.content" 
                        :language="(tab.language == 'blueprint') ? 'typescript' : tab.language"  
                        @save="() => { state.saveFile(state.tabs[key]); }"
                        @changeContents="(contents) => { state.changeContents(key, contents); }" 
                    /> 
                </div>
            </div>
        </div>
  
        <notifications ref="notifications" :closeTimeout="2000" />

        <ModalDialog ref="modalDialogClose" @confirm="(args) => closeFile(args.key, true)" />
    </div>
</template>

<script>
import globalMixin from "@/mixins/globalMixin";
import { useStateStore } from "~~/store/state.store";

export default {
    mixins: [globalMixin],

    data(){
        return {
            state: useStateStore(),
            monaco: null,
            editorElements: [],
            dragOptions: {
                animation: 200,
                group: "tabs",
                disabled: false,
                ghostClass: "ghost"
            },
            tinymceSettings: {
                skin_url: "/skins/ui/ucs",
                content_css: "/skins/content/ucs/content.min.css",
                themes: "modern",
                width: "100%",
                height: "100%",
                resize: false,
                plugins: 'save preview powerpaste casechange importcss searchreplace autolink autosave directionality advcode visualblocks visualchars fullscreen image imagetools link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount imagetools textpattern noneditable help formatpainter permanentpen pageembed charmap mentions quickbars linkchecker emoticons advtable',
                toolbar: [
                    'undo redo | bold italic underline | fontselect fontsizeselect formatselect | forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent',
                ],
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quicktable',
                model_events: "change input undo redo",
                menubar: 'edit view insert format tools table',
                save_onsavecallback: this.save,
                imagetools_proxy: '/file/upload',
                automatic_uploads: false
            }
        }
    },

    mounted(){
        this.updateEdiors()

        setInterval(() => {
            this.updateEdiors()
        }, 300);
    },

    methods: {
        updateEdiors(){
            this.state.editor = this.$refs.editor;
        },

        change(index, contents, saveState = false){
            if(!contents.isTrusted){
                if(typeof contents === "string")
                    this.state.changeContents(index, contents);
                else
                    this.state.changeContents(index, JSON.stringify(contents));
            }
            
            if(saveState)
                this.saveState();
        },

        save(){
            this.state.saveFile(this.state.tabs[this.state.selectedTab]);
        },

        closeFile(key, confirm = false){
            if(confirm === true){
                this.state.closeTab(key);
                this.saveState();
            }
            else{
                if(this.state.tabs[key].change)
                    this.$refs.modalDialogClose.openDialog('Close', `The file you want to close contains changes, if you choose to close without saving all changes will be lost, do you want to proceed?`, { key });
                else
                    this.closeFile(key, true);
            }            
        },

        saveState(){
            this.state.saveState();
        }
    }
}
</script>