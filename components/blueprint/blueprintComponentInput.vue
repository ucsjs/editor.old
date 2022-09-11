<template>
    <div class="flex flex-row py-1">
        <div v-if="isInput" :style="{color: getColorByType(input?.type)}" :title="`Type: ${input?.type}`">
            <font-awesome-icon 
                :id="`input-${input.id}`"
                :ref="`input-${input.id}`"
                icon="fa-solid fa-circle"                
                @mouseenter="onPointer($event, item, input, keyItem)"
                @mouseleave="onPointerLeave"
            />
        </div>
        
        <div class="pl-2">{{ input.name }}<span v-if="input.default">:</span></div>
        <input v-if="input.type == 'String'" class="w-12 bg-neutral-800 border border-black text-white px-1 ml-2" type="text" :value="input.value || input.default" @keyup="$emit('changeDefault', $event.target.value, input)" />
        <input v-else-if="input.type == 'number' || input.type == 'Number' || input.type == 'Int'" class="w-12 bg-neutral-800 border border-black text-white px-1 ml-2" type="number" :value="input.value || input.default" @keyup="$emit('changeDefault', $event.target.value, input, 'number')" />
        <div v-else-if="input.default" class="pl-1">{{ input.default }}</div>
    </div>
</template>

<script>
import globalMixin from "@/mixins/globalMixin";

export default {
    mixins: [globalMixin],

    props: {
        item: {
            type: Object,
            required: true
        },
        input: {
            type: Object,
            required: true
        },
        item: {
            type: Object,
            required: true
        },
        isInput: {
            type: Boolean,
            required: true,
            default: true
        },
        keyItem: {
            required: true
        }
    },
    methods: {
        onPointer(event, item, input, key) {
            this.$emit('onPointer', event, item, input, key);
        },

        onPointerLeave() {
            this.$emit('onPointerLeave');
        }
    }
}
</script>
