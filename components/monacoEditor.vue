<template>
    <div ref="editor" class="w-full h-full absolute"></div>
</template>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();
</script>

<script>
export default {
    props: {
        language: { 
            type: String,
            default: "json"
        },
        value: {
            type: String,
            default: ""
        }
    },

    async mounted(){
        if(process.client){
            const loader = await import('@monaco-editor/loader').then(m => m?.default);
            const monaco = await loader.init();
            
            const editorElem = monaco.editor.create(this.$refs.editor, {
                theme: this.state.darktheme ? 'vs-dark' : 'vs',
                autoClosingQuotes: true,
                language: this.language,
                value: JSON.stringify(this.value, null, 4),
                padding: { top: 10, left: 10, right: 10 },
                automaticLayout: true
            });

            editorElem.getModel().onDidChangeContent((event) => {
                this.$emit("change", editorElem.getValue());
            });

            window.addEventListener('resize', () => {
                editorElem.layout();
            });
        }
    }
}
</script>