import { VueReCaptcha, useReCaptcha } from 'vue-recaptcha-v3';
import { useNuxtApp } from '#app';

export const useVueRecaptcha = async () => {
    const config = useRuntimeConfig();
    const { vueApp } = useNuxtApp();

    vueApp.use(VueReCaptcha, config.recaptcha);

    const { executeRecaptcha, recaptchaLoaded } = useReCaptcha();
    await recaptchaLoaded();
    
    return await executeRecaptcha('login');
};