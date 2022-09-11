import { defineStore } from "pinia";

export const userNavbarStore = defineStore({
    id: "navbar",
    state: () => ({
        navbar: []
    }),
    actions: {
        addItem(key, item, index) {
            this.navbar[index] = {
                key,
                children: [],
                ...item,
            }            
                
            return ref(this.navbar[key]);
        }
    }
});