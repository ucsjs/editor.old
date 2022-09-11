import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
   
    initializeApp(config.firebase);

    initUser();

    const auth = getAuth();

    nuxtApp.vueApp.provide("auth", auth);
    nuxtApp.provide("auth", auth);
});