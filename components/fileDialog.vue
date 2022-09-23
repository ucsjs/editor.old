<template>
    <transition 
        enter-active-class="transition ease-out duration-100" 
        enter-from-class="transform opacity-0 scale-95" 
        enter-to-class="transform opacity-100 scale-100" 
        leave-active-class="transition ease-in duration-75" 
        leave-from-class="transform opacity-100 scale-100" 
        leave-to-class="transform opacity-0 scale-95"
        v-if="state.fileDialog.open"
    >
        <div 
            class="bg-black/80 fixed w-screen h-screen flex justify-center" 
            style="z-index:10000"
            @click.stop="() => {}"
        >
            <div class="bg-black w-[900px] h-[600px] m-auto rounded-lg border border-black shadow-lg">
                <div class="bg-neutral-900 w-full rounded-t-lg flex flex-1 border-b border-black shadow-lg">
                    <div class="text-white text-lg px-4 py-4 flex-1">
                        {{ $t("Choose images") }}
                    </div>

                    <div class="justify-end">
                        <Tooltip :tooltipText="$t('Upload')" position="top">
                            <button class="text-white text-lg px-2 py-2 m-2 w-10 hover:bg-neutral-700 rounded-lg" @click="close">
                                    <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" />
                            </button>
                        </Tooltip>

                        <Tooltip :tooltipText="$t('Close')" position="top">
                            <button class="text-white text-lg px-2 py-2 m-2 w-10 hover:bg-neutral-700 rounded-lg" @click="close">
                                <font-awesome-icon icon="fa-solid fa-xmark" />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                <div class="flex">
                    <div class="w-60 h-[540px] rounded-bl-lg border-r border-black"> 
                        <div class="bg-neutral-700 border-b border-black">
                            <button @click="items = []" class="text-white p-2 hover:bg-neutral-600 w-full flex border-b border-black">
                                <div class="mr-2"><font-awesome-icon icon="fa-brands fa-google" /></div>
                                <div>{{ $t('Google Images')}}</div>
                            </button>
                        </div>

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

                        <div class="h-[460px]">
                            <filetree-view 
                                path="./public"
                                :onlyDir="true" 
                                @selectItem="selectItem"
                                class="rounded-bl-lg"
                            />
                        </div>
                    </div>

                    <div class="flex flex-col">
                        <div v-if="items.length <= 0" class="h-[50px] bg-neutral-800 border-b border-black p-2 flex">
                            <input 
                                type="text" 
                                v-model="search"
                                :placeholder="$t('Search...')" 
                                class="bg-neutral-700 text-white w-full rounded-md border border-black p-2"
                                @change="filterSearch"
                            />

                            <button 
                                class="text-white bg-neutral-800 hover:bg-neutral-600 rounded-md border border-black p-2 ml-2 flex"
                                @click="filterSearch"
                            >
                                <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
                            </button>
                        </div>

                        <div 
                            :class="[
                                (items.length > 0) ? 'h-[480px]' : 'h-[430px]',
                                'w-[700px] bg-neutral-700 text-white  p-2 overflow-auto'
                            ]"
                            @click="selectedItem = null"
                        >
                            <div class="flex mr-1 mt-1" v-if="loading">
                                <div class="spinner"></div>
                            </div>

                            <div v-if="items.length > 0 && !loading" class="grid grid-cols-5 gap-5 pr-2">
                                <div 
                                    :class="[
                                        (selectedItem?.sha256 === item.sha256) ? 'bg-neutral-800' : '',
                                        'w-32 h-32 hover:bg-neutral-500 rounded-lg p-2 text-center text-sm cursor-pointer'
                                    ]"
                                    :style="{color: iconFromExt(item.filename).color}" 
                                    v-for="(item, key) of items"
                                    :key="key"
                                    @click.stop="selectedItem = item"
                                >
                                    <client-only v-if="!isImage(item.ext)">
                                        <font-awesome-icon :icon="iconFromExt(item.filename).icon" v-if="iconFromExt(item.filename)" />
                                    </client-only>
                                    <div 
                                        v-else
                                        class="text-6xl text-center m-auto bg-cover w-full h-full" 
                                        :style="{ backgroundImage: `url(${config.api.baseApi}${item.path.replace('./public', '')})` }"
                                    ></div>
                                </div>
                            </div>
                            <div v-else-if="!loading" class="grid grid-cols-2 gap-2 pr-2">
                                <div 
                                    :class="[
                                        (selectedItem?.url === item?.url) ? 'bg-blue-500' : 'bg-neutral-800',
                                        'h-32 hover:bg-neutral-500 rounded-lg p-2 text-center text-sm cursor-pointer'
                                    ]"
                                    v-for="(item, key) of itemsGoogle"
                                    :key="key"
                                    @click.stop="selectedItem = item"
                                >
                                    <div 
                                        class="text-6xl text-center m-auto bg-cover w-full h-full" 
                                        :style="{ backgroundImage: `url(${item.url})` }"
                                    ></div>
                                </div>
                            </div>
                            
                        </div>

                        <div class="bg-neutral-800 w-full h-[60px] rounded-br-lg flex justify-end border-t border-black">
                            <button 
                                :class="[
                                    (selectedItem) ? 'bg-blue-700 hover:bg-blue-800' : 'bg-neutral-600',
                                    'p-2 px-4 mr-2 mt-2 h-[40px] rounded-lg text-white text-sm'                                
                                ]"
                                :disabled="!selectedItem"
                                @click="useImage"
                            >
                                {{ $t("Use image") }}
                            </button>
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
            items: [],
            itemsGoogle: [],
            selectedItem: null,
            search: null,
            loading: false,
        }
    },

    async mounted(){
        this.loading = true;
        this.itemsGoogle = await useApi(`images/google?s=paisagem`, { method: "GET" });
        this.loading = false;
    },

    methods: {
        close() {
            this.state.fileDialog.open = false;
        },

        async filterSearch(){
            if(this.search){
                this.loading = true;
                this.itemsGoogle = await useApi(`images/google?s=${encodeURIComponent(this.search)}`, { method: "GET" });
                this.loading = false;
            }
        },

        async selectItem(item){
            this.items = await useApi(`files?path=${encodeURIComponent(item.path)}&onlyFiles=true`, { method: "GET" });
        },

        isImage(ext){
            return ["jpg", "jpeg", "png", "gif", "svg"].includes(ext);
        },

        useImage(){
            if(typeof this.state.fileDialog.cb == "function"){
                if(this.selectedItem?.path && this.selectedItem?.path.includes("./public"))
                    this.state.fileDialog.cb(`${this.config.api.baseApi}${this.selectedItem.path.replace('./public', '')}`);
                else
                    this.state.fileDialog.cb(this.selectedItem.url);
            }
                
            this.state.fileDialog.open = false;
        }
    },
}
</script>
