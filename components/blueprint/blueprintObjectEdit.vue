<template>
    <div class="fixed bg-black/80 top-0 left-0 right-0 bottom-0 z-50 flex h-full justify-center items-center text-white" style="z-index: 1001;">
        <div class="relative bg-neutral-800 w-2/5 m-auto rounded-lg border border-black">
            <div 
                class="p-2 rounded-t-xl border-b border-black bg-neutral-900 text-gray-50 font-bold flex justify-between"
            >
                <span>{{ $t('Edit') }}</span>    
                
                <div class="mr-2 cursor-pointer" @click.prevent="close">
                    <client-only><font-awesome-icon icon="fa-solid fa-xmark"/></client-only>
                </div>
            </div>

            <div class="p-2 h-[300px] overflow-auto">
                <div v-if="fields && fields.multi" class="w-full">
                    <div v-for="(item, key) in list" :key="key" class="border border-black rounded-md p-2 relative mb-2">
                        <div 
                            v-for="(type, field) in fields" 
                            :key="field" 
                            v-show="field !== 'multi' && field !== 'createOutputs'"
                            class="flex flex-row items-center mb-1 mr-2"
                        >
                            <div>
                                {{ field }}: 
                            </div>

                            <div>
                                <div v-if="component.metadata && component.metadata[field]">
                                    <select 
                                        class="bg-neutral-800 border border-black text-white px-1 ml-2"
                                        @change="editList(key, field, $event.target.value)"
                                    >
                                        <option 
                                            v-for="(option, key) in component.metadata[field]"
                                            :key="key" 
                                            :value="option"
                                            :selected="item[field] == option"
                                        >{{ option }}</option>
                                    </select>
                                </div>
                                <input 
                                    v-else-if="type == 'String' || type == 'string'" 
                                    class="max-w-[80px] bg-neutral-800 border border-black text-white px-1 ml-2" 
                                    type="text" 
                                    :value="item[field]"
                                    @keyup="editList(key, field, $event.target.value)" 
                                />
                                <input 
                                    v-else-if="type == 'number' || type == 'Number' || type == 'Int'" 
                                    class="max-w-[80px] bg-neutral-800 border border-black text-white px-1 ml-2" 
                                    type="number"
                                    :value="item[field]"
                                    @keyup="editList(key, field, $event.target.value)"  
                                />
                                
                                <div v-else-if="type == 'boolean' || type == 'Boolean' || type == 'Bool'" class="text-white px-1">
                                    <Switch 
                                        v-model="item[field]" 
                                        class="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-black focus:outline-none"
                                    >
                                        <span class="sr-only">Use setting</span>
                                        <span aria-hidden="true" class="pointer-events-none absolute h-full w-full rounded-md" />
                                        <span aria-hidden="true" :class="[item[field] ? 'bg-indigo-600' : 'bg-neutral-700', 'pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out']" />
                                        <span aria-hidden="true" :class="[item[field] ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-black bg-neutral shadow ring-0 transition-transform duration-200 ease-in-out']" />
                                    </Switch>
                                </div>
                            </div>
                        </div>

                        <button class="absolute right-3 top-2" @click="remove(key)">
                            <client-only><font-awesome-icon icon="fa-solid fa-trash" /></client-only>
                        </button>
                    </div>
                </div>
                <div v-else class="relative w-full h-full">                   
                    <monaco-editor :value="values" @changeContents="changeEditor" />                    
                </div>                
            </div>

            <div class="bg-red-900 mx-2 mb-2 p-2 text-sm" v-if="this.error">
                <client-only><font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="mr-1" /></client-only>
                {{ this.error }}
            </div>

            <div class="flex pb-2 px-2 bg-neutral-900">
                <button 
                    v-if="fields && fields.multi"
                    @click="add" 
                    class="bg-gradient-to-b from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 w-full p-1 rounded-lg border border-black mt-2 mr-2"
                >
                    {{ $t('Add')}}
                </button>

                <button 
                    :disabled="this.error"
                    @click="save" 
                    :class="[(this.error) ? 'bg-gray-700': 'bg-blue-900 hover:bg-blue-800', 'w-full p-1 rounded-lg border border-black mt-2']"
                >
                    {{ $t('Save')}}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
* {
    scrollbar-width: auto;
    scrollbar-color: #262626 #000000;
}

*::-webkit-scrollbar {
    width: 8px;
}

*::-webkit-scrollbar-track {
    background: #000000;
}

*::-webkit-scrollbar-thumb {
    background-color: #262626;
    border-radius: 0px;
    border: 3px solid #262626;
}
</style>

<script>
import { Switch } from '@headlessui/vue';

export default{
    components: { Switch },

    props: {
        component: { type: Object },
        fields: { type: Object },
        input: { type: Object }, 
        values: { type: Array },
        keyItem: { type: String }
    },

    data(){
        return {
            list: [],
            error: null
        }
    },

    mounted(){
        if(Array.isArray(this.values))
            this.list = [ ...this.values ];
        else 
            this.list = this.values;  
    },

    methods: {
        add(key){
            if(!this.list)
                this.list = [];

            this.list.push({});
        },

        remove(index){
            this.list.splice(index, 1);
        },

        editList(key, field, value){
            if(!this.list[key])
                this.list[key] = {};

            this.list[key][field] = value;
        },

        changeEditor(contents){
            try {
                if(contents){
                    const object = JSON.parse(contents);

                    if((!object.isTrusted))
                        this.list = object

                    this.error = null;
                }
                else{
                    this.list = null;
                    this.error = null;
                }                
            } catch (error) {
                this.error = error;
            }   
        },

        save(){
            if(Array.isArray(this.list)){
                for(let key in this.list)
                    this.list[key].key = `${this.input.id}-${this.keyItem}-${key}`;
            }

            console.log(this.list);
            
            if(this.list)
                this.$emit('save', (Array.isArray(this.list)) ? [...this.list] : {...this.list});
            else
                this.$emit('save', null);
        },

        close(){
            this.$emit('close');
        }
    }
}
</script>