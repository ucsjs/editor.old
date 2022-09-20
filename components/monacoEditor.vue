<template>
    <div ref="editor" class="w-full h-full absolute">
        <div v-if="!loading">{{ $t("Loading...") }}</div>
    </div>
</template>

<script setup>
import { useStateStore } from "~~/store/state.store";
const state = useStateStore();
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
            const { listen } = await import('vscode-ws-jsonrpc').then(m => m);
            /*const {
                MonacoLanguageClient,
                CloseAction,
                ErrorAction,
                createConnection,
                MonacoServices,
            } = await import('monaco-languageclient').then(m => m?.default);*/

            const monaco = await loader.init();
            //MonacoServices.install(monaco);
            let contents = this.value;

            if(typeof contents === "object")
                contents = JSON.stringify(contents, null, 4);
            
            const editorElem = monaco.editor.create(this.$refs.editor, {
                theme: this.state.darktheme ? 'vs-dark' : 'vs',
                autoClosingQuotes: true,
                language: this.language,
                value: contents,
                padding: { top: 10, left: 10, right: 10 },
                automaticLayout: true,
                glyphMargin: true,
                lightbulb: {
                    enabled: true
                },
                minimap: { enabled: false },
            });

            editorElem.addAction({
                id: 'save',
                label: 'Save',
                precondition: null,
                keybindings: [
                    monaco.KeyMod.chord(
                        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                    )
                ],
                run: () => { this.$emit("save"); }
            })

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

            const webSocket = new WebSocket("ws://localhost:5003");

            listen({
                webSocket: webSocket,
                onConnection: (connection) => {
                    //var languageClient = this.createLanguageClient(connection);
                    //var disposable = languageClient.start();

                    connection.onClose(function () {
                        return disposable.dispose();
                    });
                    
                    connection.onError(function (error) {
                        //console.log(error);
                    });
                },
            });

            this.loading = true;
        }
    }
}
</script>