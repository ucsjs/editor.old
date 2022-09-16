<template>
    <div class="relative w-full h-full">
        <div 
            class="bg-neutral-700 w-full h-full grid-background absolute"
            @mousemove="handleDrag" 
            @mouseup="handleDragEnd"
            ref="editor"
        > 
            <div 
                class="w-4 h-4 absolute" 
                :style="{ top: `${mouseHandler.top}px`, left: `${mouseHandler.left}px`}" 
                ref="mousePointer"
            ></div>

            <div class="grid-contents block relative" @mousedown.left="move">
                <div class="justify-center items-center flex h-full">
                    <div 
                        class="bg-white m-auto" 
                        :style="{width: `${viewport.width}px`, height: `${viewport.height}px`, transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`}"
                    >

                    </div> 

                    <div class="absolute h-11 bg-black/50 bottom-6 right-6 rounded-md flex">
                        <Tooltip :tooltipText="$t('Desktop')" position="top" class="flex" @click="viewportDesktop">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-desktop" /></client-only>
                            </button>
                        </Tooltip>

                        <Tooltip :tooltipText="$t('Tablet')" position="top" class="flex" @click="viewportTablet">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-tablet-screen-button" /></client-only>
                            </button>
                        </Tooltip>

                        <Tooltip :tooltipText="$t('Mobile')" position="top" class="flex" @click="viewportMobile">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-mobile-screen-button" /></client-only>
                            </button>
                        </Tooltip>

                        <div class="p-2 text-neutral-600 font-bold">::</div>

                        <Tooltip :tooltipText="$t('Zoom in')" position="top" class="flex" @click="scaleIn">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-magnifying-glass-plus" /></client-only>
                            </button>
                        </Tooltip>

                        <Tooltip :tooltipText="$t('Reset')" position="top" class="flex" @click="scaleResert">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-magnifying-glass" /></client-only>
                            </button>
                        </Tooltip>

                        <Tooltip :tooltipText="$t('Zoom out')" position="top" class="flex" @click="scaleOut">
                            <button class="text-white px-3">
                                <client-only><font-awesome-icon icon="fa-solid fa-magnifying-glass-minus" /></client-only>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.grid-background{
    background-color: #434343;
    background-image:linear-gradient(#434343, #282828);
}

.grid-contents{
    display: block;
    overflow: hidden;
    touch-action: none;
    outline: 0;
    background-color: transparent;
    background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent);
    height:100%;
    background-size:50px 50px;
}

* {
    scrollbar-width: auto;
    scrollbar-color: #262626 #000000;
}

*::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner {
    background: #000000;
}

*::-webkit-scrollbar-thumb {
    background-color: #262626;
    border-radius: 0px;
    border: 3px solid #262626;
}
</style>

<script>
export default {
    props:{
        tab: {
            type: Object,
            required: true
        }
    },

    data(){
        return {
            viewport: { width: 375, height: 667  },
            scale: 1,
            position: { x: 0, y: 0 },
            mouseHandler: { top: 200, left: 200 },
            moveEvent: false,
            devices: {
                mobile: { width: 375, height: 667 },
                tablet: { width: 768, height: 1024 },
                desktop: { width: 1920, height: 1080 }
            }
        }
    },

    async mounted(){
        if(this.tab.content){
            const metadata = JSON.parse(this.tab.content);

            for(let key in metadata)
                this[key] = metadata[key];
        }  
        
        const cachePage = localStorage.getItem(`page-${this.tab.name.replace(/\./, "-")}`);

        if(cachePage){
            const cacheParse = JSON.parse(cachePage);

            if(cacheParse.scale)
                this.scale = cacheParse.scale;

            if(cacheParse.position)
                this.position = cacheParse.position; 

            if(cacheParse.viewport)
                this.viewport = cacheParse.viewport; 
        }
    },

    methods: {
        move(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();

            this.moveStartPosition = { 
                clientX: clientX - editorOffset.x - 10, 
                clientY: clientY - editorOffset.y - 10,
                positionX: this.position.x,
                positionY: this.position.y 
            };

            this.moveEvent = true;
        },

        handleDrag(event){
            const { clientX, clientY } = event;
            const editorOffset = this.$refs.editor.getBoundingClientRect();
            
            this.mouseHandler.top = clientY - editorOffset.y - 10;
            this.mouseHandler.left = clientX - editorOffset.x - 10;                
            
            if(this.moveEvent){      
                const { clientX, clientY, positionX, positionY } = this.moveStartPosition;
                const diffY = this.mouseHandler.top - clientY;
                const diffX = this.mouseHandler.left - clientX;       
                this.position = { x: positionX + diffX, y: positionY + diffY };
            }
        },

        handleDragEnd(event){
            if(this.moveEvent)
                this.moveEvent = false;

            this.saveState(true);
        },

        scaleResert(){
            this.scale = 1;
            this.$forceUpdate();
            this.saveState();
        },  

        scaleIn(){
            this.scale += 0.1;
            this.$forceUpdate();
            this.saveState();
        },  

        scaleOut(){
            this.scale -= 0.1;
            this.$forceUpdate();
            this.saveState();
        },

        viewportDesktop(){
            this.viewport = this.devices.desktop;
            this.saveState();
        },

        viewportTablet(){
            this.viewport = this.devices.tablet;
            this.saveState();
        },

        viewportMobile(){
            this.viewport = this.devices.mobile;
            this.saveState();
        },

        getValue(){
            return {
                scale: this.scale,
                position: this.position,
                viewport: this.viewport
            }
        },

        saveState(emit = false){
            localStorage.setItem(`page-${this.tab.name.replace(/\./, "-")}`, JSON.stringify(this.getValue()));

            if(emit)
                this.$emit("changeState", this.getValue());
        }
    }
}
</script>
