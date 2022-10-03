<template>
    <div
        @mouseup="dropComponent(null)"
        class="select-none"
    >
        <div class="bg-transparent fixed top-0 left-[30%] bottom-0 right-0 z-40" @click="unselectComponent"></div>

        <div class="bg-black/80 transition-all duration-500 w-full h-full absolute top-0 z-50 right-0" >
            <div 
                class="absolute bg-neutral-800 h-full top-0 right-0" 
                :style="{width: `calc(100% - 20px)`, 'z-index': 1000}"
            >
                <div class="bg-neutral-900 border-b border-black text-lg font-bold p-2 uppercase text-center">
                    <div class="flex justify-center">
                        <div class="mr-2">
                            <client-only><font-awesome-icon :icon="component.blueprint.metadata.headerIcon.icon" class="text-white" /></client-only>
                        </div>
                        <div>{{ component.blueprint.group }}::{{ component.blueprint.namespace }}</div>
                    </div>
                </div>

                <div class="bg-neutral-800 w-full border-b border-black text-sm text-neutral-400 py-2">
                    <div 
                        v-for="(blueprint, key) in component.blueprint.items" 
                        :key="key"
                        @click="selectInput = { property: { id : blueprint.componentKey } }"
                    >
                        <div class="flex flex-1" v-if="blueprint.extends == 'Blueprint' && blueprint.metadata.group == 'Visual Objects' && blueprint.metadata.componentLink">
                            <div class="flex-1 flex p-0.5">
                                <div class="w-3/6 h-7 flex ml-1 z-10">                                  
                                    <div 
                                        class="ml-2 text-sm mt-1 text-sm mt-1 text-ellipsis overflow-hidden whitespace-nowrap w-[100px]"
                                        :title="`${uppercaseFirstLetter(blueprint.metadata.namespace)} ${(blueprint.name) ? '['+ blueprint.name +']' : ''}`"
                                    >
                                        {{ uppercaseFirstLetter(blueprint.metadata.namespace) }} 
                                        <span v-if="blueprint.name">[{{blueprint.name}}]</span>
                                    </div>
                                </div>

                                <div class="h-7 pr-2 w-3/6">
                                    <inspector-component                                                                                 
                                        v-model="blueprint.value"
                                        :selectInput="selectInput"
                                        :property="blueprint"
                                        :id="blueprint.componentKey"
                                        @mouseup="dropComponent(key)"                    
                                    />
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useStateStore } from "~/store/state.store";
import globalMixin from "@/mixins/globalMixin";

export default {
    mixins: [globalMixin],

    props: {
        component: { 
            type: Object,
            default: null 
        },

        eventSelectedLabel: {
            type: String,
            default: null
        }
    },

    data(){
        return {
            state: useStateStore(),
            eventSelectedVariation: null,
            values: {},
            selectInput: null
        }
    },

    methods: {
        unselectComponent(){
            this.$emit('unselectComponent');
        },

        dropComponent(key){   
            if(key && this.component.blueprint.items[key] && this.state.hierarchy.ghost)
                this.component.blueprint.items[key].value = this.state.hierarchy.ghost;

            this.$emit('updateLink', this.component);
            this.state.hierarchy.ghost = null;
        },
    }
}
</script>