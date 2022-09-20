export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component("dynamic-renderer", {
        props: {
            component: {
                type: Object,
                required: true
            }
        },
        
        render(){
            return h({
                template: (this.component?.content) ? this.component?.content : ((this.component.template) ? this.component.template : '') ,
                props: { component: this.component, state: this.state },
            }, { component: this.component, state: this.state });
        }
    });
});