<template>
    <div class="w-full h-full absolute"> 
        <div class="text-neutral-200 bg-neutral-900 border-b border-black p-2 text-md bold uppercase">
            {{ $t('Explorer') }}
        </div>

        <div style="height: calc(100% -  42px)"> 
            <filetree-view path="./" />
        </div>
        
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
