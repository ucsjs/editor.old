<template>
    <div class="flex flex-row py-1 h-8">
        <div v-if="isInput" :style="{color: (item.metadata[input?.type.replace(/\./, '_')]) ? item.metadata[input?.type.replace(/\./, '_')].color : getColorByType(input?.type)}" :title="`Type: ${input?.type}`">
            <font-awesome-icon 
                :id="`${input.id}-${keyItem}`"
                :ref="`${input.id}-${keyItem}`"
                icon="fa-solid fa-circle"                
                @mouseenter="onPointer($event, item, input, keyItem, `${input.id}-${keyItem}`)"
                @mouseleave="onPointerLeave"
            />
        </div>

        <div class="pl-2" v-if="isInput">{{ uppercaseFirstLetter(input.name) }}<span v-if="input.default">:</span></div>

        <div v-if="!collaped" class="flex">
            <div class="pl-2" v-if="!isInput">{{ uppercaseFirstLetter(input.name) }}<span v-if="input.default">:</span></div>

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
            <div v-else-if="input.type == 'boolean' || input.type == 'Boolean' || input.type == 'Bool'" class="text-white px-1">
                <Switch 
                    v-model="input.value" 
                    class="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border-black focus:outline-none"
                >
                    <span class="sr-only">Use setting</span>
                    <span aria-hidden="true" class="pointer-events-none absolute h-full w-full rounded-md" />
                    <span aria-hidden="true" :class="[input.value ? 'bg-indigo-600' : 'bg-neutral-700', 'pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out']" />
                    <span aria-hidden="true" :class="[input.value ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-black bg-neutral shadow ring-0 transition-transform duration-200 ease-in-out']" />
                </Switch>
            </div>
            <div v-else-if="input.type == 'object' || input.type == 'Object' || input.type == 'JSON'">
                <div class="flex flex-row">
                    <div>
                        <Tooltip :tooltipText="$t('Edit')" position="right">
                            <button class="ml-2 hover:text-neutral-500" @click="$emit('openObjectEdit', item, input, keyItem)">
                                <font-awesome-icon icon="fa-solid fa-edit" />   
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div v-else-if="input.default" class="pl-1">
                {{ input.default }}
            </div>
        </div>
    </div>
</template>

<script>
import globalMixin from "@/mixins/globalMixin";
import { Switch } from '@headlessui/vue';

export default {
    mixins: [globalMixin],

    components: { Switch },

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
        collaped: {
            type: Boolean,
            default: false
        },
        editObject: {}
    },
    methods: {
        onPointer(event, item, input, key, id) {
            this.$emit('onPointer', event, item, input, key, id);
        },

        onPointerLeave() {
            this.$emit('onPointerLeave');
        }
    }
}
</script>
