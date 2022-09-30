export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component("dynamic-renderer", defineComponent({
        props: ["component", "state", "slot"],

        setup(state, { slots }){
            return () => h({
                template: state.component?.content,
                props: { component: state.component, state: state.state },
            }, { component: state.component, state: state.state }, () => slots.default()[0].children)
        }
    }));
});