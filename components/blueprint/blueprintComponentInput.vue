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
        <div v-if="item.metadata[input.name]">
            <select 
                class="bg-neutral-800 border border-black text-white px-1 ml-2"
                @change="$emit('changeDefault', $event.target.value, input)"
            >
                <option 
                    v-for="(option, key) in item.metadata[input.name]" 
                    :key="key" 
                    :value="option" 
                    :selected="(input.value || input.default) == option"
                >{{ option }}</option>
            </select>
        </div>
        <input v-else-if="input.type == 'String' || input.type == 'string'" class="max-w-[80px] bg-neutral-800 border border-black text-white px-1 ml-2" type="text" :value="input.value || input.default" @keyup="$emit('changeDefault', $event.target.value, input)" />
        <input v-else-if="input.type == 'number' || input.type == 'Number' || input.type == 'Int'" class="max-w-[80px] bg-neutral-800 border border-black text-white px-1 ml-2" type="number" :value="input.value || input.default" @keyup="$emit('changeDefault', $event.target.value, input, 'number')" />
        <div v-else-if="input.type == 'object' || input.type == 'Object'">
            <div class="flex flex-row">
                <div v-if="input.default?.multi">
                    <Tooltip :tooltipText="$t('Edit')" position="right">
                        <button class="ml-2 hover:text-neutral-500" @click="input.openEdit = true">
                            <font-awesome-icon icon="fa-solid fa-edit" />   
                        </button>
                    </Tooltip>

                    <blueprint-object-edit 
                        v-if="input.openEdit" 
                        :component="item" 
                        :fields="input.default" 
                        :values="input.value"
                        @save="(value) => { 
                            $emit('changeDefault', value, input, 'number')
                            input.value = value; 
                            input.openEdit = false; 
                        }"
                        @close="input.openEdit = false" />
                </div>
            </div>
        </div>
        <div v-else-if="input.default" class="pl-1">
            {{ input.default }}
        </div>
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
        isInput: {
            type: Boolean,
            required: true,
            default: true
        },
        keyItem: {
            required: true
        },
        editObject: {

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
