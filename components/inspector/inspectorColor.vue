<template>
    <div class="text-white pt-1 h-full relative" @click.stop="() => {}">
        <div class="fixed bg-transparent w-full h-full top-0 left-0 right-0 bottom-0 z-50" v-if="open" @click.stop="open = false"></div>

        <div 
            class="border border-black h-full flex justify-end relative text-sm" 
            :style="{ backgroundColor: colors.hex || defaultValue || '#FFFFFF' }"                                                                                             
        >
            <input 
                class="border-0 w-full text-sm" 
                type="text" 
                v-model="colors.hex"                                                 
                :style="{ backgroundColor: (colors.hex || defaultValue || '#FFFFFF') }"
                @keyup="changeValue"
                @change="changeValue"
                @input="changeValue"
                @click.prevent="open = true"
            />

            <div class="absolute top-6 z-50" v-if="open">
                <Chrome v-model="colors" @input="changeValue"></Chrome>
            </div>
        </div>
    </div>
</template>

<script>
import { Chrome } from '@ckpack/vue-color';

export default {
    props: ["modelValue", "defaultValue"],

    components: { Chrome },

    watch: {
        colors(){
            this.changeValue();
        }
    },

    data(){
        return {
            open: false,
            colors: { hex: "#FFFFFF" }
        }
    },

    mounted(){
        this.colors = this.modelValue;
    },

    methods: {
        changeValue(){
            this.$emit('changeValue', this.colors);
        }
    }
}
</script>