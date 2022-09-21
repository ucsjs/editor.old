<template>
    <div
        :class="[
            (fixed) ? 'w-full relative' : 'w-96 rounded-md absolute z-50 shadow-md shadow-neutral-800',
            ' bg-neutral-800 p-2 text-slate-50'
        ]" 
        :style="{ 
            top: `${position.top}px`, 
            left: `${position.left}px`,
            height: (fixed) ? 'calc(100% - 90px)' : ''
        }"
        v-if="opened || fixed"
    >
        <div class="p-1 pb-2" v-if="showTitle">
            {{ $t("All Blueprints") }}
        </div>

        <div>
            <input v-model="search" class="w-full p-1 bg-neutral-900 rounded-md" :placeholder="$t('Search')" />
        </div>

        <div :class="[
            (fixed) ? 'h-full' : 'h-72 ',
            'bg-neutral-900 mt-2 p-2 rounded-md overflow-auto'
        ]">
            <blueprint-navbar-item 
                :items="bluepritsCategories" 
                :itemsFiltred="bluepritsFiltred" 
                :dragItem="dragItem"
                :fixed="fixed"
                @addComponent="addComponent" 
                @createGhost="createGhost"
            />
        </div>        
    </div>
</template>

<style scoped>    
* {
    scrollbar-width: auto;
    scrollbar-color: #262626 #000000;
}

*::-webkit-scrollbar {
    width: 8px;
}

*::-webkit-scrollbar-track {
    background: #000000;
}

*::-webkit-scrollbar-thumb {
    background-color: #262626;
    border-radius: 0px;
    border: 3px solid #262626;
}
</style>

<script>
export default{
    props: {
        fixed: {
            type: Boolean,
            default: false
        },

        showTitle: {
            type: Boolean,
            default: true
        },

        dragItem: {
            type: Boolean,
            default: false
        },
    },

    data(){
        return {
            opened: false,
            blueprits: [],
            bluepritsFiltred: [],
            bluepritsCategories: {},
            position: { top: 0, left: 0 },
            search: null,
        }
    },

    watch: {
        search(){
            this.filterComponents();
        }
    },

    mounted() {
        this.loadBlueprints();
    },

    methods: {
        async loadBlueprints() {
            this.blueprits = await useApi(`blueprints`, { method: "GET" });
            this.sortBlueprintsCategories();
        },

        sortBlueprintsCategories() {
            for(let item of this.blueprits){
                if(!this.bluepritsCategories[item.metadata.group])
                    this.bluepritsCategories[item.metadata.group] = [];
                
                this.bluepritsCategories[item.metadata.group].push(item);
            }

            this.bluepritsCategories = Object.keys(this.bluepritsCategories).sort().reduce(
                (obj, key) => { 
                    obj[key] = this.bluepritsCategories[key]; 
                    return obj;
                }, 
                {}
            );
        },

        filterComponents(){
            if(this.search){
                this.bluepritsFiltred = this.blueprits.filter(item => {
                    return item.namespace.toLowerCase().includes(this.search.toLowerCase());
                });
            }
            else{
                this.bluepritsFiltred = [];
            }
        },

        addComponent(item) {
            if(!this.fixed){
                this.$emit("addComponent", item, this.position);
                this.close();
            }
        },

        createGhost(item){
            if(this.fixed){
                this.$emit("createGhost", item);
            }
        },

        open(position){
            this.position = { ...position };
            this.opened = true;
        },

        close(){
            this.opened = false;
        },

        saveState(){
            localStorage.setItem(`blueprint-navbar`, JSON.stringify({
                opened: this.opened,
                blueprits: this.blueprits,
                bluepritsFiltred: this.bluepritsFiltred,
                bluepritsCategories: this.bluepritsCategories,
                search: this.search,
            }));
        }
    }
};
</script>