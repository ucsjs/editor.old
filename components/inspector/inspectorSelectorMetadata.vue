<template>
    <select 
        class="bg-neutral-900 border border-black text-white px-1 h-7 w-full rounded-sm"
        v-model="modelValue"
        @change="changeValue($event.target.value)"
    >
        <option 
            value="null" 
            :selected="(
                modelValue == null || 
                modelValue == undefined || 
                modelValue == '')"
        ></option>
        
        <option 
            v-for="(option, key) in metadata" 
            :key="key" 
            :value="option" 
            :selected="modelValue === option"
        >{{ option }}</option>
    </select>
</template>

<script>
export default {
    props: ["modelValue", "metadata"],

    methods: {
        changeValue(v){
            this.$emit('update:modelValue', v);
            this.$emit('changeValue', v);
        }
    }
}
</script>