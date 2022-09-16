<template>
    <div 
        :class="[
            state.darktheme ? 'text-white bg-neutral-800' : 'text-gray-800 bg-neutral-200',
            'fixed z-50 min-w-[300px] py-2 rounded-lg cursor-pointer'
        ]" 
        :style="{top: `${state.contextMenu.position.top}px`, left: `${state.contextMenu.position.left}px`}"
        v-if="state.contextMenu.open"
    >
        <ol>
            <li 
                v-for="(item, key) in state.contextMenu.items"
                :key="key"
                @click.prevent="() => item.action(item.ref)"
            >
                <div v-if="!item.separete" class="flex flex-row px-5 py-1 hover:bg-[#04395e] hover:text-white">
                    <div class="flex flex-1">{{ item.label }}</div>
                    
                    <div v-if="item.shortcut" class="flex justify-end">{{ item.shortcut }}</div>
                </div>
                <div v-else>
                    <hr :class="[
                        state.darktheme ? 'border-neutral-500' : 'border-neutral-300',
                        'my-2 border-1'
                    ]" />
                </div>
            </li>
        </ol>
    </div>
</template>

<script>
import { useUserStore } from "~/store/user.store";

export default {
    data(){
        return {
            state: useUserStore()
        };
    }
}   
</script>