<template>
    <div 
        class="w-full overflow-auto border-transparent z-50" 
    > 
        <div class="text-white text-sm absolute w-full h-6 top-0 left-0 p-0.5 bg-neutral-900 z-40 border-b border-black flex flex-1">
            Frontend Blueprints
        </div>

        <div class="flex flex-1 mt-6">
            <div class="grid grid-rows-1 grid-flow-col auto-cols-max p-2">
                <div 
                    :class="[
                        (item.blueprint) ? '' : 'bg-white/10 hover:bg-white/30 border-white/20 hover:border-white/50',
                        'h-10 w-12 mr-2 rounded-md border flex align-middle justify-center cursor-pointer z-50'
                    ]"
                    v-for="(item, index) in slots" 
                    :key="index"
                    :title="$t('Add Blueprint')"
                    :style="{'background-color': (item.blueprint) ? item.blueprint.metadata.headerColor.hex : ''}"
                    @click.left="addOrEditBlueprint(item)"
                >
                    <client-only><font-awesome-icon icon="fa-solid fa-plus" class="mt-2.5 text-white/50" v-if="!item.blueprint" /></client-only>
                    <client-only><font-awesome-icon :icon="item.blueprint.icon" class="mt-2.5 text-white" v-if="item.blueprint" /></client-only>

                    <div class="bg-transparent fixed w-full h-full left-0 right-0 z-50" v-if="item.open" @click.left.stop="item.open = false"></div>
                    
                    <div class="absolute w-72 bg-neutral-800 h-96 mt-11 ml-60 z-50 shadow rounded-md border border-black" v-if="item.open && !item.blueprint" @click.left.stop="() => {}">
                        <div class="absolute w-full h-full rounded-md">
                            <contextmenu
                                ref="navbar"
                                :fixed="true"
                                :showTitle="false"
                                :url="'visual/frontend'"
                                :addOnClick="true"
                                @addComponent="(component) => selectComponent(component, index)" 
                            />  
                        </div>
                    </div>
                </div>                
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: Array,
            default: () => []
        },
    },

    watch: {
        modelValue(){
            this.notEmit = true;

            if(this.modelValue?.length)
                this.slots = this.modelValue;
        }
    },

    data(){
        return {
            notEmit: false,
            slots: []
        }
    },

    mounted(){
        if(this.modelValue?.length > 0){
            this.slots = this.modelValue
        } 
        else {
            this.slots.push({
                index: 0,
                open: false
            })
        }
    },

    methods: {
        addOrEditBlueprint(item){
            if(item.blueprint){

            }
            else{
                this.slots.map((slot) => slot.open = false);
                item.open = !item.open
            }
        },

        selectComponent(component, index){
            this.slots[index].blueprint = component;
            this.slots[index].open = false;
            this.$emit('update:modelValue', this.slots);
            this.$emit('updateValue', this.slots);

            this.slots.push({
                index: this.slots.length,
                open: false
            })
        }
    }
}
</script>