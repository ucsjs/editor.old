export default {
    data(){
        return {
            componentsIndex: {}
        }
    },

    methods:{
        parseComponent(component){
            try{
                if(component){
                    if(!component.label)
                        component.label = component.id || "";
                        
                    if(!component.visibility && component.visibility != false)
                        component.visibility = true;

                    if(!component.static && component.metadata.static)
                        component.static = component.metadata.static;

                    if(!component.static && component.static != false)
                        component.static = false;

                    if(!component.lockBox && component.lockBox != false)
                        component.lockBox = true;

                    for(let key in component.components)
                        this.componentsIndex[component.components[key].component] = key;
                        
                    //Views
                    if(!component.smView && component.smView != false)
                        component.smView = true;

                    if(!component.mdView && component.mdView != false)
                        component.mdView = true;

                    if(!component.lgView && component.lgView != false)
                        component.lgView = true;
                    
                    if(!component.xlView && component.xlView != false)
                        component.xlView = true;

                    if(!component['2xlView'] && component['2xlView'] != false)
                        component['2xlView'] = true;

                    //Transform
                    this.transformComponent = this.getSubcomponent(component, "Transform");

                    if(this.transformComponent){
                        if(component.position && !this.transformComponent.value)
                            this.transform = component.position;                
                        else if(this.transformComponent.value)
                            this.transform = this.transformComponent.value;
                        
                        if(!this.transformComponent.value)
                            this.transformComponent.value = this.transform;
                    }

                    //Parse values
                    for(let key in component.components){
                        const subComponent = component.components[key];

                        if((
                            subComponent.component === "Class" ||
                            subComponent.component === "Transform" ||
                            subComponent.component === "Border" || 
                            subComponent.component === "Background" ||
                            subComponent.component === "Font") && 
                            !subComponent.open && subComponent.open !== true
                        )
                        subComponent.open = false;

                        if(component.componentsDefaults?.length > 0){
                            for(let componentDefault of component.componentsDefaults){
                                if(componentDefault.component == subComponent.component?.toLowerCase()){
                                    subComponent.default[componentDefault.property] = componentDefault.value;
                                }
                            }
                        }

                        if(!component.components[key].value)
                            component.components[key].value = (subComponent.default) ? subComponent.default : {};
                    
                        subComponent[component.components[key].component] = component.components[key].value;
                    }

                    return component
                }
            }
            catch(e){
                console.error(e);
            }
        },

        getSubcomponentIndex(namespace){
            return (this.componentsIndex[namespace]) ? this.componentsIndex[namespace] : null;
        },

        getSubcomponent(component, namespace){
            return (this.componentsIndex[namespace]) ? component.components[this.componentsIndex[namespace]] : null;
        },

        diffComponents(obj1, obj2) {
            const result = {};
            
            if(obj1 && obj2){
                for(let subComponent in obj1){
                    const hasDiff = this.diffObjects(obj1[subComponent].value, obj2[subComponent].value)

                    if(hasDiff){
                        for(let key in obj1[subComponent].value){
                            const Obj1Value = (typeof obj1[subComponent].value[key] === "object") ? JSON.stringify(obj1[subComponent].value[key]) : obj1[subComponent].value[key];
                            const Obj2Value = (typeof obj2[subComponent].value[key] === "object") ? JSON.stringify(obj2[subComponent].value[key]) : obj2[subComponent].value[key];

                            if(Obj1Value != Obj2Value){
                                if(!result[obj1[subComponent].component])
                                    result[obj1[subComponent].component] = {};

                                result[obj1[subComponent].component][key] = {
                                    from: obj1[subComponent].value[key],
                                    to: obj2[subComponent].value[key]
                                };
                            }
                        }
                    }
                }
            }

            return result;
        },

        diffObjects(obj1, obj2) {
            const result = {};

            if (Object.is(obj1, obj2)) 
                return undefined;
            
            if (!obj2 || typeof obj2 !== 'object') 
                return obj2;
            
            Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
                if(obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) 
                    result[key] = obj2[key];
                
                if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
                    const value = this.diffObjects(obj1[key], obj2[key]);
                    if (value !== undefined) {
                        result[key] = value;
                    }
                }
            });

            return result;
        }
    }
}