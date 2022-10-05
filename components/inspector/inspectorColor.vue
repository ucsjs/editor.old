<template>
    <div class="text-white pt-1 h-full relative" @click.stop="() => {}">
        <div class="fixed bg-transparent w-full h-full top-0 left-0 right-0 bottom-0 z-50" v-if="open" @click.stop="open = false"></div>

        <div 
            class="border border-black h-full flex justify-end relative text-sm bg-neutral-900"                                                                                             
        >
            <div 
                class="absolute left-0 top-0 h-4 w-4 m-1 rounded-sm border border-black" 
                :style="{ backgroundColor: (colors.hex || defaultValue) }">
            </div>

            <input 
                class="border-0 text-sm pr-0 bg-neutral-900 h-5 mt-0.5" 
                :style="{width: 'calc(100% - 25px)'}"
                type="text" 
                v-model="colors.hex"                                                
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

<style scoped>
input{
    text-shadow: 1px 1px 2px black;
}
</style>

<script>
import { Chrome } from '@ckpack/vue-color';

export default {
    props: ["modelValue", "defaultValue"],

    components: { Chrome },

    watch: {
        colors(){
            this.changeValue();
        },

        modelValue(){
            this.notEmit = true;
            
            if(this.colors.hex != this.modelValue.hex)
                this.colors = this.modelValue;
        }
    },

    data(){
        return {
            notEmit: false,
            open: false,
            colors: { hex: "" }
        }
    },

    mounted(){
        if(!this.modelValue){
            this.$emit('update:modelValue', { hex: "" });
            this.colors = { hex: "" };
        }
        else{
            this.colors = this.modelValue;
        }
    },

    methods: {
        changeValue(){
            if(!this.notEmit)
                this.$emit('changeValue', this.colors);
            
            this.notEmit = false;
        }
    }
}
</script>