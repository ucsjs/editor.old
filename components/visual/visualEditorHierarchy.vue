<template>
    <div 
        class="bg-neutral-800 h-full w-full py-4 pt-2 border-r border-black relative z-30 overflow-auto" 
        v-if="canvas"
        ref="hierarchy"
        @contextmenu.prevent="openContextmenu" 
        @mousedown="startDrag"
        @mousemove="handleDrag" 
        @click.stop="unselectComponent"
        @mouseup="removeGhost"
        @mouseleave="moverOut"
    >
        <div class="absolute z-40 w-full" v-if="canvas.hierarchy">
            <visual-hierarchy-item 
                v-for="(item, key) in canvas.hierarchy" 
                :key="key" 
                :item="item" 
                :tab="tab"
                :padding="0" 
                :root="canvas"
                :startDragHandle="startDragHandle"
                @createGhost="createGhost"
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
            startDragHandle: false,
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

        startDrag(){
            this.startDragHandle = true;
        },

        handleDrag(event){   
            const { clientX, clientY } = event;

            if(this.$refs.hierarchy){
                const hierarchyOffset = this.$refs.hierarchy.getBoundingClientRect();
                this.mouseHandler.top = clientY - hierarchyOffset.y - 10;
                this.mouseHandler.left = clientX - hierarchyOffset.x - 10; 
            }  

            if(this.startDragHandle && this.state.hierarchy.overElement && !this.state.hierarchy.ghost)
                this.createGhost({ ...this.state.hierarchy.overElement });                
        },

        moverOut(){
            this.startDragHandle = false;
        },

        createGhost(item){
            this.state.hierarchy.ghost = (item.item) ? item.item : item;
        },

        removeGhost(){
            this.startDragHandle = false;

            let tmpItem = null;
            let tmpRoot = null;
            let overElement = this.state.hierarchy.overElement;

            if(this.state.hierarchy.ghost){
                if(this.state.hierarchy.ghost.item && this.state.hierarchy.ghost.root){
                    tmpItem = this.state.hierarchy.ghost.item;
                    tmpRoot = this.state.hierarchy.ghost.root;
                }
                else if(this.state.hierarchy.ghost.item){
                    tmpItem = this.state.hierarchy.ghost.item;
                }
                else if(this.state.hierarchy.ghost.id){
                    tmpItem = this.state.hierarchy.ghost;
                }
            }

            this.ghost = null;
            this.state.hierarchy.ghost = null;

            setTimeout(async () => {
                if(tmpItem && tmpItem.item)
                    tmpItem = tmpItem.item;

                if(overElement && tmpItem){ //To Subelement
                    if(overElement.id !== tmpItem.id){                        
                        const root = (tmpRoot) ? tmpRoot : this.canvas;
                        const isSubItem = await this.isSubItem(overElement.id, tmpItem);

                        if(!isSubItem){
                            await this.removeItem(tmpItem.id, this.canvas);
                            await this.addSubcomponent(overElement.id, tmpItem, this.canvas);                          
                            this.$forceUpdate();
                            localStorage.setItem(`page-${this.tab.name.replace(/\./, "-")}`, JSON.stringify(this.canvas));
                            this.$emit("changeState", this.canvas); 
                        }                   
                    }
                }
                else if(tmpItem && !overElement){//To Root
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
                            if(root.hierarchy[key].id === elementId)
                                delete root.hierarchy[key];                         
                            else
                                this.removeItem(elementId, root.hierarchy[key]);
                        }
                    }

                    if(root.hierarchy.length > 0)
                        root.hierarchy = root.hierarchy.filter((item) => item);

                    resolve();
                }
            });
        },

        async addSubcomponent(elementId, component, root){
            return new Promise(async (resolve, reject) => {
                if(root.hierarchy.length > 0){
                    for(let key in root.hierarchy){
                        if(root.hierarchy[key]){
                            if(root.hierarchy[key].id === elementId){
                                root.hierarchy[key].open = true;
                                root.hierarchy[key].hierarchy.push(component);
                                break;
                            }                            
                            else{
                                this.addSubcomponent(elementId, component, root.hierarchy[key]);
                            }
                        }
                    }

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
            if(item){
                this.state.hierarchy.selectedItem = item;
                this.$emit("selectComponent", item);
            }
        },

        unselectComponent(){
            if(this.state.hierarchy.overElement){
                this.state.hierarchy.selectedItem = this.state.hierarchy.overElement;
                this.$emit("selectComponent", this.state.hierarchy.overElement);
            }
            else{
                this.state.hierarchy.selectedItem = null;
                this.state.contextMenu.open = false;
                this.$emit("selectComponent", null);
            }
        }
    }
}
</script>
