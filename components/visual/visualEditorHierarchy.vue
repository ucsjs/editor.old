<template>
    <div 
        class="bg-neutral-900 h-full w-full py-4 relative z-30" 
        v-if="canvas"
        ref="hierarchy"
        @mousemove="handleDrag" 
        @mouseup.left="removeGhost"
        @mouseleave="removeGhost"
    >
        <div 
            id="ghost" 
            class="absolute border p-1 z-50 border-[#0968a9] bg-[#0968a9]/50 rounded-lg"
            :style="{ top: `${mouseHandler.top + 5}px`, left: `${mouseHandler.left+20}px`}" 
            v-if="ghost && state.hierarchy.selectedItem"
        >
            {{ state.hierarchy.selectedItem.id }}
        </div>

        <div class="absolute z-40 w-full" v-if="canvas.hierarchy">
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

<script>
import { useUserStore } from "~/store/user.store";

export default {
    props: {
        tab: { type: Object }, 
        canvas: { type: Object }
    },

    data(){
        return {
            state: useUserStore(),
            mouseHandler: { top: 200, left: 200 },
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
    },

    methods: {
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
                //if(root.)
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

        selectItem(item){
            this.state.hierarchy.selectedItem = item;
        },
    }
}
</script>
