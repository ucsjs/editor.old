<template>
    <div class="bg-black w-full h-full border-t-4 border-neutral-800 overflow-hidden flex flex-col relative" ref="viewport"> 
        <div class="bg-neutral-800 w-full flex flex-1 absolute h-10 px-2">
            <div class="hidden sm:block">
                <div class="border-b border-gray-200 ">
                    <nav class="-mb-px flex space-x-3" aria-label="Tabs">
                        <a v-for="tab in tabs" 
                            :key="tab.name" 
                            :href="tab.href" 
                            :class="[tab.current ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm']" 
                            :aria-current="tab.current ? 'page' : undefined"
                        >{{ tab.name.toUpperCase() }}</a>
                    </nav>
                </div>
            </div>
        </div>

        <div class="flex flex-1 p-2 w-full mt-10">
            <div ref="terminal" class="h-full w-full"></div> 
        </div>
    </div>
</template>

<style scoped>
* {
    scrollbar-width: auto;
    scrollbar-color: #171717 #000000;
}

*::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner {
    background: #1E1E1E;
}

*::-webkit-scrollbar-thumb {
    background-color: #383838;
    border-radius: 0px;
    border: 3px solid #383838;
    border-radius: 30px;
}

.terminal.xterm {
    height: 100%;
}
.xterm-viewport {
    height: 100% !important;
}
</style>

<script>
export default{
    data(){
        return {
            term: null,
            socket: null,
            viewportOffset: {},
            tabs: [{ name: "Terminal 1"}]
        }
    },

    async mounted(){
        if(process.client){
            const Terminal = await import('xterm').then(m => m?.Terminal);
            const WebLinksAddon = await import('xterm-addon-web-links').then(m => m?.WebLinksAddon);
            const FitAddon = await import('xterm-addon-fit').then(m => m?.FitAddon);
            const AttachAddon = await import('xterm-addon-attach').then(m => m?.AttachAddon);
            const SearchAddon = await import('xterm-addon-search').then(m => m?.SearchAddon);
            const WebglAddon = await import('xterm-addon-webgl').then(m => m?.WebglAddon);
            const fitAddon = new FitAddon();

            this.term = new Terminal({convertEol: true});
            this.socket = new WebSocket("ws://localhost:5002");

            if(this.$refs.terminal){
                new ResizeObserver((a) => {
                    fitAddon.fit();
                }).observe(this.$refs.terminal);
            }
              
            this.socket.onopen = () => {                
                this.term.loadAddon(new WebLinksAddon());
                this.term.loadAddon(fitAddon);
                this.term.loadAddon(new AttachAddon(this.socket));
                this.term.loadAddon(new SearchAddon());                
                this.term.open(this.$refs.terminal, );
                fitAddon.fit();
            };

            setInterval(() => {
                if(this.$refs.viewport && this.$refs.viewport?.getBoundingClientRect)
                    this.viewportOffset = this.$refs.viewport?.getBoundingClientRect();
            }, 100);

            this.socket.onerror = (e) => { throw e };
        }
    }
}
</script>