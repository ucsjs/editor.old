import { defineStore } from "pinia";

export const useStateStore = defineStore({
    id: "user",
    state: () => ({
        user: null,
        darktheme: true,
        tabs: [],
        editor: null,
        selectedTab: -1,
        dragging: false,
        loading: false,
        inSaveProcess: false,
        layout: null,
        themes: {
            light: {
                bgBody: "bg-conic-to-tr from-gray-900 via-gray-100 to-gray-900",
                bgPrimary: "bg-white",
                bgSecondary: "bg-gray-100",
                bgTertiary: "bg-gray-200"
            },
            dark: {
                bgBody: "bg-black",
                bgPrimary: "bg-gray-900",
                bgSecondary: "bg-gray-800",
                bgTertiary: "bg-gray-700"
            }
        },
        leftbar: {
            open: true,
            width: 300
        },
        contextMenu: {
            open: false,
            position: { top: 0, left: 0 },
            items: []
        },
        fileTree: {
            selectedItem: null,
            selectedRoot: null,
            items: {}
        },
        hierarchy: {
            selectedItem: null,
            overElement: null,
            items: {}
        },
        fileDialog: {
            open: false,
            cb: null,
        },
        newFile: {
            open: false,
        },
        componentOver: null,
    }),

    getters: {
        isAuthentication: (state) => {
            return state.user !== null;
        },

        isRoot: (state) => {
            if(state.user !== null){
                const config = useRuntimeConfig();
                return state.user?.providerData[0].uid === config.root;
            }                
            else{
                return false;      
            }
        }
    },

    actions: {
        login(user) {
            this.user = user;
        },

        switchTheme(){
            this.darktheme = !this.darktheme;
        },

        setDarkmode(darktheme){
            this.darktheme = darktheme;
        },

        getClass(classname){
            return this.darktheme ? this.themes.dark[classname] : this.themes.light[classname];
        },

        hasTab(item){
            let exists = false;

            this.tabs.map((tab) => {
                if(item.filename === tab.filename)
                    exists = true;
            });

            return exists;
        },

        getTabIndex(item){
            for(let key in this.tabs){
                if(item.filename === this.tabs[key].filename)
                    return parseInt(key);
            }

            return -1;
        },

        async openTab(item){
            if(this.hasTab(item)){
                this.selectedTab = this.getTabIndex(item);
            }
            else{
                this.tabs.push(item);
                this.selectedTab = this.tabs.length - 1;
            }
        },

        async closeTabByItem(item){
            if(this.hasTab(item))
                this.closeTab(this.getTabIndex(item));
        },

        selectTab(index){
            this.selectedTab = index;
        },

        changeContents(index, newContent){
            if(this.tabs[index]){
                this.tabs[index].content = newContent;
                this.tabs[index].change = true;
            }
        },

        currentTab(){
            return this.tabs[this.selectedTab];
        },

        closeTab(index){
            this.tabs.splice(index, 1);
            this.selectedTab = (this.tabs.length > index) ? index : index -1;
            this.saveState();
        },

        use(state){
            if(typeof state == "string")
                state = JSON.parse(state);

            for(let key in state){
                try{ this[key] = state[key]; }
                catch(e){}                
            }

            if(!this.fileTree.items)
                this.fileTree.items = {};

            this.inSaveProcess = false;
        },

        changeFileTreeState(id, prop, value){
            if(this.fileTree.items[id])
                this.fileTree.items[id][prop] = value;

            this.saveState();
        },

        changeHierarchyItemState(tabHash, id, prop, value){
            if(this.hierarchy.items[tabHash][id])
                this.hierarchy.items[tabHash][id][prop] = value;
        },

        fileDialogOpen(cb){
            this.fileDialog.open = true;
            this.fileDialog.cb = cb;
        },

        saveFile(tab){
            this.loading = true;
            
            if(tab.expression){
                //tab.value = tab.content;
            }
            else{
                useApi(`files/save`, {
                    method: "PUT", 
                    body: tab
                }).then((res) => {
                    if(res.sha256 && res.lastModified){
                        tab.change = false;
                        tab.lastModified = res.lastModified;
                        tab.sha256 = res.sha256;
                        this.loading = false;
                    }
    
                    this.inSaveProcess = false;
                }).catch(() => {
                    this.inSaveProcess = false;
                });
            }
        },

        async newTerminal(){
            if(this.layout)
                this.layout.addGLComponent("terms/termsView", "Terminals");
        },

        async newFileExplorer(){
            if(this.layout)
                this.layout.addGLComponent("filetree/filetreeWindow", "Files");
        },

        saveState(){
            try{
                const replacerFunc = () => {
                    const visited = new WeakSet();

                    return (key, value) => {
                        if (typeof value === "object" && value !== null) {
                            if (visited.has(value)) {
                                return;
                            }

                            visited.add(value);
                        }

                        return value;
                    };
                };

                localStorage.setItem("state", JSON.stringify(this, replacerFunc()));
            }
            catch(e){}
        }
    }
});