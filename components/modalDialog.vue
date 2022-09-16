<template>
    <div 
        :class="[
            state.darktheme ? 'text-white' : 'text-neutral-800',
            'fixed top-0 left-0 right-0 bottom-0 justify-center items-center flex h-full bg-black/80'
        ]" 
        style="z-index: 100001;"
        v-if="open"
    >
        <div 
            :class="[
                state.darktheme ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800 border',
                'w-96 m-auto rounded-lg'
            ]"
        >
            <div :class="[
                state.darktheme ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-800 border-b',
                'flex p-2 rounded-t-lg '
            ]">
                <div class="flex flex-1 ml-1">
                    {{ title }}
                </div>

                <div class="flex">
                    <button :class="[state.darktheme ? 'bg-neutral-800 hover:bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-t', 'px-2  rounded-md']" @click="open = false">
                        <client-only>
                            <font-awesome-icon icon="fa-solid fa-xmark" />
                        </client-only>
                    </button>
                </div>
            </div>

            <div class="px-4 pt-4">
                {{ contents }}
            </div>
            
            <div :class="[
                'flex flex-row-reverse flex-1 p-2 rounded-b-lg pb-3 pt-3'
            ]">
                <button 
                    class="px-2 py-1 rounded-md ml-2 bg-red-700 hover:bg-red-500 text-white"
                    @click="confirm"
                >
                    {{ $t('Confirm') }}
                </button>

                <button class="px-2 py-1 rounded-md" @click="open = false">
                    {{ $t('Cancel') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useUserStore } from "~/store/user.store";

export default {
    data(){
        return {
            open: false,
            title: 'Title',
            contents: "",
            state: useUserStore()
        };
    },

    methods: {
        openDialog(title, contents, opts){
            if(opts){
                for(let key in opts)
                    this[key] = opts[key];
            }

            this.title = title;
            this.contents = contents;
            this.open = true;
        },

        confirm(){
            this.open = false;
            this.$emit('confirm');
        }
    }
}
</script>