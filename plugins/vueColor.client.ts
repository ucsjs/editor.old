import { Chrome, Sketch } from '@ckpack/vue-color';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("chrome-picker", Chrome);
  nuxtApp.vueApp.component("sketch-picker", Sketch);
});