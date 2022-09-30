<template>
    <div :class="[state.darktheme ? 'bg-black' : 'bg-white']">
        <slot />
    </div>
</template>

<style lang="scss">
@import "~/assets/main.scss";
</style>

<style>
body{
    overflow: hidden;
}
</style>

<script>
import { useStateStore } from "~/store/state.store";

export default {
    data(){
        return {
            state: useStateStore()
        }
    },

    created () {   
        if(process.client) 
            window.addEventListener('beforeunload', this.beforeunload)  
    },

    mounted(){
        if(process.client){
            const stateCache = localStorage.getItem("state");

            if(stateCache)
                this.state.use(stateCache);
        }

        setInterval(() => {
            this.state.saveState();
        }, 10000)
    },

    methods: {
        beforeunload(event){
            this.state.saveState();
            event.returnValue = "event seems to need to be set";
            return "event seems to need to be set";
        }
    }
}
</script>
