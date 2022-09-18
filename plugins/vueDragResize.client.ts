import Vue3DraggableResizable from "vue3-draggable-resizable";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("vue-drag-resize", Vue3DraggableResizable);
});