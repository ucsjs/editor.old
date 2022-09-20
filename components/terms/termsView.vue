<template>
    <div class="bg-black w-full h-full border-t-4 border-neutral-800 overflow-hidden flex flex-col relative" ref="viewport"> 
        <div ref="terminal" class="h-full w-full"></div> 
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