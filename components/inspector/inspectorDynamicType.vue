<template>
    <client-only placeholder="Loading...">
        <dynamic-renderer 
            :component="component"
            :default="defaultValue"
            @change="(v) => $emit('changeValue', v)"
        >
        </dynamic-renderer>
    </client-only>
</template>

<script>
export default {
    props: ["component", "defaultValue"]
}
</script>
