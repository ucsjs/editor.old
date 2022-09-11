<template>
    <span :tooltip="tooltipText" :position="position" class="z-50 select-none"><slot /></span>
</template>

<script>
export default {
    props: {
        tooltipText: {
            type: String,
            default: ""
        },
        position: {
            type: String,
            default: "top"
        }
    }
}
</script>