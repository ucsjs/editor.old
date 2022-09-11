<template>
    <div aria-live="assertive" class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50">
        <div class="flex w-full h-full items-center space-y-4 sm:items-end align-bottom content-end">
            <transition enter-active-class="transform ease-out duration-300 transition" enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2" enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="show" :class="[state.darktheme ? 'bg-neutral-800 text-neutral-200 border-black' : 'bg-white', 'border pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5'] ">
                    <div class="p-4">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <font-awesome-icon icon="fa-solid fa-circle-check" class="h-6 w-6 text-green-400" />
                                <!--<CheckCircleIcon class="h-6 w-6 text-green-400" aria-hidden="true" />-->
                            </div>
                            <div class="ml-3 w-0 flex-1 pt-0.5">
                                <p class="text-sm font-medium">{{ message }}</p>
                            </div>
                            <div class="ml-4 flex flex-shrink-0">
                                <button type="button" @click="show = false" class="inline-flex rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <span class="sr-only">Close</span>
                                    <font-awesome-icon icon="fa-solid fa-xmark" class="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="w-full">
                        <div class="shadow w-full bg-grey-light">
                            <div class="bg-blue-500 text-xs leading-none py-1 text-center text-white" :style="{width: `${processWidth}%`}"></div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import { TransitionRoot, TransitionChild } from "@headlessui/vue";
import { useUserStore } from "~/store/user.store";

export default {
    props: {
        closeTimeout:{
            type: Number,
            default: 5000
        }
    },
    setup(){
        const state = useUserStore();   
        return { state };
    },

    data(){
        return {
            show: false,
            message: true,
            processWidth: 0
        }
    },

    methods: {
        open(message){
            this.message = message;
            this.show = true;
            this.processWidth = 0
            let process = setInterval(() => { this.processWidth++ }, this.closeTimeout / 100);

            setTimeout(() => { 
                this.show = false;
                clearInterval(process);
            }, this.closeTimeout);
        }
    }
}
</script>