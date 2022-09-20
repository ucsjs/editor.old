<template>
    <div class="overflow-hidden h-full w-full">
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
            <div v-if="key === state.selectedTab" ref="activeTab">
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

                <div v-else>
                    <monaco-editor 
                        ref="editor"
                        :value="state.tabs[key]?.content" 
                        :language="(tab.language == 'blueprint') ? 'typescript' : tab.language"  
                        @save="() => { this.$emit('save', state.tabs[key]); }"
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

        change(index, contents){
            if(!contents.isTrusted);
                this.state.changeContents(index, JSON.stringify(contents));
        },

        closeFile(key){
            this.state.closeTab(key);
        }
    }
}
</script>