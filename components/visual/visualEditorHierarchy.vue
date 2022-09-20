<template>
    <div 
        class="bg-neutral-900 h-full w-full py-4 relative z-30 border-r-2 border-black" 
        v-if="canvas"
        ref="hierarchy"
        @contextmenu.prevent="openContextmenu" 
        @mousemove="handleDrag" 
        @mouseup.left="removeGhost"
        @mouseleave="removeGhost"
        @click.stop="unselectComponent"
    >
        <div 
            id="ghost" 
            class="absolute border p-1 z-50 border-[#0968a9] bg-[#0968a9]/50 rounded-lg"
            :style="{ top: `${mouseHandler.top + 5}px`, left: `${mouseHandler.left+20}px`}" 
            v-if="ghost && state.hierarchy.selectedItem"
        >
            {{ state.hierarchy.selectedItem.id }}
        </div>

        <div class="absolute z-40 w-full" v-if="canvas.hierarchy" @click.stop="() => {}">
            <visual-hierarchy-item 
                v-for="(item, key) in canvas.hierarchy" 
                :key="key" 
                :item="item" 
                :tab="tab"
                :padding="0" 
                :root="canvas"
                @createGhost="createGhost"
                @selectItem="selectItem"
            />
        </div>
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
        tab: { type: Object }, 
        canvas: { type: Object },
        components: { 
            type: Array,
            default: [] 
        },
    },

    data(){
        return {
            state: useStateStore(),
            mouseHandler: { top: 200, left: 200 },
            contextMenu: [
                { label: "Cut", action: "cutFolder", shortcut: "Ctrl+X" },
                { label: "Copy", action: "copyFolder", shortcut: "Ctrl+C" },
                { label: "Paste", action: "pasteFolder", shortcut: "Ctrl+V" },
                { separete: true },
                { label: "Rename", action: "cutFolder", shortcut: "F2" },
                { label: "Duplicate", action: "cutFolder", shortcut: "Ctrl+D" },
                { label: "Delete", action: this.deleteComponent, shortcut: "Delete" },
                { separete: true },
                { label: "Create Empty", action: this.create },
            ],
            componentsCategories: {},
            padding: 0,
            ghost: null,
        }
    },

    mounted(){
        if(!this.state.hierarchy.items[this.tab.pathHash])
            this.state.hierarchy.items[this.tab.pathHash] = {};

        try{
            for(let item of this.canvas.hierarchy){
                if(item && item.id){
                    if(this.state.hierarchy.items && this.state.hierarchy.items[this.tab.pathHash])
                        this.state.hierarchy.items[this.tab.pathHash][item.id] = { ...{ open: false }, ...item };
                }
            }    
        }
        catch(e){} 

        if(this.components.length > 0){
            this.sortComponentsCategories();

            for(let key in this.componentsCategories){
                let subItems = [];

                for(let subItem of this.componentsCategories[key]){
                    subItems.push({
                        label: subItem.namespace,
                        action: (subItem) => this.addComponent(subItem),
                        item: subItem
                    })
                }

                this.contextMenu.push({ 
                    label: key,
                    items: subItems
                })
            }
        }
    },

    methods: {
        openContextmenu(event){            
            const { clientX, clientY } = event;
            this.state.contextMenu.position = { left: clientX, top: clientY };
            this.state.contextMenu.items = { ...this.contextMenu };
            this.state.contextMenu.open = true;
        },

        sortComponentsCategories() {
            for(let item of this.components){
                
                if(!this.componentsCategories[item.metadata.group])
                    this.componentsCategories[item.metadata.group] = [];
                
                this.componentsCategories[item.metadata.group].push(item);
            }

            this.componentsCategories = Object.keys(this.componentsCategories).sort().reduce(
                (obj, key) => { 
                    obj[key] = this.componentsCategories[key]; 
                    return obj;
                }, {}
            );

            this.$forceUpdate();
            this.$nextTick();
        },

        handleDrag(event){   
            const { clientX, clientY } = event;
            const hierarchyOffset = this.$refs.hierarchy.getBoundingClientRect();
            this.mouseHandler.top = clientY - hierarchyOffset.y - 10;
            this.mouseHandler.left = clientX - hierarchyOffset.x - 10;                
        },

        createGhost(item){
            this.ghost = (item.item) ? item.item : item;
        },

        removeGhost(){
            let tmpItem = null;
            let tmpRoot = null;

            if(this.ghost){
                if(this.ghost.item && this.ghost.root){
                    tmpItem = this.ghost.item;
                    tmpRoot = this.ghost.root;
                }
                else if(this.ghost.item){
                    tmpItem = this.ghost.item;
                }
                else if(this.ghost.id){
                    tmpItem = this.ghost;
                }
            }
            
            this.ghost = null;

            setTimeout(async () => {
                if(tmpItem && tmpItem.item)
                    tmpItem = tmpItem.item;

                if(this.state.hierarchy.overElement && tmpItem){ //To Subelement
                    if(this.state.hierarchy.overElement.id !== tmpItem.id){
                        const root = (tmpRoot) ? tmpRoot : this.canvas;
                        const isSubItem = await this.isSubItem(this.state.hierarchy.overElement.id, tmpItem);

                        if(!isSubItem){
                            await this.removeItem(tmpItem.id, root);
                            this.state.hierarchy.overElement.hierarchy.push({ ...tmpItem });
                            this.$forceUpdate();
                            localStorage.setItem(`page-${this.tab.name.replace(/\./, "-")}`, JSON.stringify(this.canvas));
                            this.$emit("changeState", this.canvas); 
                        }                   
                    }
                }
                else if(tmpItem && !this.state.hierarchy.overElement){//To Root
                    await this.removeItem(tmpItem.id, this.canvas);
                    this.canvas.hierarchy.push({ ...tmpItem });
                    this.$forceUpdate();
                    localStorage.setItem(`page-${this.tab.name.replace(/\./, "-")}`, JSON.stringify(this.canvas));
                    this.$emit("changeState", this.canvas);                    
                }
            }, 100);
        },

        async isSubItem(elementId, root){
            return new Promise(async (resolve, reject) => {
                if(root.hierarchy.length > 0){
                    for(let key in root.hierarchy){
                        if(root.hierarchy[key]){
                            if(root.hierarchy[key].id === elementId){
                                resolve(true);
                                break;
                            }                            
                            else{
                                const isSubItem = await this.isSubItem(elementId, root.hierarchy[key]);

                                if(isSubItem)
                                    resolve(true);
                            }
                        }
                    }

                    if(root.hierarchy.length > 0)
                        root.hierarchy = root.hierarchy.filter((item) => item);

                    resolve(false);
                }
                else{
                    resolve(false);
                }
            });
        },

        async removeItem(elementId, root){
            return new Promise(async (resolve, reject) => {
                if(root.hierarchy.length > 0){
                    for(let key in root.hierarchy){
                        if(root.hierarchy[key]){
                            if(root.hierarchy[key].id === elementId){
                                delete root.hierarchy[key];
                                break;
                            }                            
                            else{
                                this.removeItem(elementId, root.hierarchy[key]);
                            }
                        }
                    }

                    if(root.hierarchy.length > 0)
                        root.hierarchy = root.hierarchy.filter((item) => item);

                    resolve();
                }
            });
        },

        addComponent(component){
            const newComponent = {
                id: `${component.item.namespace}_${new Date().getTime()}`,
                ...component.item,
                position: {
                    left: 0,
                    top: 0
                },
                hierarchy: []
            }; 

            if(this.state.hierarchy.selectedItem)
                this.state.hierarchy.selectedItem.hierarchy.push(newComponent);
            else
                this.$emit("addComponent", newComponent);

            this.state.contextMenu.open = false;
        },

        async deleteComponent(){
            await this.removeItem(this.state.hierarchy.selectedItem, this.canvas);
        },

        selectItem(item){
            this.state.hierarchy.selectedItem = item;
            this.$emit("selectComponent", item);
        },

        unselectComponent(){
            this.state.hierarchy.selectedItem = null;
            this.$emit("selectComponent", null);
        }
    }
}
</script>
