<template>
    <div class="flex h-6">
        <div class="w-4/6 mr-2">
            <input      
                v-model="modelValue"                                   
                id="default-range" 
                type="range" 
                :min="min" 
                :max="max"
                :step="step"
                class="w-full h-1 bg-gray-200 rounded-lg appearance-none range-sm cursor-pointer dark:bg-gray-700"
                @change="changeValue($event.target.value)"
            >
        </div>
        <div class="w-2/6">
            <input 
                v-model="modelValue" 
                class="bg-neutral-900 border border-black text-white px-1 h-6 text-sm w-full rounded-sm" 
                type="text"
                @keyup="changeValue($event.target.value)"
                @change="changeValue($event.target.value)"
            />
        </div>
    </div> 
</template>

<script>
export default {
    props: ["modelValue", "min", "max", "step"],

    methods: {
        changeValue(v){
            this.$emit('update:modelValue', v);
            this.$emit('changeValue', v);
        }
    }
}
</script>
