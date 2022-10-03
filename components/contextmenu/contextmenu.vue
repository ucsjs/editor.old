<template>
    <span>
        <div 
            class="bg-transparent absolute top-0 bottom-0 left-0 right-0 z-50" 
            v-if="!fixed && opened"
            @click.left="opened = false"
            @contextmenu="reposition"
        ></div>

        <div
            :class="[
                (fixed) ? 'w-full relative' : 'w-72 rounded-md absolute border border-neutral-900 shadow-sm shadow-neutral-800 z-50',
                ' bg-neutral-800 p-2 text-slate-50'
            ]" 
            :style="{ 
                top: `${position.top}px`, 
                left: `${position.left}px`,
                height: (fixed) ? `calc(100% - ${(showTitle) ? '90px' : '40px'} )` : ''
            }"
            v-if="opened || fixed"
            @click.stop=""
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

                <contextmenu-item 
                    :items="bluepritsCategories" 
                    :itemsFiltred="bluepritsFiltred" 
                    :dragItem="dragItem"
                    :fixed="fixed"
                    :addOnClick="addOnClick"
                    @addComponent="addComponent" 
                    @createGhost="createGhost"
                />
            </div>   
        </div>
    </span>
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
        mouseHandler: { type: Object },

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
        },

        components: {
            type: Array,
            default: []
        },

        url: {
            type: String,
            default: ''
        },

        addOnClick: {
            type: Boolean,
            default: false
        }
    },

    data(){
        return {
            opened: false,
            blueprits: [],
            bluepritsFiltred: [],
            bluepritsCategories: {},
            position: { top: 0, left: 0 },
            offset: { top: 0, left: 0 },
            search: null,
            loading: false,
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

        if(this.components?.length > 0){
            this.blueprits = this.components;
            this.sortBlueprintsCategories();
            this.loading = false;
        }
        else if(this.url){
            this.loadBlueprints(this.url);
        }
    },

    methods: {
        async loadBlueprints(url = null) {
            if((this.layer || url) && !this.loading){
                this.blueprits = [];
                this.bluepritsCategories = {};
                this.loading = true;

                this.blueprits = await useApi((url) ? url : `blueprints/${this.layer.toLocaleLowerCase()}`, { method: "GET" });

                if(this.blueprits)
                    await this.sortBlueprintsCategories();

                this.loading = false;
            }
        },

        async sortBlueprintsCategories() {
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
            console.log("addComponent");
            if(!this.fixed || this.addOnClick){
                this.close();
                this.$emit("addComponent", item, this.position);
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

        reposition(){
            this.position = { 
                top: this.mouseHandler.top, 
                left: this.mouseHandler.left
            };
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