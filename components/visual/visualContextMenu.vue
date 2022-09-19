<template>
    <div 
        class="w-96 bg-neutral-800 absolute z-50 rounded-md p-2 text-slate-50 shadow-md shadow-neutral-800" 
        :style="{ top: `${position.top}px`, left: `${position.left}px`}"
        v-if="opened && componentsCategories"
        @click.stop="() => {}"
    >
        <div class="p-1 pb-2">
            {{ $t("All Components") }}
        </div>

        <div>
            <input v-model="search" class="w-full p-2 bg-neutral-900 rounded-md" :placeholder="$t('Search')" />
        </div>

        <div class="bg-neutral-900 mt-2 h-72 p-2 rounded-md overflow-auto">
            <visual-context-item :items="componentsCategories" :itemsFiltred="componentsFiltred" @addComponent="addComponent" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        components: {
            type: Array,
            default: []
        }
    },

    data(){
        return{
            opened: false,
            search: null,
            position: { top: 0, left: 0 },
            componentsCategories: {},
            componentsFiltred: [],
        };
    },

    watch: {
        components(){
            this.sortComponentsCategories();
        },

        search(){
            this.filterComponents();
        }
    },

    async mounted(){
        this.sortComponentsCategories();
    },

    methods: {
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

        filterComponents(){
            if(this.search){
                this.componentsFiltred = this.components.filter(item => {
                    return item.metadata.namespace.toLowerCase().includes(this.search.toLowerCase());
                });
            }
            else{
                this.componentsFiltred = [];
            }
        },

        addComponent(item) {
            this.$emit("addComponent", item, this.position);
            this.close();
        },

        open(position){
            this.position = { ...position };
            this.opened = true;
        },

        close(){
            this.opened = false;
        }
    }
}
</script>
