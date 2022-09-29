<template>
    <textarea 
        :value="modelValue.content"
        class=" w-full h-56 p-1 bg-neutral-900 border-black"
        placeholder="Text..."
        @keyup="changeValue($event.target.value)" 
        @change="changeValue($event.target.value)"
    ></textarea>
</template>

<script>
export default {
    props: ["modelValue"],

    methods: {
        changeValue(v){
            this.$emit('update:modelValue', { content : v });
            this.$emit('changeValue');
        }
    }
}
</script>
