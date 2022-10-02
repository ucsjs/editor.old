<template>
    <div>
        <div class="fixed w-screen h-screen z-50 mt-14" @click="resetSelected" v-if="selected != -1"></div>

        <div :class="[state.darktheme ? 'bg-neutral-800 border-black' : 'bg-neutral-100', 'w-screen border-b flex justify-between px-2 select-none z-50']" @click="resetSelected">
            <div class="flex flex-1">
                <div class="mt-2 mr-2">
                    <a href="https://ucsjs.io" target="_blank">
                        <img src="favicon-16x16.png" alt="UCS.js" title="UCS.js" />
                    </a>
                </div>

                <Menu as="div" class="relative" v-for="(item, key) of navbar" :key="key" @click.stop="() => {}">
                    <MenuButton 
                        :class="[(selected === key) ? (state.darktheme ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-100') : (state.darktheme ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-neutral-100'),'px-3 rounded-lg h-full py-1']" 
                        @click="(selected == -1) ? selected = key : selected = -1" 
                        @mouseenter="forceClick(key)"
                    >
                        {{ $t(item.key) }}
                    </MenuButton>

                    <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                        <MenuItems 
                            v-if="selected === key"
                            :class="[state.darktheme ? 'bg-neutral-800 text-neutral-200 ring-black border-black' : 'bg-white','absolute left-0 z-50 pb-2 pt-2 origin-top-left rounded-md py-1 shadow-lg shadow-neutral-900 ring-1 ring-opacity-60 focus:outline-none text-neutral-100 min-w-[300px]']" 
                            static
                        >
                            <MenuItem v-for="(item, key) in item.items" :key="key" v-slot="{ active }" class="cursor-pointer">
                                <div 
                                    v-if="!item.separete && !item.items" 
                                    class="flex flex-row px-5 py-1 hover:bg-[#04395e] hover:text-white"
                                    @click="item.event"
                                >
                                    <div class="flex flex-1">{{ $t(item.name) }}</div>
                                    
                                    <div v-if="item.shortcut" class="flex justify-end">{{ item.shortcut }}</div>
                                </div>
                                <div 
                                    v-else-if="item.items" 
                                    class="flex flex-row px-5 py-1 hover:bg-[#04395e] hover:text-white"
                                    @mouseover="item.open = true" 
                                >
                                    <div class="flex flex-1">{{ $t(item.name) }}</div>

                                    <div class="flex justify-end mt-1 relative" >
                                        <client-only><font-awesome-icon icon="fa-solid fa-caret-right" /></client-only>

                                        <div 
                                            :class="[
                                                state.darktheme ? 'text-white bg-neutral-800 border-black' : 'text-gray-800 bg-neutral-200',
                                                'absolute min-w-[300px] py-2 rounded-lg cursor-pointer h-10 left-4 z-40 shadow-lg'
                                            ]"
                                            v-if="item.open"
                                        >
                                            <div 
                                                :class="[
                                                    state.darktheme ? 'text-white bg-neutral-800' : 'text-gray-800 bg-neutral-200',
                                                    'z-40 min-w-[300px] pb-2 rounded-lg cursor-pointer'
                                                ]" 
                                            >
                                                <context-menu-item 
                                                    :items="item.items" 
                                                    @mouseover="item.open = true"
                                                    @mouseleave.stop="item.open = false" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <hr :class="[
                                        state.darktheme ? 'border-neutral-700' : 'border-neutral-300',
                                        'my-2 border-1'
                                    ]" />
                                </div>
                            </MenuItem>
                        </MenuItems>
                    </transition>
                </Menu>
            </div>

            <div class="flex justify-end">
                <div class="ml-4 flex items-center md:ml-6">
                    <!--<Tooltip :tooltipText="$t('Light mode')" position="bottom">
                        <button v-if="state.darktheme" class="w-10 h-10 text-white" @click="state.switchTheme()">
                            <client-only><font-awesome-icon icon="fa-solid fa-sun" /></client-only>
                        </button>
                    </Tooltip>

                    <Tooltip :tooltipText="$t('Dark mode')" position="bottom">
                        <button v-if="!state.darktheme" class="w-10 h-10" @click="state.switchTheme()">
                            <client-only><font-awesome-icon icon="fa-solid fa-moon" /></client-only>
                        </button>
                    </Tooltip>

                    <Menu as="div" class="relative ml-3">
                        <div>
                            <MenuButton class="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                <span class="sr-only">Open user menu</span>
                                <img class="h-5 w-5" :src="state.user?.photoURL" alt="" />
                            </MenuButton>
                        </div>

                        <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                            <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                                    <a @click="item.event" :class="[active ? 'bg-neutral-100' : '', 'block px-4 py-2 text-sm text-gray-700']">{{ item.name }}</a>
                                </MenuItem>
                            </MenuItems>
                        </transition>
                    </Menu>-->
                </div>
            </div>            
        </div>
    </div>
</template>

<script setup>
import { signOut } from "~/composables/useFirebase";

import { useStateStore } from "~/store/state.store";
import { Menu, MenuButton, MenuItem, MenuItems, TransitionRoot, TransitionChild } from "@headlessui/vue";
const state = useStateStore();
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

<script>
import { useStateStore } from "~/store/state.store";

export default {
    data(){
        return {
            state: useStateStore(),
            navbar: [
                {
                    key: 'File',
                    items: [
                        {
                            name: 'New File',
                            shortcut: 'Ctrl+N',
                            event: () => { 
                                this.state.newFile.open = true; 
                                this.selected = -1;
                            },
                        },
                        { separete: true },
                        {
                            name: 'Open',
                            shortcut: 'Ctrl+O',
                            event: () => { },
                        },
                        {
                            name: 'Open Recent',
                            event: () => { },
                        },
                        { separete: true },
                        {
                            name: 'Save',
                            shortcut: 'Ctrl+S',
                            event: () => { },
                        },
                        {
                            name: 'Save as',
                            shortcut: 'Ctrl+Shift+S',
                            event: () => { },
                        },
                        { separete: true },
                        {
                            name: 'Preferences',
                            event: () => { },
                        },
                        {
                            name: 'Environment Variables',
                            event: () => { },
                        },
                    ]
                },
                {
                    key: 'Edit',
                    items: [
                        {
                            name: 'Undo',
                            shortcut: 'Ctrl+Z',
                            event: () => { },
                        },
                        {
                            name: 'Redo',
                            shortcut: 'Ctrl+Y',
                            event: () => { },
                        },
                        { separete: true },
                        {
                            name: 'Cut',
                            shortcut: 'Ctrl+X',
                            event: () => { }
                        },
                        {
                            name: 'Copy',
                            shortcut: 'Ctrl+C',
                            event: () => { }
                        },
                        {
                            name: 'Paste',
                            shortcut: 'Ctrl+V',
                            event: () => { }
                        },
                        { separete: true },
                        {
                            name: 'Localize',
                            shortcut: 'Ctrl+F',
                            event: () => { }
                        },
                        {
                            name: 'Replace',
                            shortcut: 'Ctrl+H',
                            event: () => { }
                        },
                        { separete: true },
                        {
                            name: 'Find In Files',
                            shortcut: 'Ctrl+Shift+F',
                            event: () => { }
                        },
                        {
                            name: 'Replace In Files',
                            shortcut: 'Ctrl+Shift+H',
                            event: () => { }
                        }
                    ]
                },
                {
                    key: "Select",
                    items: [
                        {
                            name: 'Select all',
                            event: () => {
                                
                            }
                        },
                    ]
                },
                {
                    key: "View",
                    items: [
                        {
                            name: 'File Explorer',
                            event: () => {
                                this.state.newFileExplorer();
                            }
                        },
                        {
                            name: 'Database Explorer',
                            event: () => {
                                //this.state.newFileExplorer();
                            }
                        },
                        {
                            name: 'New Terminal',
                            event: async () => {
                                await this.state.newTerminal();
                            }
                        },
                    ]
                },
                {
                    key: 'Packages',
                    items: [
                        {
                            name: 'Marketplace',
                            event: async () => {
                                //await this.state.newTerminal();
                            }
                        },
                        { separete: true },
                        {
                            name: 'Import Package',
                            event: async () => {
                                //await this.state.newTerminal();
                            }
                        },
                        {
                            name: 'Create Package',
                            event: async () => {
                                //await this.state.newTerminal();
                            }
                        },
                    ]
                },
                {
                    key: 'Help',
                    items: [
                        {
                            name: 'About',
                            event: () => {
                                this.$store.commit('editor/SET_ABOUT', true);
                            }
                        },
                    ]
                },
            ]
        }
    }
}
</script>