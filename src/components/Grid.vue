<template>
    <div class="grid-container" :style="{
        '--minSize': minSize,
        '--gap': gap,
    }">
        <slot
            v-for="(d, i) in datas"
            :key="dataKey(d)"
            v-bind="{ item: d, i }"></slot>
    </div>
</template>

<script setup>
let props = defineProps({
    datas: {
        type: Array,
        default: ()=>[]
    },
    dataKey: {
        type: Function,
        default: d=>d,
    },
    minSize: {
        type: String,
        default: '200px',
    },
    gap: {
        type: String,
        default: '16px 16px'
    }
})
</script>

<style lang="scss" scoped>
.grid-container{
    display: grid;
    gap: var(--gap);
    grid-template-columns: repeat(auto-fill, minmax(var(--minSize), 1fr));
}
</style>