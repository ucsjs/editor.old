<template>
    <div >
        <div class="flex flex-row">
            <div>
                <Tooltip :tooltipText="$t('Edit')" position="right">
                    <button class="ml-2 hover:text-neutral-500" @click="$emit('openObjectEdit')">
                        <client-only><font-awesome-icon icon="fa-solid fa-edit" /></client-only>
                    </button>
                </Tooltip>
            </div>
        </div>
    </div>
</template>

<script>
export default {}
</script>