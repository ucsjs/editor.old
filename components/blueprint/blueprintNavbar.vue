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
            'bg-neutral-900 mt-2 p-2 rounded-md overflow-auto relative'
        ]">
            <div class="bg-black/80 w-full h-full absolute top-0 left-0 bottom-0 right-0 z-50 m-auto text-center" v-if="loading">
                <div class="align-middle content-between inline-block bg-white text-black p-4 rounded-lg mt-10">
                    <div class="flex">
                        <div class="mr-2">
                            <div class="spinner"></div>
                        </div>
                        <div>{{ $t('Loading...') }}</div>                    
                    </div>
                </div>
            </div>

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
.spinner {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3.8px solid;
    border-color: rgba(219, 220, 239, 0.49);
    border-right-color: #d6d6d6;
    animation: spinner-d3wgkg 1s infinite linear;
}

@keyframes spinner-d3wgkg {
    to {
        transform: rotate(1turn);
    }
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

        layer: {
            type: String
        }
    },

    data(){
        return {
            opened: false,
            blueprits: [],
            bluepritsFiltred: [],
            bluepritsCategories: {},
            position: { top: 0, left: 0 },
            search: null,
            loading: true,
        }
    },

    watch: {
        search(){
            this.filterComponents();
        },

        layer(){
            this.loadBlueprints();
        }
    },

    mounted(){
        this.loadBlueprints();
    },

    methods: {
        async loadBlueprints() {
            this.loading = true;
            this.blueprits = [];
            this.bluepritsCategories = {};

            if(this.layer){
                this.blueprits = await useApi(`blueprints/${this.layer.toLocaleLowerCase()}`, { method: "GET" });

                if(this.blueprits)
                    this.sortBlueprintsCategories();
            }

            this.loading = false;
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
                this.$emit("addComponent", item, this.transform);
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