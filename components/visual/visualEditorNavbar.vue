<template>
    <div 
        :class="[state.darktheme ? 'bg-neutral-900 border-black' : 'bg-neutral-200', 'h-10 w-full border-b']"
    ></div>
</template>

<script>
import { useStateStore } from "~~/store/state.store";

export default {
    data(){
        return {
            state: useStateStore()
        }
    }
}
</script>