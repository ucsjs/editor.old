export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component("dynamic-renderer", {
        props: ["component", "state", "default"],
        
        render(){
            return h({
                template: this.component?.content,
                props: { component: this.component, state: this.state },
            }, { component: this.component, state: this.state });
        }
    });
});