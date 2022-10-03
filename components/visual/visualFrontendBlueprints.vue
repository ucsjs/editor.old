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
                    class="h-10 w-12 mr-2 rounded-md border flex align-middle justify-center cursor-pointer z-50 bg-white/10 hover:bg-white/30 border-white/20 hover:border-white/50"
                    :title="$t('Add Blueprint')"
                    @click.left="addBlueprint()"
                >
                    <client-only><font-awesome-icon icon="fa-solid fa-plus" class="mt-2.5 text-white/50" /></client-only>

                    <div class="bg-transparent fixed w-full h-full left-0 right-0 z-50" v-if="open" @click.left.stop="open = false"></div>
                    
                    <div 
                        class="absolute w-72 bg-neutral-800 h-96 mt-11 ml-60 z-50 shadow rounded-md border border-black" 
                        v-if="open" 
                        @click.left.stop="() => {}"
                    >
                        <div class="absolute w-full h-full rounded-md">
                            <contextmenu
                                ref="navbar"
                                :fixed="true"
                                :showTitle="false"
                                :url="'visual/frontend'"
                                :addOnClick="true"
                                @addComponent="(component) => addComponent(component, index)" 
                            />  
                        </div>
                    </div>
                </div>
                <div 
                    :class="[
                        (this.selected?.blueprint.namespace === item.blueprint.namespace) ? 'border-red-600' : 'border-white/20 hover:border-white/50',
                        'h-10 w-12 mr-2 rounded-md border flex align-middle justify-center cursor-pointer z-50 relative'
                    ]"
                    v-for="(item, index) in slots" 
                    :key="index"
                    :title="`${item.blueprint.metadata.group}::${item.blueprint.namespace}`"
                    :style="{'background-color': (item.blueprint) ? item.blueprint.metadata.headerColor.hex : ''}"
                    @click.left="selectComponent(index)"
                >
                    <client-only><font-awesome-icon :icon="item.blueprint.icon" class="mt-2.5 text-white" v-if="item.blueprint" /></client-only>

                    <button 
                        class="absolute w-6 -top-1.5 -right-2 rounded-md bg-neutral-900/50 hover:bg-neutral-900 z-50"
                        :title="$t('Remove Blueprint')"
                        @click="removeComponent(index)"
                    >
                        <client-only><font-awesome-icon icon="fa-solid fa-xmark" class="text-white" /></client-only>
                    </button>
                </div>                
            </div>
        </div>

        <ModalDialog 
            :type="'alert'"
            ref="modalComponentExists" 
        />
    </div>
</template>

<script>
import { useStateStore } from "~~/store/state.store";

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
            state: useStateStore(),
            notEmit: false,
            open: false,
            selected: null,
            slots: []
        }
    },

    mounted(){
        if(this.modelValue?.length > 0)
            this.slots = this.modelValue
    },

    methods: {
        addBlueprint(item = null){
            if(item?.blueprint){
                
            }
            else{
                this.slots.map((slot) => slot.open = false);
                this.open = !this.open
            }
        },

        hasComponent(component){
            let has = false;

            for(let item of this.slots){
                if(item.blueprint.namespace === component.namespace)
                    has = true;
            }

            return has;
        },

        addComponent(component){
            if(!this.hasComponent(component)){
                this.slots.push({
                    blueprint: component,
                    open: false
                });

                this.selectComponent(this.slots.length - 1);
                this.$emit('update:modelValue', this.slots);
                this.$emit('updateValue', this.slots);
            }
            else{
                this.$refs.modalComponentExists.openDialog("Alert", "The selected component is already attached to the page, it is not possible to add the same component twice");
            }

            this.open = false;
        },

        selectComponent(index){
            this.selected = this.slots[index];
            this.$emit("selectComponent", this.selected);
        },

        unselectComponent(){
            this.selected = null;
        },

        removeComponent(index){
            this.slots.splice(index, 1);
            this.$emit('update:modelValue', this.slots);
            this.$emit('updateValue', this.slots);
        },

        async openComponent(item){
            if(this.state.hasTab(item)){
                this.state.selectTab(this.state.getTabIndex(item));
            }
            else{
                const content = await useApi(`files/open?filename=${encodeURIComponent(item.filename)}`, {
                    method: "GET"
                });

                this.state.openTab({ content, recent: true });
            }
        },
    }
}
</script>