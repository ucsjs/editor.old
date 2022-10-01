<template>
    <transition 
        enter-active-class="transition ease-out duration-100" 
        enter-from-class="transform opacity-0 scale-95" 
        enter-to-class="transform opacity-100 scale-100" 
        leave-active-class="transition ease-in duration-75" 
        leave-from-class="transform opacity-100 scale-100" 
        leave-to-class="transform opacity-0 scale-95"
        v-if="state.newFile.open"
    >
        <div 
            class="bg-black/80 fixed w-screen h-screen flex justify-center" 
            style="z-index:10000"
            @click.stop="() => {}"
        >
            <div class="bg-black w-[900px] h-[500px] m-auto rounded-lg border border-black shadow-lg">
                <div class="bg-neutral-900 w-full rounded-t-lg flex flex-1 border-b border-black shadow-lg">
                    <div class="text-white text-lg px-4 py-4 flex-1">
                        {{ $t("New file") }}
                    </div>

                    <div class="justify-end">
                        <Tooltip :tooltipText="$t('Close')" position="top">
                            <button class="text-white text-lg px-2 py-2 m-2 w-10 hover:bg-neutral-700 rounded-lg" @click="close">
                                <font-awesome-icon icon="fa-solid fa-xmark" />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div class="flex">
                    <div class="w-60 h-[540px] rounded-bl-lg border-r border-black"> 

                        <div 
                            class="bg-neutral-800 h-[40px] text-white p-2 flex"
                        >
                            <div class="mr-2">
                                <font-awesome-icon icon="fa-regular fa-folder-open" />
                            </div>

                            <div>
                                {{ $t('Local files') }}
                            </div>
                        </div>

                        <div class="h-[450px]">
                            <filetree-view 
                                ref="filetree"
                                path="./src/workspace"
                                :onlyDir="true" 
                                @selectItem="selectDir"
                                class="rounded-bl-lg"
                            />
                        </div>
                    </div>

                    <div class="flex flex-col">
                        <div 
                            :class="[
                                'w-[700px] h-[430px] bg-neutral-700 text-white p-2 overflow-auto'
                            ]"
                        >     
                            <div class="grid grid-cols-5 gap-5 pr-2">
                                <div 
                                    :class="[
                                        (selectedItem?.id === item?.id) ? 'bg-blue-800' : 'bg-neutral-800',
                                        'h-28 hover:bg-neutral-900 rounded-lg p-2 text-center text-sm cursor-pointer'
                                    ]"
                                    v-for="(item, key) of types"
                                    :key="key"
                                    @click.stop="selectItem(item)"
                                >
                                    <client-only>
                                        <font-awesome-icon :icon="item.icon" :style="{color: item.color}" class="text-6xl mt-1"/>
                                    </client-only>

                                    <div class="mt-2">
                                        {{ item.label }}
                                    </div>
                                </div>
                            </div>                            
                        </div>

                        <div class="bg-neutral-800 w-full h-[60px] rounded-br-lg flex border-t border-black">
                            <div class="flex flex-1 justify-start p-2 m-2 bg-neutral-900 rounded-md text-neutral-100">
                                <div class="flex mt-0.5">{{ dir?.path }}</div>/
                                <div class="flex">
                                    <input 
                                        v-model="filename" 
                                        class="w-full bg-neutral-900" 
                                        :placeholder="$t('Nome do arquivo')" 
                                    />
                                </div>
                            </div>

                            <div class="flex justify-end">
                                <button 
                                    :class="[
                                        (selectedItem && dir?.path) ? 'bg-blue-700 hover:bg-blue-800' : 'bg-neutral-600',
                                        'p-2 px-4 mr-2 mt-2 h-[40px] rounded-lg text-white text-sm'                                
                                    ]"
                                    :disabled="!selectedItem || !dir"
                                    @click="createFile"
                                >
                                    {{ $t("Create file") }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
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

<script>
import { TransitionRoot, TransitionChild } from "@headlessui/vue";
import { useStateStore } from "~~/store/state.store";
import globalMixin from "@/mixins/globalMixin";

export default {
    props: {        
        types: {
            type: Array,
            default: () => []
        },
    },

    mixins : [globalMixin],
    components: { TransitionRoot, TransitionChild },

    data(){
        return{
            state: useStateStore(),
            config: useRuntimeConfig(),
            types: [
                { id: "text", label: "Texto", ext: ".txt", icon: "fa-regular fa-file-lines" },
                { id: "js", label: "Javascript", ext: ".js", icon: "fa-brands fa-square-js", color: "#F0DB4F" },
                { id: "ts", label: "Typescript", ext: ".ts", icon: "fa-solid fa-code", color: "#2D79C7" },
                { id: "blueprint", label: "Blueprint", ext: ".blueprint.ts", icon: "fa-solid fa-boxes-stacked", color: "#F29D0D" },
                { id: "page", label: "Page", ext: ".page.ts", icon: "fa-solid fa-table-columns", color: "#4B1E96" },
                { id: "component", label: "Component", ext: ".component.ts", icon: "fa-solid fa-gear", color: "#662d00" },
                { id: "visualobject", label: "VisualObject", ext: ".component.ts", icon: "fa-solid fa-cube", color: "#007f17" }
            ],
            selectedItem: null,
            dir: null,
            filename: "arquivo.txt"
        }
    },

    mounted(){
        this.selectedItem = this.types[0];
    },

    methods: {
        close() {
            this.state.newFile.open = false;
        },

        async selectItem(item){
            this.selectedItem = item;
            const dotPosition = this.filename.indexOf(".");
            const ext = this.filename.slice(dotPosition);
            this.filename = this.filename.replace(ext, item.ext);
        },

        async selectDir(dir){
            this.dir = dir;
        },

        async openFile(item) {
            const content = await useApi(`files/open?filename=${encodeURIComponent(item.filename)}`, {
                method: "GET"
            });

            this.state.openTab({ ...content, recent: true });
        },

        async createFile(){
            const createResult = await useApi(`files/create?path=${encodeURIComponent(this.dir.path)}&filename=${encodeURIComponent(this.filename)}`, {
                method: "POST"
            });

            if(createResult.filename){
                this.openFile(createResult);
                this.close();
            }
            else if(createResult.error){
                alert(createResult.error);
            }
        },
    },
}
</script>
