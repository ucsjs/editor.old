<template>
    <div
        v-if="item"
        class="rounded-xl opacity-40 fixed z-50 border-black border-2 shadow-black shadow-md bg-neutral-900 bg-opacity-80 hover:border-neutral-800"
        :style="{
            top: `${position.top}px`, 
            left: `${position.left}px`
        }"
    >
        <div
            :class="['p-1 rounded-t-lg border-b border-black text-gray-50 font-bold cursor-move flex']"
            :style="{backgroundColor: (item.metadata.headerColor) ? item.metadata.headerColor : headerColor(item.metadata.group)}"
        >
            <div class="flex flex-1">
                <div class="mr-2 ml-2 text-sm">
                    <client-only>
                        <font-awesome-icon :icon="(item.metadata.headerIcon) ? item.metadata.headerIcon : headerIcon(item.metadata.group)"/>
                    </client-only>
                </div>

                <span class="text-sm">{{ uppercaseFirstLetter(item.metadata.namespace) }}</span>   
            </div> 

            <div class="flex text-sm" :collaped="item.collaped">
                <div class="mr-2 cursor-pointer px-2" @click.stop="item.collaped = !item.collaped">
                    <client-only>
                        <Tooltip :tooltipText="$t('Expand')" position="top">
                            <font-awesome-icon icon="fa-solid fa-caret-down" v-if="item.collaped" />
                        </Tooltip>
                        <Tooltip :tooltipText="$t('Contract')" position="top">
                            <font-awesome-icon icon="fa-solid fa-caret-up" v-if="!item.collaped" />
                        </Tooltip>
                    </client-only>
                </div>
                
                <div class="mr-2 cursor-pointer" @click.stop="removeComponent(keyItem)">
                    <client-only>
                        <Tooltip :tooltipText="$t('Delete')" position="top">
                            <font-awesome-icon icon="fa-solid fa-xmark"/>
                        </Tooltip>
                    </client-only>
                </div>
            </div>
        </div>

        <div class="p-2 flex text-white font-medium">
            <div class="content-start items-start">
                <div class="flex" v-for="(input, key) in item.inputs" :key="key" :id="`${input.id}-${keyItem}`" ref="inputs">
                    <blueprint-component-input 
                        :keyItem="keyItem" 
                        :input="input" 
                        :item="item" 
                        :isInput="true" 
                        :collaped="item.collaped"
                    ></blueprint-component-input>
                </div>

                <div v-if="!item.collaped">
                    <div class="flex" v-for="(input, key) in item.publicVars" :key="key" :id="`${input.id}-${keyItem}`" ref="inputs">
                        <blueprint-component-input 
                            :keyItem="keyItem" 
                            :input="input" 
                            :item="item" 
                            :isInput="false" 
                            :collaped="item.collaped"
                        ></blueprint-component-input>
                    </div>
                </div>
            </div>

            <div class="content-end items-end text-right ml-4">
                <div class="text-right w-full items-end h-6 py-1" v-for="(output, key) in item.outputs" :key="key">
                    <div class="flex flex-row-reverse" :id="`${output.id}-${keyItem}`" ref="inputs">                       
                        <div :style="{color: (item.metadata[output?.type.replace(/\./, '_')]) ? item.metadata[output?.type.replace(/\./, '_')].color : getColorByType(output?.type)}" :title="`Type: ${output?.type}`" >
                            <client-only>
                                <font-awesome-icon icon="fa-solid fa-square" />
                            </client-only>
                        </div>

                        <div>
                            <span class="px-2 text-sm">{{ uppercaseFirstLetter(output.name) }}</span>
                        </div>  
                    </div>
                </div>  
                
                <div class="text-right" v-for="(publicVar, key) in item.publicVars" :key="key">
                    <div v-if="publicVar.type == 'object' && publicVar.default && publicVar.default.createOutputs">
                        <div class="w-full items-end"> 
                            <div v-for="(publicVaritem, key) in publicVar.value" :key="key" class="flex flex-row-reverse h-6"> 
                                <div :style="{color: getColorByType('Any')}" :id="`${publicVar.id}-${keyItem}-${key}`" ref="inputs">
                                    <client-only>
                                        <font-awesome-icon icon="fa-solid fa-square" />
                                    </client-only>
                                </div>

                                <div>
                                    <span class="px-2 text-sm">{{ (publicVaritem.method) ? publicVaritem.method : 'GET' }} [{{ publicVaritem.url }}]</span>
                                </div>
                            </div> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import globalMixin from "@/mixins/globalMixin";

export default {
    mixins: [globalMixin],

    props: {
        item: {
            type: Object
        },

        position: {
            type: Object
        },
    }
}
</script>
