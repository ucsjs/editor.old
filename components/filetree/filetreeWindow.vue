<template>
    <div class="w-full h-full absolute"> 
        <div class="text-neutral-200 bg-neutral-900 p-2 text-md bold uppercase">
            {{ $t('Explorer') }}
        </div>

        <filetree-view path="./" />
    </div>
</template>

<script>
import { useStateStore } from "~/store/state.store";

export default {
    data(){
        return {
            state: useStateStore()
        };
    }
}
</script>
