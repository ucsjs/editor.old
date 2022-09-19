<template>
    <ol @mouseout.stop="() => {}">
        <li 
            v-for="(item, key) in items"
            :key="key"
            @click.prevent="() => { if(item.action) item.action(item) }"
        >
            <div v-if="!item.separete && !item.items" class="flex flex-row px-5 py-1 hover:bg-[#04395e] hover:text-white">
                <div class="flex flex-1">{{ item.label }}</div>
                
                <div v-if="item.shortcut" class="flex justify-end">{{ item.shortcut }}</div>
            </div>
            <div 
                v-else-if="item.items" 
                class="flex flex-row px-5 py-1 hover:bg-[#04395e] hover:text-white"
                @mouseover="item.open = true" 
            >
                <div class="flex flex-1">{{ item.label }}</div>

                <div class="flex justify-end mt-1 relative" >
                    <client-only><font-awesome-icon icon="fa-solid fa-caret-right" /></client-only>

                    <div 
                        :class="[
                            state.darktheme ? 'text-white bg-neutral-800 border-black' : 'text-gray-800 bg-neutral-200',
                            'absolute min-w-[300px] py-2 rounded-lg cursor-pointer h-10 left-4 z-50 shadow-lg'
                        ]"
                        v-if="item.open"
                    >
                        <div 
                            :class="[
                                state.darktheme ? 'text-white bg-neutral-800' : 'text-gray-800 bg-neutral-200',
                                'z-50 min-w-[300px] pb-2 rounded-lg cursor-pointer'
                            ]" 
                        >
                            <context-menu-item 
                                :items="item.items" 
                                @mouseover="item.open = true"
                                @mouseleave.stop="item.open = false" 
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <hr :class="[
                    state.darktheme ? 'border-neutral-500' : 'border-neutral-300',
                    'my-2 border-1'
                ]" />
            </div>
        </li>
    </ol>
</template>

<script>
import { useUserStore } from "~/store/user.store";

export default {
    props: {
        items: {
            type: Array,
            default: []
        }
    },

    data(){
        return {
            state: useUserStore()
        };
    }
}
</script>