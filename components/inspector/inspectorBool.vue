<template>
    <div class="text-white pt-1">
        <label :for="id" class="relative items-center cursor-pointer">
            <input 
                type="checkbox" 
                v-model="modelValue" 
                :id="id" 
                class="sr-only peer"
                @change="changeValue($event.target.checked)"
            >
            <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full p after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
    </div>
</template>

<script>
export default {
    props: ["modelValue", "id"],

    mounted(){
        if(!this.modelValue)
            this.$emit('update:modelValue', false);
    },

    methods: {
        changeValue(v){
            this.$emit('update:modelValue', v);
            this.$emit('changeValue', v);
        }
    }
}
</script>