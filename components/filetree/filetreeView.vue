<template>
    <div 
        :class="[state.darktheme ? 'bg-neutral-900 border-black' : 'bg-neutral-100', 'h-full border-r w-full select-none relative overflow-auto']"
        @contextmenu.prevent="openContextmenu" 
    >   
        <filetree-item 
            v-for="(item, key) in items" 
            :key="key" 
            :item="item" 
            :onlyDir="onlyDir"
            @selectItem="selectItem" 
            @openFile="openFile" 
            @createFile="createFile" 
            @createDir="createDir"
        />

        <ModalDialog ref="modalDialogDeleteFile" @confirm="deleteFile(true)" />
        <ModalDialog ref="modalDialogDeleteDir" @confirm="deleteDir(true)" />
        <Notifications ref="notifications" :closeTimeout="2000" />
    </div>
</template>

<style scoped>
* {
    scrollbar-width: auto;
    scrollbar-color: #171717 #000000;
}

*::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner {
    background: #1E1E1E;
}

*::-webkit-scrollbar-thumb {
    background-color: #383838;
    border-radius: 0px;
    border: 3px solid #383838;
    border-radius: 30px;
}
</style>

<script>
import { useStateStore } from "~~/store/state.store";

export default {
    props: {
        path: {
            type: String,
            default: ""
        },

        onlyDir: {
            type: Boolean,
            default: false
        },
    },

    components: {
        ModalDialog: () => import("~/components/modalDialog.vue")
    },

    data(){
        return {
            state: useStateStore(),
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
                    { label: "New Directory", action: this.newDir },
                    { separete: true },
                    { label: "Cut", action: "cutFolder", shortcut: "Ctrl+X" },
                    { label: "Copy", action: "copyFolder", shortcut: "Ctrl+C" },
                    { label: "Paste", action: "pasteFolder", shortcut: "Ctrl+V" },
                    { separete: true },
                    { label: "Rename", action: "cutFolder", shortcut: "F2" },
                    { label: "Delete", action: this.deleteDir, shortcut: "Delete" },
                ]
            }
        }
    },

    async mounted(){
        await this.listFiles();
    },

    methods: {
        async listFiles(){
            let uri = "files";
            let query = []

            if(this.path)
                query.push(`path=${encodeURIComponent(this.path)}`);

            if(this.onlyDir)
                query.push(`onlyDir=${this.onlyDir}`);

            if(query.length > 0)
                uri += "?" + query.join("&");
            
            this.items = await useApi(uri, { method: "GET" });

            for(let item of this.items)
                if(item && item.pathHash)
                    this.state.fileTree.items[item.pathHash] = { ...this.state.fileTree.items[item.pathHash], ...item };
        },

        openContextmenu(event){
            const { clientX, clientY } = event;
            this.state.contextMenu.position = { left: clientX, top: clientY };

            if(this.state.fileTree.selectedItem){
                if(this.state.fileTree.selectedItem.isDirectory)
                    this.state.contextMenu.items = this.contextMenu.directory;
                else
                    this.state.contextMenu.items = this.contextMenu.file;
            }

            this.state.contextMenu.open = true;
        },

        selectItem(item, root){
            this.state.fileTree.selectedRoot = root;
            this.state.fileTree.selectedItem = item;
            this.$emit("selectItem", item, root);
        },

        async openFileContext(){
            this.openFile(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash]);
        },

        async openFile(item) {
            const content = await useApi(`files/open?filename=${encodeURIComponent(item.filename)}`, {
                method: "GET"
            });

            this.state.openTab({ ...content, recent: true });
        },

        async createFile(name, item, ref){
            const createResult = await useApi(`files/create?path=${encodeURIComponent(item.path)}&filename=${encodeURIComponent(name)}`, {
                method: "POST"
            });

            if(createResult.pathHash){
                if(ref.listFiles)
                    await ref.listFiles();

                this.openFile(createResult);
                this.$refs?.notifications.open("File created successfully!");
            }
        },

        async createDir(name, item, ref){
            const createResult = await useApi(`files/dir?path=${encodeURIComponent(item.path)}&name=${encodeURIComponent(name)}`, {
                method: "POST"
            });

            if(createResult.pathHash){
                if(ref.listFiles)
                    await ref.listFiles();

                this.$refs?.notifications.open("Directory created successfully!");
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

        async newDir(){
            if(this.state.fileTree.selectedItem){
                if(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].isDirectory){
                    this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].open = true;
                    this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].newDir = true;
                }
            }
        },

        async deleteFile(confirm = false){
            if(confirm === true){
                this.state.closeTabByItem(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash]);
                
                await useApi(`files?filename=${encodeURIComponent(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].filename)}`, {
                    method: "DELETE"
                });

                this.state.fileTree.selectedRoot.listFiles();
                this.$refs?.notifications.open("File removed successfully!");
            }
            else {
                this.$refs.modalDialogDeleteFile.openDialog('Delete', `Do you really want to remove the file '${this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].filename}' ?`);
            }
        },

        async deleteDir(confirm = false){
            if(confirm === true){
                await useApi(`files/dir?dirname=${encodeURIComponent(this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].path)}`, {
                    method: "DELETE"
                });

                this.state.fileTree.selectedRoot.listFiles();
                this.$refs?.notifications.open("Directory removed successfully!");
            }
            else {
                this.$refs.modalDialogDeleteDir.openDialog('Delete', `Do you really want to remove the directory '${this.state.fileTree.items[this.state.fileTree.selectedItem.pathHash].name}' ?`);
            }
        }
    }
}
</script>