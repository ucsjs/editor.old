<template>
    <div ref="container">
        <slot></slot>

        <div class="lines w-full h-full top-0 left-0">
            <div class="line-w-center"></div>
            <div class="line-h-center"></div>
            <div 
                v-for="item in lines" 
                :key="item"
                :style="{
                    backgroundColor: item.color,
                    width: item.w + 'px',
                    height: item.h + 'px',
                    top: item.y + 'px',
                    left: item.x + 'px'
                }"
                class="line z-20"
            ></div>

            <div 
                v-for="item in legends" 
                :key="item"
                class="fixed legend" 
                :style="{
                    backgroundColor: item.color,
                    top: (item.y + ((item.h/2) - 12)) + 'px',
                    left: item.x + 5 + 'px'
                }"
            >{{ item.diff }} px</div>
        </div>
    </div>
</template>

<style scoped>
.line{
    position: absolute;
}

.line-w-center{
    position: absolute;
    width: 1px;
    height: 100%;
    background-color: coral;
    top: 0px;
    left: 50%;
    display: none;
}

.line-h-center{
    position: absolute;
    width: 100%;
    height: 1px;
    background-color: coral;
    top: 50%;
    left: 0px;
    display: none;
}

.legend{
    padding: 1px;
    padding-left: 5px;
    padding-right: 5px;
    border-radius: 5px;
    font-size: 12px;
}
</style>

<script>
export default {
    props: {
        viewport: {
            type: Object,
            default: () => ({ width: 0, height: 0 })     
        },

        detectSpace: {
            type: Number,
            default: 100
        },

        alignSpace: {
            type: Number,
            default: 2
        }
    },

    data(){
        return {
            lines: [],
            legends: [],
        }
    },

    mounted(){
        this.lines = [];
        this.legends = [];
    },

    methods: {
        mouseUp(){
            this.lines = [];
            this.legends = [];
        },

        moveDetect(component, components){
            this.lines = [];
            this.legends = [];

            const componentPosition = { 
                x: component.Transform.left, 
                y: component.Transform.top, 
                w: component.Transform.width, 
                h: component.Transform.height 
            };

            for(let outerComponent of components){
                if(component.id !== outerComponent.settings.id){
                    const outerComponentposition = { 
                        x: outerComponent.transform?.left, 
                        y: outerComponent.transform?.top, 
                        w: outerComponent.transform?.width, 
                        h: outerComponent.transform?.height 
                    };

                    //Spacing horizontal
                    if(outerComponentposition.y - (componentPosition.y + componentPosition.h) < this.detectSpace && outerComponentposition.y - (componentPosition.y + componentPosition.h) > 0){
                        if(outerComponentposition.y - (componentPosition.y + componentPosition.h) > 0){
                            const tmpX = this.getDiffX(componentPosition, outerComponentposition)
                            
                            if(tmpX > 0){
                                this.lines.push({
                                    x: tmpX,
                                    y: (componentPosition.y + componentPosition.h),
                                    h: outerComponentposition.y - (componentPosition.y + componentPosition.h),
                                    w: 1,
                                    diff: outerComponentposition.y - (componentPosition.y + componentPosition.h),
                                    color: "#ff7f50"
                                });

                                this.legends.push({
                                    x: tmpX,
                                    y: (componentPosition.y + componentPosition.h),
                                    h: outerComponentposition.y - (componentPosition.y + componentPosition.h),
                                    diff: outerComponentposition.y - (componentPosition.y + componentPosition.h),
                                    color: "#ff7f50"
                                });
                            }
                        }
                    }
                    else if(componentPosition.y - (outerComponentposition.y + outerComponentposition.h) < this.detectSpace && componentPosition.y - (outerComponentposition.y + outerComponentposition.h) > 0){
                        if(componentPosition.y - (outerComponentposition.y + outerComponentposition.h) > 0){
                            const tmpX = this.getDiffX(componentPosition, outerComponentposition)
                            
                            if(tmpX > 0){
                                this.lines.push({
                                    x: tmpX,
                                    y: componentPosition.y - (componentPosition.y - (outerComponentposition.y + outerComponentposition.h)),
                                    h: componentPosition.y - (outerComponentposition.y + outerComponentposition.h),
                                    w: 1,
                                    diff: componentPosition.y - (outerComponentposition.y + outerComponentposition.h),
                                    color: "#ff7f50"
                                });

                                this.legends.push({
                                    x: tmpX,
                                    y: componentPosition.y - (componentPosition.y - (outerComponentposition.y + outerComponentposition.h)),
                                    h: componentPosition.y - (outerComponentposition.y + outerComponentposition.h),
                                    diff: componentPosition.y - (outerComponentposition.y + outerComponentposition.h),
                                    color: "#ff7f50"
                                });
                            }
                        }
                    }

                    //Spacing vertical
                    if(outerComponentposition.x - (componentPosition.x + componentPosition.w) < this.detectSpace && outerComponentposition.x - (componentPosition.x + componentPosition.w) > 0){
                        if(outerComponentposition.x - (componentPosition.x + componentPosition.w) > 0){
                            const tmpY = this.getDiffY(componentPosition, outerComponentposition)
                            
                            if(tmpY > 0){
                                const lineWidth = outerComponentposition.x - (componentPosition.x + componentPosition.w);

                                this.lines.push({
                                    x: (componentPosition.x + componentPosition.w),
                                    y: tmpY,
                                    h: 1,
                                    w: outerComponentposition.x - (componentPosition.x + componentPosition.w),
                                    diff: outerComponentposition.x - (componentPosition.x + componentPosition.w),
                                    color: "#ff7f50"
                                });

                                this.legends.push({
                                    x: (componentPosition.x + componentPosition.w) + ((lineWidth / 2) - 20),
                                    y: tmpY,
                                    h: outerComponentposition.y - (componentPosition.y + componentPosition.h),
                                    diff: outerComponentposition.x - (componentPosition.x + componentPosition.w),
                                    color: "#ff7f50"
                                });
                            }
                        }
                    }
                    else if(componentPosition.x - (outerComponentposition.x + outerComponentposition.w) < this.detectSpace && componentPosition.x - (outerComponentposition.x + outerComponentposition.w) > 0){
                        if(componentPosition.x - (outerComponentposition.x + outerComponentposition.w) > 0){
                            const tmpY = this.getDiffY(componentPosition, outerComponentposition)
                            
                            if(tmpY > 0){
                                const lineWidth = componentPosition.x - (outerComponentposition.x + outerComponentposition.w);

                                this.lines.push({
                                    x: componentPosition.x - (componentPosition.x - (outerComponentposition.x + outerComponentposition.w)),
                                    y: tmpY,
                                    h: 1,
                                    w: componentPosition.x - (outerComponentposition.x + outerComponentposition.w),
                                    diff: componentPosition.x - (outerComponentposition.x + outerComponentposition.w),
                                    color: "#ff7f50"
                                });

                                this.legends.push({
                                    x: componentPosition.x - ((lineWidth / 2) + 25),
                                    y: tmpY,
                                    h: componentPosition.y - (outerComponentposition.y + outerComponentposition.h),
                                    diff: componentPosition.x - (outerComponentposition.x + outerComponentposition.w),
                                    color: "#ff7f50"
                                });
                            }
                        }
                    }

                    //Position
                    if(componentPosition.x < outerComponentposition.x + this.alignSpace 
                        && componentPosition.x > outerComponentposition.x - this.alignSpace){
                        this.lines.push({ x: componentPosition.x, y: 0, h: this.viewport.height, w: 1, color: "#93c503" });
                    }
                    else if(componentPosition.x + componentPosition.w < outerComponentposition.x + outerComponentposition.w + this.alignSpace 
                        && componentPosition.x + componentPosition.w > outerComponentposition.x + outerComponentposition.w - this.alignSpace){
                        this.lines.push({ x: componentPosition.x + componentPosition.w, y: 0, h: this.viewport.height, w: 1, color: "#93c503" });
                    }
                    else if(componentPosition.x + componentPosition.w < outerComponentposition.x + this.alignSpace 
                        && componentPosition.x + componentPosition.w > outerComponentposition.x - this.alignSpace){
                        this.lines.push({ x: componentPosition.x + componentPosition.w, y: 0, h: this.viewport.height, w: 1, color: "#93c503" });
                    }
                    else if(componentPosition.x < outerComponentposition.x + outerComponentposition.w + this.alignSpace 
                        && componentPosition.x > outerComponentposition.x + outerComponentposition.w - this.alignSpace){
                        this.lines.push({ x: componentPosition.x, y: 0, h: this.viewport.height, w: 1, color: "#93c503" });
                    }
                    else if(componentPosition.x + (componentPosition.w/2) < outerComponentposition.x + (outerComponentposition.w/2) + this.alignSpace 
                        && componentPosition.x + (componentPosition.w/2) > outerComponentposition.x + (outerComponentposition.w/2) - this.alignSpace){
                        this.lines.push({ x: componentPosition.x + (componentPosition.w/2), y: 0, h: this.viewport.height, w: 1, color: "#93c503" });
                    }
                    
                    if(outerComponentposition.y > 0){
                        if(componentPosition.y + (componentPosition.h/2) < outerComponentposition.y + (outerComponentposition.h/2) + this.alignSpace 
                            && componentPosition.y + (componentPosition.h/2) > outerComponentposition.y + (outerComponentposition.h/2) - this.alignSpace){
                            this.lines.push({ x: 0, y: componentPosition.y + (componentPosition.h/2), h: 1, w: this.viewport.width, color: "#93c503" });
                        }
                        else if(componentPosition.y < outerComponentposition.y + this.alignSpace 
                            && componentPosition.y > outerComponentposition.y - this.alignSpace){
                            this.lines.push({ x: 0, y: componentPosition.y, h: 1, w: this.viewport.width, color: "#93c503"});
                        }
                        else if(componentPosition.y + componentPosition.h < outerComponentposition.y + outerComponentposition.h + this.alignSpace 
                            && componentPosition.y + componentPosition.h > outerComponentposition.y + outerComponentposition.h - this.alignSpace){
                            this.lines.push({ x: 0, y: componentPosition.y + componentPosition.h, h: 1, w: this.viewport.width, color: "#93c503"});
                        }
                        else if(componentPosition.y + componentPosition.h < outerComponentposition.y + this.alignSpace 
                            && componentPosition.y + componentPosition.h > outerComponentposition.y - this.alignSpace){
                            this.lines.push({ x: 0, y: componentPosition.y + componentPosition.h, h: 1, w: this.viewport.width, color: "#93c503" });
                        }
                        else if(componentPosition.y < outerComponentposition.y + outerComponentposition.h + this.alignSpace 
                            && componentPosition.y > outerComponentposition.y + outerComponentposition.h - this.alignSpace){
                            this.lines.push({ x: 0, y: componentPosition.y, h: 1, w: this.viewport.width, color: "#93c503" });
                        }  
                    }                                      
                }
            }
        },

        getDiffX(componentPosition, outerComponentposition){
            let tmpX = componentPosition.x + (componentPosition.w/2);

            if(tmpX > outerComponentposition.x + outerComponentposition.w)
                tmpX = componentPosition.x + 10;
            if(outerComponentposition.x > tmpX)
                tmpX = outerComponentposition.x + 10;
            if(tmpX > componentPosition.x + componentPosition.w || tmpX > outerComponentposition.x + outerComponentposition.w)
                tmpX = 0;
            
            return tmpX;
        },

        getDiffY(componentPosition, outerComponentposition){
            let tmpY = componentPosition.y + (componentPosition.h/2);

            if(tmpY > outerComponentposition.y + outerComponentposition.h)
                tmpY = componentPosition.y + 10;
            if(outerComponentposition.y > tmpY)
                tmpY = outerComponentposition.y + 10;
            if(tmpY > componentPosition.y + componentPosition.h || tmpY > outerComponentposition.y + outerComponentposition.h)
                tmpY = 0;
            
            return tmpY;
        }
    }
}
</script>