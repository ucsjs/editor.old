<template>
    <div v-if="state.isRoot">
        <div class="fixed w-screen h-screen z-50 mt-14" @click="resetSelected" v-if="selected != -1"></div>

        <div :class="[state.darktheme ? 'bg-neutral-800 border-black' : 'bg-neutral-100', 'w-screen border-b flex justify-between p-2 select-none']" @click="resetSelected">
            <div class="flex flex-1">
                <Menu as="div" class="relative" v-for="(item, key) of navbar" :key="key" @click.stop="() => {}">
                    <MenuButton 
                        :class="[(selected === key) ? (state.darktheme ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100') : (state.darktheme ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-neutral-100'),'px-3 rounded-lg h-full']" 
                        @click="(selected == -1) ? selected = key : selected = -1" 
                        @mouseenter="forceClick(key)"
                    >
                        {{ item.key }}
                    </MenuButton>

                    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                        <MenuItems 
                            v-if="selected === key"
                            :class="[state.darktheme ? 'bg-neutral-800 text-neutral-200 ring-black border-black' : 'bg-white','absolute left-0 z-50 mt-2 w-48 origin-top-left rounded-md py-1 shadow-lg shadow-neutral-900 ring-1 ring-opacity-60 focus:outline-none h-80']" 
                            static
                        >
                            <MenuItem v-for="children in item.children" :key="children" v-slot="{ active }">
                                <a @click="item.event" :class="[active ? 'bg-neutral-100' : '', 'block px-4 py-2 text-sm text-gray-700']">{{ item.name }}</a>
                            </MenuItem>
                        </MenuItems>
                    </transition>
                </Menu>
            </div>

            <div class="flex justify-end">
                <div class="ml-4 flex items-center md:ml-6">
                    <Tooltip :tooltipText="$t('Light mode')" position="bottom">
                        <button v-if="state.darktheme" class="w-10 h-10 text-white" @click="state.switchTheme()">
                            <font-awesome-icon icon="fa-solid fa-sun" />
                        </button>
                    </Tooltip>

                    <Tooltip :tooltipText="$t('Dark mode')" position="bottom">
                        <button v-if="!state.darktheme" class="w-10 h-10" @click="state.switchTheme()">
                            <font-awesome-icon icon="fa-solid fa-moon" />
                        </button>
                    </Tooltip>

                    <Menu as="div" class="relative ml-3">
                        <div>
                            <MenuButton class="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                <span class="sr-only">Open user menu</span>
                                <img class="h-8 w-8 rounded-full" :src="state.user.photoURL" alt="" />
                            </MenuButton>
                        </div>

                        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                            <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                                    <a @click="item.event" :class="[active ? 'bg-neutral-100' : '', 'block px-4 py-2 text-sm text-gray-700']">{{ item.name }}</a>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>
                </div>
            </div>            
        </div>
    </div>
</template>

<script setup>
import { signOut } from "~/composables/useFirebase";

import { useUserStore } from "~/store/user.store";
import { userNavbarStore } from "~/store/navbar.store";
import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild } from "@headlessui/vue";
const state = useUserStore();
const navbar = userNavbarStore().navbar;
const selected = ref(-1);

const userNavigation = [
    { 
        name: 'Sign out', 
        event: () => {
            signOut();
            useRouter().push({ path: "/login" });
        } 
    },
];

const forceClick = (index) => {
    if(selected.value >= 0)
        selected.value = index
};

const resetSelected = () => {
    selected.value = -1
;}
</script>