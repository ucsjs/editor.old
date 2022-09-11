import { createI18n } from 'vue-i18n';

import en from '../locales/en.json';
import pt from '../locales/pt.json';

export default defineNuxtPlugin((nuxtApp) => {
    const i18n = createI18n({
        legacy: false,
        globalInjection: true,
        locale: 'pt',
        lazy: false,
        loadLanguagesAsync: false,
        langDir: "locales/",
        locales: [
            { code: "en", name: "English", iso: "en-US", file: "en.json" },
            { code: "pt", name: "Português", iso: "pt-BR", file: "pt.json" },
        ],
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: "i18n",
        },
        fallbackLocale: "pt",
        silentTranslationWarn: true,
        defaultLocale: "pt",
        messages: { en, pt }
    });

    nuxtApp.vueApp.use(i18n);
    nuxtApp.provide("i18n", i18n);
})