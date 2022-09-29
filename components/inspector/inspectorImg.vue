<template>
    <div>
        <div 
            class="border border-black h-full flex justify-end relative text-sm" 
            v-if="modelValue"                                                                                         
        >
            <input 
                type="hidden" 
                v-model="modelValue" 
                @change="changeValue" 
                @input="changeValue" 
            />

            <input 
                v-if="modelValue"
                class="bg-neutral-900 border border-black text-white px-1 h-6 text-sm w-full rounded-sm"
                type="text" 
                v-model="modelValue.src"
                @change="changeValue" 
                @input="changeValue" 
            />

            <button 
                class="px-1 hover:bg-neutral-900" 
                @click="state.fileDialogOpen((path) => { 
                    modelValue.src = path;
                    changeValue()
                    $forceUpdate() 
                })"
            >
                <Tooltip :tooltipText="$t('Upload')" position="left">
                    <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" />
                </Tooltip>
            </button>
        </div>
    </div>
</template>

<script>
import { useStateStore } from "~/store/state.store";

export default {
    props: ["modelValue"],

    data(){
        return {
            state: useStateStore(),
        }
    },

    methods: {
        changeValue(){
            this.$emit('changeValue', this.modelValue);
        }
    }
}
</script>