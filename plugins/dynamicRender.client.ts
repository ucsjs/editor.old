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
                template: this.component?.content,
                props: { component: this.component }
            }, { 
                component: this.component
            });
        }
    });
});