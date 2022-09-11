<template>
    <div class="bg-blue-500 w-screen h-8 fixed bottom-0 z-40">
        <div class="flex flex-row-reverse">
            <div class="flex mr-1 mt-1" v-show="state.loading">
                <div class="spinner"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.spinner {
   width: 24px;
   height: 24px;
   border-radius: 50%;
   border: 3.8px solid;
   border-color: rgba(219, 220, 239, 0.49);
   border-right-color: #d6d6d6;
   animation: spinner-d3wgkg 1s infinite linear;
}

@keyframes spinner-d3wgkg {
   to {
      transform: rotate(1turn);
   }
}
</style>

<script setup>
import { useUserStore } from "~/store/user.store";
const state = useUserStore();
</script>