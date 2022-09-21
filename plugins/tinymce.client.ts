import Editor from '@tinymce/tinymce-vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("tinymce", Editor);
});