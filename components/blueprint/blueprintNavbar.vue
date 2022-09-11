<template>
    <div 
        class="w-96 bg-neutral-800 absolute z-50 rounded-lg p-2 text-slate-50 shadow-md shadow-neutral-800" 
        :style="{ top: `${position.top}px`, left: `${position.left}px`}"
        v-if="opened"
    >
        <div class="p-1 pb-2">
            {{ $t("All Blueprints") }}
        </div>

        <div>
            <input class="w-full p-2 bg-neutral-900 rounded-md" :placeholder="$t('Search')" />
        </div>

        <div class="bg-neutral-900 mt-2 h-72 p-2 rounded-md overflow-auto">
            <blueprint-navbar-item :items="bluepritsCategories" @addComponent="addComponent" @onPointer="onPointer" />
        </div>
    </div>
</template>

<style scoped>    
* {
    scrollbar-width: auto;
    scrollbar-color: #262626 #000000;
}

*::-webkit-scrollbar {
    width: 16px;
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
    data(){
        return {
            opened: false,
            blueprits: [],
            bluepritsCategories: {},
            position: { top: 0, left: 0 }
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
                if(!this.bluepritsCategories[item.metadata.type])
                    this.bluepritsCategories[item.metadata.type] = [];
                
                this.bluepritsCategories[item.metadata.type].push(item);
            }
        },

        addComponent(item) {
            this.$emit("addComponent", item);
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
};
</script>