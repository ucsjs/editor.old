<template>
    <editor></editor>
</template>

<script setup>
import { useStateStore } from "~~/store/state.store";
const state = useStateStore();

if(!state.isAuthentication){
    const router = useRouter();
    router.push({ path: "/login" });
}
</script>