<template>
    <div class="flex">
        <input 
            class="bg-neutral-900 border border-r-0 border-black text-white px-1 h-7 text-sm w-full rounded-sm" 
            type="text" 
            v-model="modelValue"
            @keyup="changeValue($event.target.value)" 
            @change="changeValue($event.target.value)"
        />

        <div>
            <select 
                class="bg-neutral-900 border border-l-0 w-16 border-black text-white px-1 h-7 rounded-t-sm rounded-b-sm"
                v-model="sufix"
                @change="changeSufix($event.target.value)"
            >
                <option 
                    v-for="(option, key) in px" 
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
            pxSufix: ["px", "cm", "mm", "in", "pt", "pc", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax", "%", "auto", "max-content", "min-content", "inherit", "initial", "revert", "revert-layer", "unset"],
            pxSufixBorder: ["px", "cm", "mm", "in", "pt", "pc", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax", "medium", "thin", "thick", "length", "initial", "inherit"],
            pxMarginPadding: ["px", "cm", "mm", "in", "pt", "pc", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax", "%", "auto", "initial", "inherit"],
            px: []
        }
    },

    mounted(){
        if(this.property.includes('border'))
            this.px = this.pxSufixBorder;
        else if(this.property.includes('margin') || this.property.includes('padding'))
            this.px = this.pxMarginPadding;
        else
            this.px = this.pxSufix;

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