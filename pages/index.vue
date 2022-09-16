<template>
    <editor></editor>
</template>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();

useHead({
    title: "UCS",
    script: [
        { src: "https://cdn.jsdelivr.net/npm/leader-line-new@1.1.9/leader-line.min.js" },
        { src: "https://cdnjs.cloudflare.com/ajax/libs/rxjs/7.5.6/rxjs.umd.min.js" }, 
        { src: "node_modules/xterm/lib/xterm.js" },
        { src: "node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js" }, 
    ],
    link: [
        { rel: "stylesheet", href: "node_modules/xterm/css/xterm.css" }
    ]
});

if(!state.isAuthentication){
    const router = useRouter();
    router.push({ path: "/login" });
}
</script>