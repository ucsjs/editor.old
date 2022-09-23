<template>
    <div class="overflow-hidden h-full w-full relative">
        <nav :class="[state.darktheme ? 'text-white bg-neutral-800 border-black' : 'text-gray-800 bg-neutral-200 border-neutral-100', 'flex border-b select-none overflow-auto']" aria-label="Tabs">
            <draggable 
                v-model="state.tabs" 
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
                            :class="[state.selectedTab === index ? (state.darktheme ? 'bg-neutral-900 border-black' : 'bg-neutral-300') : (state.darktheme ? 'text-gray-500 border-black' : 'text-gray-500') , 'py-1 px-4 font-medium text-sm pointer cursor-pointer select-none flex border-r']" 
                            :aria-current="element.current ? 'page' : undefined"
                            :title="element.filename"
                        >
                            <div class="p-2 flex">
                                <div :style="{color: iconFromExt(element.filename).color}">
                                    <client-only><font-awesome-icon :icon="iconFromExt(element.filename).icon" class="mr-3" v-if="iconFromExt(element.filename)" /></client-only>
                                </div>
                                
                                {{ element.name }}
                            </div>                     

                            <button class="px-2 h-7 mt-1 hover:bg-neutral-700 hover:text-white rounded-lg" @click.stop="closeFile(index)" v-if="!element.change">
                                <client-only><font-awesome-icon icon="fa-solid fa-xmark" /></client-only>
                            </button>

                            <button class="p-2 h-7" @click.stop="closeFile(index)" v-if="element.change">
                                <client-only><font-awesome-icon icon="fa-solid fa-circle" /></client-only>
                            </button>
                        </a> 
                    </div>
                </template>
            </draggable>
        </nav>

        <div v-for="(tab, key) in state.tabs" :key="key" class="text-white">
            <div 
                v-if="key === state.selectedTab" 
                ref="activeTab" 
                class="w-full h-full absolute"
            >
                <div v-if="tab.language == 'page'">
                    <visual-editor 
                        ref="editor"
                        :tab="tab" 
                        @changeState="(contents) => change(key, contents)"  
                    /> 
                </div>

                <div v-else-if="tab.language == 'blueprint' && tab.hasMetadata">
                    <blueprint-editor 
                        ref="editor"
                        :tab="tab" 
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
                    >
                    </tinymce>
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
    </div>
</template>

<script setup>
import { useStateStore } from "~~/store/state.store";
const state = useStateStore();
</script>

<script>
import globalMixin from "@/mixins/globalMixin";

export default {
    mixins: [globalMixin],

    data(){
        return {
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

        closeFile(key){
            this.state.closeTab(key);
        },

        saveState(){
            this.state.saveState();
        }
    }
}
</script>