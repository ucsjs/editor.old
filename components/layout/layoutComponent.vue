<template>
    <div ref="GLComponent" style="position: absolute; overflow: hidden">
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, defineExpose } from "vue";

const GLComponent = ref<null | HTMLElement>(null);
    
const numberToPixels = (value: number): string => {
    return value.toString(10) + "px";
};

const setPosAndSize = ( left, top, width, height) => {
    if (GLComponent.value) {
        const el = GLComponent.value as HTMLElement;
        el.style.left = numberToPixels(left);
        el.style.top = numberToPixels(top);
        el.style.width = numberToPixels(width);
        el.style.height = numberToPixels(height);
    }
};

const setVisibility = (visible: boolean) => {
    if (GLComponent.value) {
        const el = GLComponent.value as HTMLElement;
        el.style.display = (visible) ? "" : "none";
    }
};

const setZIndex = (value: string) => {
    if (GLComponent.value) {
        const el = GLComponent.value as HTMLElement;
        el.style.zIndex = value;
    }
};

defineExpose({
    setPosAndSize,
    setVisibility,
    setZIndex,
});
</script>