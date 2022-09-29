<template>
    <div class="flex">
        <input 
            class="bg-neutral-900 border border-r-0 border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
            type="text" 
            v-model="modelValue"
            @keyup="changeValue($event.target.value)" 
            @change="changeValue($event.target.value)"
        />

        <div v-if="property.includes('border')">
            <select 
                class="bg-neutral-900 border border-l-0 w-16 border-black text-white px-1 h-7 rounded-t-sm rounded-b-sm"
                v-model="sufix"
                @change="changeSufix($event.target.value)"
            >
                <option 
                    v-for="(option, key) in pxSufixBorder" 
                    :key="key" 
                    :value="option" 
                    :selected="sufix === option"
                >{{ option }}</option>
            </select>
        </div>
        <div v-else>
            <select 
                class="bg-neutral-900 border border-l-0 w-16 border-black text-white px-1 h-7 rounded-t-sm rounded-b-sm"
                v-model="sufix"
                @change="changeSufix($event.target.value)"
            >
                <option 
                    v-for="(option, key) in pxSufix" 
                    :key="key" 
                    :value="option" 
                    :selected="sufix === option"
                >{{ option }}</option>
            </select>
        </div>
    </div>
</template>

<script>
export default {
    props: ["modelValue", "sufix", "property"],

    data(){
        return {
            pxSufix: ["px", "em", "%", "auto", "max-content", "min-content", "inherit", "initial", "revert", "revert-layer", "unset"],
            pxSufixBorder: ["px", "medium", "thin", "thick", "length", "initial", "inherit"],
        }
    },

    mounted(){
        if(this.sufix == undefined){
            this.$emit("update:sufix", "px");
            this.$emit('changeSufix', "px");
        }            
    },  

    methods: {
        changeValue(v){
            this.$emit('update:modelValue', v);
            this.$emit('changeValue', v);
        },

        changeSufix(v){
            this.$emit('update:sufix', v);
            this.$emit('changeSufix', v);
        }
    }
}
</script>