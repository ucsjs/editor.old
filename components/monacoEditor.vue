<template>
    <div ref="editor" class="w-full h-full absolute">
        <div v-if="!loading">{{ $t("Loading...") }}</div>
    </div>
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

    data(){
        return {
            loading: false
        }
    },  

    async mounted(){
        if(process.client){
            const loader = await import('@monaco-editor/loader').then(m => m?.default);
            const monaco = await loader.init();
            let contents = this.value;

            if(typeof contents === "object")
                contents = JSON.stringify(contents, null, 4);
            
            const editorElem = monaco.editor.create(this.$refs.editor, {
                theme: this.state.darktheme ? 'vs-dark' : 'vs',
                autoClosingQuotes: true,
                language: this.language,
                value: contents,
                padding: { top: 10, left: 10, right: 10 },
                automaticLayout: true
            });

            editorElem.getModel().onDidChangeContent((event) => {
                const value = editorElem.getValue();

                if(value)
                    this.$emit("changeContents", value);
                else
                    this.$emit("changeContents");
            });

            window.addEventListener('resize', () => {
                editorElem.layout();
            });

            this.loading = true;
        }
    }
}
</script>