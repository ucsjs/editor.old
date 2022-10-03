<template>
    <div 
        :class="[
            (selectInput?.property.id === id && modelValue) ? 'border-blue-700': '',
            (state.hierarchy.ghost) ? 'hover:border-blue-700 hover:cursor-copy' : '',
            'border border-black bg-neutral-900 h-full flex justify-end relative text-sm rounded-sm '
        ]" 
        :title="modelValue?.id"                                                                                  
    >
        <div 
            :class="[
                (modelValue) ? 'text-blue-500' : '',
                'pl-1 mt-0.5 cursor-default bg-neutral-900'
            ]"
        >
            <font-awesome-icon icon="fa-solid fa-cube" />
        </div>

        <input 
            :class="[
                (state.hierarchy.ghost) ? 'hover:cursor-copy' : '',
                'bg-neutral-900 border-transparent text-blue-500 h-6 text-sm w-full rounded-sm select-none'
            ]"
            type="text" 
            :value="modelValue?.id"
            :placeholder="property.type || property.metadata.componentLink"
            disabled
            readonly
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