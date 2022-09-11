import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        user: null,
        darktheme: false,
        tabs: [],
        selectedTab: -1,
        dragging: false,
        loading: false,
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
        }
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

        selectTab(index){
            this.selectedTab = index;
        },

        changeContents(index, newContent){
            this.tabs[index].content = newContent;
            this.tabs[index].change = true;
        },

        currentTab(){
            return this.tabs[this.selectedTab];
        },

        closeTab(index){
            this.tabs.splice(index, 1);

            if(this.selectedTab == index)
                this.selectedTab = 0;
        },

        use(state){
            if(typeof state == "string")
                state = JSON.parse(state);

            for(let key in state){
                try{
                    this[key] = state[key];
                }
                catch(e){}                
            }
        },

        saveState(){
            localStorage.setItem("state", JSON.stringify(this));
        }
    }
});