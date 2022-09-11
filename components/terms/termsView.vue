<template>
    <div class="bg-neutral-900 w-full h-[600px] border-t-4 border-neutral-800"> 
        <div ref="terminal"></div> 
    </div>
</template>

<script>
export default{
    data(){
        return {
            term: null,
            socket: null
        }
    },

    async mounted(){
        if(process.client){
            const Terminal = await import('xterm').then(m => m?.Terminal);
            const WebLinksAddon = await import('xterm-addon-web-links').then(m => m?.WebLinksAddon);
            const FitAddon = await import('xterm-addon-fit').then(m => m?.FitAddon);
            const AttachAddon = await import('xterm-addon-attach').then(m => m?.AttachAddon);

            this.term = new Terminal({convertEol: true});
            this.socket = new WebSocket("ws://localhost:5002");
  
            this.socket.onopen = () => {                
                this.term.loadAddon(new WebLinksAddon());
                this.term.loadAddon(new FitAddon());
                this.term.loadAddon(new AttachAddon(this.socket));
                this.term.open(this.$refs.terminal);
                this.term.winptyCompatInit();
                this.term.fit();
                this.term.clear();
                this.term.focus();
                //this.socket.send(`./node_modules/.bin/ts-node ./src/run.ts -b ".workspace/blueprints/helloworld.blueprint.ts"`)
            };

            this.socket.onerror = (e) => { throw e };
        }
    }
}
</script>