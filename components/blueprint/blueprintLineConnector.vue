<template>
    <svg 
        class="z-10 absolute svg" 
        @click="click" 
        :selected="line.selected"
    >
        <path     
            :class="[(lineDashAnimation) ? 'lineAnimation' : '',  'hover:stroke-slate-600']"
            :stroke="(selected) ? lineColorClicked : lineColor" 
            :stroke-width="lineWidth" 
            :stroke-dasharray="lineDashArray"  
            :stroke-dashoffset="dashOffset"                  
            :d="d"                 
            fill="none"
        ></path>
    </svg>
</template>

<style scoped>
.svg{
    user-select: none;
    overflow: visible !important;
    pointer-events: none;
}

.svg path{
    pointer-events: all;
    transform-origin: 0px 0px;
}

.lineAnimation {
    stroke-dashoffset: 0;
    animation: dash 4s infinite;
}

.lineAnimation:hover {
    animation-play-state: paused;
}

@keyframes dash {
    to {
        stroke-dashoffset: -50;
    }
}
</style>

<script>
export default{
    props: {
        keyref: { type: String },
        selected: { type: Boolean },
        line: { type: Object },
        offset: { type: Object },
        transformPosition: { type: Object },
        scrollOffset: { type: Object },
        startOffset: {
            type: Number,
            default: 100
        },
        endOffset: {
            type: Number,
            default: 50
        },
        lineWidth: {
            type: Number,
            default: 2
        },
        lineColor: {
            type: String,
            default: "#ffffff"
        },
        lineColorClicked: {
            type: String,
            default: "#ff0000"
        },
        lineDashArray: {
            type: Number,
            default: 0
        },
        lineDashAnimation: {
            type: Boolean,
            default: false
        },
        lineDashAnimationSpeed: {
            type: Number,
            default: 1
        },
        scale: {
            type: Number,
            default: 1
        }
    },

    data(){
        return {
            d: "",
            x: 0,
            timerAnimation: null,
            dashOffset: 0,
            clicked: false,
            top: 0,
            left: 0,
            width: 0,
            height: 0
        }
    },

    mounted(){
        this.draw();
    },

    methods: {
        draw(){
            if(this.line.from && this.line.to && this.line.from.getBoundingClientRect && this.line.to.getBoundingClientRect){
                const fromPosition = this.line.from.getBoundingClientRect();
                const toPosition = this.line.to.getBoundingClientRect();

                if(fromPosition && toPosition){
                    let fromX = fromPosition.left - this.offset.x + this.scrollOffset.x;
                    let offsetFromX = fromPosition.width;
                    let fromY = fromPosition.top - this.offset.y + this.scrollOffset.y;

                    let toX = toPosition.x - this.offset.x + this.scrollOffset.x;
                    let toY = toPosition.y - this.offset.y + this.scrollOffset.y;

                    fromY = fromY + (10 * this.scale);
                    toY = toY + (12 * this.scale);
                
                    const bezierFromX = fromX + offsetFromX;
                    const bezierToX = toX + 10;
                    const bezierIntensity = Math.min(100, Math.max(Math.abs(bezierFromX - bezierToX) / 2, Math.abs(fromY - toY)));                    
                    this.d = 'M' + bezierFromX + ' ' + (fromY) + ' C' + (fromX + this.startOffset + bezierIntensity) + ' ' + fromY + ' ' + (toX - this.endOffset - bezierIntensity) + ' ' + toY + ' ' + bezierToX + ' ' + toY;
                    this.x = fromX;
                }
            }
        },

        remove(){
            this.$emit("remove", this.line);
        },

        click(){
            if(this.keyref){
                this.$emit("clickLine", this.keyref);
                this.$forceUpdate();
            }
        }
    }
}
</script>