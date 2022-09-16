<template>
    <div 
        :class="[state.darktheme ? 'bg-neutral-900 border-black' : 'bg-neutral-100', 'h-full border-r w-full select-none relative overflow-auto']"
        @contextmenu.prevent="openContextmenu" 
    >   
        <filetree-item 
            v-for="(item, key) in items" 
            :key="key" 
            :item="item" 
            @selectItem="selectItem" 
            @openFile="openFile" 
            @createFile="createFile" 
        />

        <ModalDialog ref="modalDialogDelete" @confirm="deleteFile(true)" />
    </div>
</template>

<style scoped>
* {
    scrollbar-width: auto;
    scrollbar-color: #262626 #000000;
}

*::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner {
    background: #000000;
}

*::-webkit-scrollbar-thumb {
    background-color: #262626;
    border-radius: 0px;
    border: 3px solid #262626;
}
</style>

<script>
import { useUserStore } from "~/store/user.store";

export default {
    components: {
        ModalDialog: () => import("~/components/modalDialog.vue")
    },

    data(){
        return {
            state: useUserStore(),
            items: [],
            contextMenu: {
                file: [
                    { label: "Open", action: this.openFileContext },
                    { label: "Open on the Terminal", action: this.openFileContext },
                    { separete: true },
                    { label: "Cut", action: "cutFolder", shortcut: "Ctrl+X" },
                    { label: "Copy", action: "copyFolder", shortcut: "Ctrl+C" },
                    { separete: true },
                    { label: "Copy Path", action: "cutFolder", shortcut: "Shift+Alt+C" },
                    { label: "Copy Relative Path", action: "cutFolder", shortcut: "Ctrl+K" },
                    { separete: true },
                    { label: "Rename", action: "cutFolder", shortcut: "F2" },
                    { label: "Delete", action: this.deleteFile, shortcut: "Delete" },
                ],
                directory: [
                    { label: "New File", action: this.newFile },
                    { label: "New Directory", action: "newFolder" },
                    { separete: true },
                    { label: "Cut", action: "cutFolder", shortcut: "Ctrl+X" },
                    { label: "Copy", action: "copyFolder", shortcut: "Ctrl+C" },
                    { label: "Paste", action: "pasteFolder", shortcut: "Ctrl+V" },
                ]
            }
        }
    },

    async mounted(){
        this.items = await useApi("files", { method: "GET" });

        for(let item of this.items)
            if(item && item.pathHash)
                this.state.fileTree.items[item.pathHash] = { ...this.state.fileTree.items[item.pathHash], ...item};
    },

    methods: {
        openContextmenu(event){
            const { clientX, clientY } = event;
            this.state.contextMenu.position = { left: clientX, top: clientY };

            if(this.state.fileTree.selectedItem){
                if(this.state.fileTree.selectedItem.isDirectory)
                    this.state.contextMenu.items = this.contextMenu.directory;
                else
                    this.state.contextMenu.items = this.contextMenu.file;
            }
            else{

            }

            this.state.contextMenu.open = true;
        },

        selectItem(item){
            this.state.fileTree.selectedItem = item;
        },

        async openFileContext(){
            this.openFile(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash]);
        },

        async openFile(item) {
            const content = await useApi(`files/stream?filename=${encodeURIComponent(item.filename)}`, {
                method: "GET"
            });

            this.state.openTab({ ...item, content: await content.text() });
        },

        async createFile(name, item, ref){
            const createResult = await useApi(`files/create?path=${encodeURIComponent(item.path)}&filename=${encodeURIComponent(name)}`, {
                method: "POST"
            });

            if(createResult.pathHash){
                if(ref.listFiles)
                    await ref.listFiles();

                this.openFile(this.state.fileTree.items[createResult.pathHash]);
            }
        },

        async newFile(){
            if(this.state.fileTree.selectedItem){
                if(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].isDirectory){
                    this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].open = true;
                    this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].newFile = true;
                }
            }
        },

        async deleteFile(confirm = false){
            if(!confirm)
                this.$refs.modalDialogDelete.openDialog('Delete', `Deseja realmente remove o arquivo ${this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].name} ?`);
            else {
                const createResult = await useApi(`files/create?filename=${encodeURIComponent(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].filename)}`, {
                    method: "DELETE"
                });

                console.log(createResult);

                //if(ref.listFiles)
                //    await ref.listFiles();
            }
        }
    }
}
</script>