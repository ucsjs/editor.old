<template>
    <div ref="box" class="dragbox" @mouseup="mouseUp">
        <div class="bg-transparent fixed top-0 left-0 right-0 bottom-0" @mouseup="mouseUp" @mousemove="move" v-if="selected && startDrag"></div>

        <div 
            class="handles absolute w-full h-full z-50" 
            v-if="resizable && (startDrag || selected)"
            @mousedown.stop="(event) => selectDirection(event, 'move')"
            @mousemove.stop="move"
            @mouseup="handleMouseLeave"
        >
            <div 
                class="handle handle-se" 
                @mousedown.stop="(event) => selectDirection(event, 'se')" 
                @mouseleave="handleMouseLeave" 
                @mouseup="handleMouseLeave" 
                @mousemove.stop="move"                 
            ></div>
            <div 
                class="handle handle-ne" 
                @mousedown.stop="(event) => selectDirection(event, 'ne')" 
                @mouseleave="handleMouseLeave"
                @mouseup="handleMouseLeave"
                @mousemove.stop="move" 
            ></div>
            <div 
                class="handle handle-sw" 
                @mousedown.stop="(event) => selectDirection(event, 'sw')" 
                @mouseleave="handleMouseLeave"
                @mouseup="handleMouseLeave"
                @mousemove.stop="move" 
            ></div>
            <div 
                class="handle handle-nw" 
                @mousedown.stop="(event) => selectDirection(event, 'nw')" 
                @mouseleave="handleMouseLeave" 
                @mouseup="handleMouseLeave"
                @mousemove.stop="move" 
            ></div>

            <div 
                class="handle handle-ns handle-top"
                @mousedown.stop="(event) => selectDirection(event, 'top')" 
                @mouseleave="handleMouseLeave" 
                @mouseup="handleMouseLeave"
                @mousemove.stop="move" 
            ></div>
            <div 
                class="handle handle-ns handle-bottom"
                @mousedown.stop="(event) => selectDirection(event, 'bottom')" 
                @mouseleave="handleMouseLeave" 
                @mouseup="handleMouseLeave"
                @mousemove.stop="move" 
            ></div>
            <div 
                class="handle handle-ew handle-left"
                @mousedown.stop="(event) => selectDirection(event, 'left')" 
                @mouseleave="handleMouseLeave" 
                @mouseup="handleMouseLeave"
                @mousemove.stop="move" 
            ></div>
            <div 
                class="handle handle-ew handle-right"
                @mousedown.stop="(event) => selectDirection(event, 'right')" 
                @mouseleave="handleMouseLeave" 
                @mouseup="handleMouseLeave"
                @mousemove.stop="move" 
            ></div>
        </div>
        
        <slot></slot>
    </div>
</template>

<style scoped>
.handles {
    cursor: move;
}

.handle{
    position: absolute;
    width: 10px;
    height: 10px;
    background: #FFFFFF;
    border: 1px solid #49c0f0;
    border-radius: 50%;
    z-index: 1000;
    
}

.handle-se{
    left: -5px;
    top: -5px;
    cursor: se-resize;
}

.handle-ne{
    top: -5px;
    right: -5px;
    cursor: ne-resize;
}

.handle-sw{
    bottom: -5px;
    left: -5px;
    cursor: sw-resize;
}

.handle-nw{
    bottom: -5px;
    right: -5px;
    cursor: nw-resize;
}

.resizeHandle{
    position: absolute;
}

.handle-ns{
    background: #FFFFFF;
    border: 1px solid #49c0f0;
    left: 50%;
    margin-left: -5px;
    cursor: ns-resize;
}

.handle-ew{
    background: #FFFFFF;
    border: 1px solid #49c0f0;
    top: 50%;
    margin-top: -5px;
    cursor: ew-resize;
}

.handle-top{
    top: -5px;
}

.handle-bottom{
    bottom: -5px;
}

.handle-left{
    left: -5px;
}

.handle-right{
    right: -5px;
}
</style>

<script>
export default {
    props: {
        selected: {
            type: Boolean,
            default: false
        },

        resizable: {
            type: Boolean,
            default: true
        },

        draggable: {
            type: Boolean,
            default: true
        },

        top: {
            type: Number,
            default: 0
        },

        left: {
            type: Number,
            default: 0
        },
    },

    data(){
        return {
            startDrag: false,
            startPosition: null,
            startMousePosition: null,   
            changeState: null,
            direction: null,        
        }
    },

    mounted(){
        this.$refs.box.style.top = this.top + 'px';
        this.$refs.box.style.left = this.left + 'px';
    },

    methods: {
        handleMouseDown($event){
            this.startMousePosition = { x: $event.clientX, y: $event.clientY };
            let Bounding = this.$refs.box.getBoundingClientRect();
            this.startPosition = { x: this.left, y: this.top, width: Bounding.width, height: Bounding.height };
        },

        mouseUp($event){
            this.startDrag = false;
            this.$emit("mouseUp"); 

            if(this.changeState){
                this.$emit("resize", this.changeState);                
                this.changeState = null;
            }
        },

        handleMouseLeave(){     
            if(this.changeState){
                this.$emit("resize", this.changeState);
                this.changeState = null;
            }
        },

        selectDirection(event, direction){ 
            this.handleMouseDown(event);
            this.direction = direction;
            this.startDrag = true;
        },

        move($event){
            if(this.startDrag){
                let box = this.$refs.box;
                let x = this.startMousePosition.x - $event.clientX;
                let y = this.startMousePosition.y - $event.clientY;

                switch(this.direction){
                    case "move":
                        box.style.top = this.startPosition.y - y + 'px';
                        box.style.left = this.startPosition.x - x + 'px';
                        this.$emit('update:top', this.startPosition.y - y);
                        this.$emit('update:left', this.startPosition.x - x);

                        this.changeState = { 
                            x: (this.startPosition.x - x), 
                            y: (this.startPosition.y - y), 
                            w: this.startPosition.width, 
                            h: this.startPosition.height 
                        };

                        this.$emit("resize", this.changeState);
                    break;
                    case 'top': 
                        box.style.height = this.startPosition.height + y + 'px';
                        box.style.top = this.startPosition.y - y + 'px';
                        this.$emit('update:top', this.startPosition.y - y);

                        this.changeState = { 
                            x: this.startPosition.x, 
                            y: (this.startPosition.y - y), 
                            w: this.startPosition.width, 
                            h: (this.startPosition.height + y) 
                        };
                    break;
                    case "bottom":
                        box.style.height = this.startPosition.height - y + 'px';

                        this.changeState = { 
                            x: this.startPosition.x, 
                            y: this.startPosition.y, 
                            w: this.startPosition.width, 
                            h: (this.startPosition.height - y) 
                        };
                    break;
                    case "left":
                        box.style.width = this.startPosition.width + x + 'px';
                        box.style.left = this.startPosition.x - x + 'px';
                        this.$emit('update:left', this.startPosition.x - x);

                        this.changeState = { 
                            x: (this.startPosition.x - x), 
                            y: this.startPosition.y, 
                            w: (this.startPosition.width + x), 
                            h: this.startPosition.height 
                        };
                    break;
                    case "right":   
                        box.style.width = this.startPosition.width - x + 'px';

                        this.changeState = { 
                            x: this.startPosition.x, 
                            y: this.startPosition.y, 
                            w: (this.startPosition.width - x), 
                            h: this.startPosition.height 
                        };
                    break;
                    case 'se':
                        box.style.width = this.startPosition.width + x + 'px';
                        box.style.height = this.startPosition.height + y + 'px';
                        box.style.top = this.startPosition.y - y + 'px';
                        box.style.left = this.startPosition.x - x + 'px';
                        this.$emit('update:top', this.startPosition.y - y);
                        this.$emit('update:left', this.startPosition.x - x);

                        this.changeState = { 
                            x: (this.startPosition.x - x), 
                            y: (this.startPosition.y - y), 
                            w: (this.startPosition.width + x), 
                            h: (this.startPosition.height + y) 
                        };

                        break;
                    case 'ne':
                        box.style.width = this.startPosition.width - x + 'px';
                        box.style.height = this.startPosition.height + y + 'px';
                        box.style.top = this.startPosition.y - y + 'px';
                        this.$emit('update:top', this.startPosition.y - y);

                        this.changeState = { 
                            x: this.startPosition.x, 
                            y: (this.startPosition.y - y), 
                            w: (this.startPosition.width - x), 
                            h: (this.startPosition.height + y) 
                        };

                        break;
                    case 'sw':
                        box.style.width = this.startPosition.width + x + 'px';
                        box.style.height = this.startPosition.height - y + 'px';
                        box.style.left = this.startPosition.x - x + 'px';
                        this.$emit('update:left', this.startPosition.x - x);

                        this.changeState = {  
                            x: (this.startPosition.x - x), 
                            y: this.startPosition.y,
                            w: (this.startPosition.width + x), 
                            h: (this.startPosition.height - y) 
                        };
                        break;
                    case 'nw':
                        box.style.width = this.startPosition.width - x + 'px';
                        box.style.height = this.startPosition.height - y + 'px';

                        this.changeState = { 
                            x: this.startPosition.x,
                            y: this.startPosition.y,
                            w: (this.startPosition.width - x), 
                            h: (this.startPosition.height - y) 
                        };
                        break;
                }
            }
        }
    }
}
</script>