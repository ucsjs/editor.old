<template>
    <div class="fixed bg-black/80 top-0 left-0 right-0 bottom-0 z-50 flex h-full justify-center items-center" style="z-index: 1001;">
        <div class="relative bg-neutral-800 w-2/5 m-auto rounded-lg border border-black">
            <div 
                class="p-2 rounded-t-xl border-b border-black bg-neutral-900 text-gray-50 font-bold flex justify-between"
            >
                <span>{{ $t('Edit component') }}</span>    
                
                <div class="mr-2 cursor-pointer" @click.prevent="close">
                    <font-awesome-icon icon="fa-solid fa-xmark"/>
                </div>
            </div>

            <div class="p-2 h-[300px] overflow-auto">
                <div v-for="(item, key) in list" :key="key" class="border border-black rounded-md p-2 relative mb-2">
                    <div 
                        v-for="(type, field) in fields" 
                        :key="field" 
                        v-show="field !== 'multi'"
                        class="flex flex-row items-center mb-1"
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
                        </div>
                    </div>

                    <button class="absolute right-3 top-2" @click="remove(key)">
                        <font-awesome-icon icon="fa-solid fa-trash" />
                    </button>
                </div>
            </div>

            <div class="flex pb-2 px-2 bg-neutral-900">
                <button @click="add" class="bg-gradient-to-b from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-900 w-full p-1 rounded-lg border border-black mt-2 mr-2">
                    {{ $t('Add')}}
                </button>

                <button @click="save" class="bg-blue-900 hover:bg-blue-800 w-full p-1 rounded-lg border border-black mt-2">
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
export default{
    props: {
        component: { type: Object },
        fields: { type: Object },
        values: { type: Array }
    },

    data(){
        return {
            list: [],
        }
    },

    mounted(){
        if(this.values)
            this.list = [ ...this.values ];
    },

    methods: {
        add(){
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

        save(){
            this.$emit('save', this.list);
        },

        close(){
            this.$emit('close');
        }
    }
}
</script>