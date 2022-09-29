<template>
    <div 
        :class="[
            (selectInput?.property.id === id && modelValue) ? 'border-blue-700': '',
            (state.hierarchy.ghost) ? 'hover:border-blue-700 hover:cursor-copy' : '',
            'border border-black bg-neutral-900 h-full flex justify-end relative text-sm rounded-sm '
        ]"                                                                                   
    >
        <div class="pl-1 mt-0.5 bg-neutral-900 cursor-default">
            <font-awesome-icon icon="fa-solid fa-cube" />
        </div>

        <input 
            :class="[
                (state.hierarchy.ghost) ? 'hover:cursor-copy' : '',
                'bg-neutral-900 border-transparent text-white h-6 text-sm w-full rounded-sm'
            ]"
            type="text" 
            :value="modelValue?.id"
            :placeholder="property.type"
            disabled="disabled"
        />
    </div>
</template>

<script>
import { useStateStore } from "~/store/state.store";

export default {
    props: ["modelValue", "selectInput", "id", "property"],

    data(){
        return {
            state: useStateStore()
        }
    },
}
</script>