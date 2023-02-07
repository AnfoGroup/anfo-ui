<template>
<div class="h h-s" style="flex-wrap: wrap">
    <LeftOutlined @click="to(Math.max(1, current - 1))" class="clickable" />
    <div @click="to(1)" :class="['page-no', 1 === current ? 'is-current':'' ]">1</div>
    <div v-if="range[0] > 2">...</div>
    <div
        @click="to(p)"
        v-for="p in range"
        :class="['page-no', p === current ? 'is-current':'']">
        {{p}}
    </div>
    <div v-if="range[range?.length - 1] < totalPage - 1">...</div>
    <div v-if="totalPage > 1" @click="to(totalPage)" :class="['page-no', current === totalPage ? 'is-current':'' ]">{{ totalPage }}</div>
    <RightOutlined @click="to(Math.min(totalPage, current + 1))" class="clickable" />
</div>
</template>

<script setup>
import { computed } from "@vue/runtime-core"
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'

let props = defineProps({
    current: Number,
    pageSize: Number,
    total: Number,
})
let emit = defineEmits(['update:current'])

let totalPage = computed(()=>Math.ceil(props.total / props.pageSize))

const distance = 2
let range = computed(()=>{
    let current = props.current
    let _totalPage = totalPage.value
    let pivot = Math.max(3, current)
    let start = Math.max(2, pivot - distance)
    let end = Math.min(pivot + distance, _totalPage - 1)
    return end - start + 1 > 0 ? new Array(end - start + 1).fill(0).map((_, i)=>start + i)
        : []
})

function to(p){
    emit('update:current', p)
}
</script>

<style lang="scss" scoped>
.page-no{
    background: whitesmoke;
    // width: $size;
    padding: 2px 4px;
    min-width: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    color: #666;
    transition: background .3s, color .3s;
    cursor: pointer;

    &:hover{
        background: lightgray;
        color: #333;
    }

    &.is-current{
        background: dimgray;
        color: white;
    }
}
</style>