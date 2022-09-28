export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component("dynamic-renderer", {
        props: ["component", "state", "default"],

        methods: {
            getDefaultSlotValue() {
                if (this.$slots.default && this.$slots.default()[0]) 
                    return this.$slots.default()[0].children;
            }
        },
        
        render(){
            return h({
                template: this.component?.content,
                props: { component: this.component, state: this.state },
            }, { component: this.component, state: this.state }, this.getDefaultSlotValue());
        }
    });
});