<template>
    <editor></editor>
</template>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();

useHead({
    
});

if(!state.isAuthentication){
    const router = useRouter();
    router.push({ path: "/login" });
}
</script>