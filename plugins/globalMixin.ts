import globalMixin from '~/mixins/globalMixin';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(globalMixin);
});