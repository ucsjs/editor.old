<template>
    <div class="absolute w-full h-full">
        <div class="grid-background select-none absolute left-0 right-0 top-0 bottom-11">
            <div class="flex flex-col h-full">
                <div class="flex h-10">
                    <visual-editor-navbar />
                </div>
                
                <div class="flex flex-row h-full relative">
                    <visual-editor-hierarchy />

                    <visual-canvas :tab="tab" />

                    <visual-editor-inspector />
                </div>
                
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        tab: {
            type: Object,
            required: true
        }
    },

}
</script>
