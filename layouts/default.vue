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

<script setup>
import { useUserStore } from "~/store/user.store";
import { useI18n } from 'vue-i18n';

const state = useUserStore();
const { t } = useI18n();
  
await initApp({ $t: t});

if(process.client){
    const stateCache = localStorage.getItem("state");

    if(stateCache)
        state.use(stateCache);
}

watch(state, () => {
    state.saveState();
});
</script>
