<template>
    <input 
        class="bg-neutral-900 border border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
        type="number" 
        v-model="modelValue"
        @keyup="changeValue($event.target.value)" 
        @change="changeValue($event.target.value)"
    />
</template>

<script>
export default {
    props: ["modelValue"],

    mounted(){
        if(!this.modelValue){
            this.$emit('update:modelValue', 0);
            this.$emit('changeValue', 0);
        }
    },

    methods: {
        changeValue(v){
            this.$emit('update:modelValue', v);
            this.$emit('changeValue', v);
        }
    }
}
</script>
