<template>
    <div 
        :class="[
            state.darktheme ? 'text-white bg-neutral-800' : 'text-gray-800 bg-neutral-200',
            'fixed z-50 min-w-[300px] py-2 rounded-lg cursor-pointer'
        ]" 
        :style="{top: `${state.contextMenu.position.top}px`, left: `${state.contextMenu.position.left}px`}"
        v-if="state.contextMenu.open"
    >
        <context-menu-item :items="state.contextMenu.items"></context-menu-item>
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