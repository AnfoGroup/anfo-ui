<template>
    <div
        :class="containerClass"
        :style="{
            '--layer': layer,
            ...containerStyle,
        }">
        <transition-group :name="transitionName">
            <div
                v-for="(item, i) in middleware"
                :key="getDataKey(item) || i">
                <slot
                    v-bind="typeof item === 'object'?{
                    item,
                    datas: middleware,
                    i,
                    layer,
                }:{}"></slot>
                <anfo-loop
                    v-if="item?.[getChildrenKey(item)]?.length > 0"
                    :childrenKey="childrenKey"
                    :dataKey="dataKey"
                    :layer="(+layer)+1"
                    v-model:datas="item[getChildrenKey(item)]"
                    :container-class="containerClass"
                    :container-style="containerStyle"
                    :transition-name="transitionName">
                    <template v-slot="item">
                        <slot v-bind="item"></slot>
                    </template>
                </anfo-loop>
            </div>
        </transition-group>
    </div>
</template>

<script setup>
import utils from '@/scripts/utils'

let props = defineProps({
    layer: {
        type: [String, Number],
        default: 0,
    },
    datas: {
        type: Array,
        default: ()=>[]
    },
    dataKey: {
        type: [String, Function],
        default: null,
    },
    childrenKey: {
        type: [String, Function],
        default: 'children',
    },
    containerStyle: {
        type: [String, Object],
        default: ()=>({})
    },
    containerClass: {
        type: [String, Array],
        default: ()=>[]
    },
    transitionName: {
        type: String,
        default: '',
    },
})

function getDataKey(item){
    return props.dataKey instanceof Function ? props.dataKey(item, middleware.value)
        : props.dataKey
}
function getChildrenKey(item){
    return props.childrenKey instanceof Function ? props.childrenKey(item, middleware.value)
        : props.childrenKey
}

let emit = defineEmits(['update:datas'])

let middleware = utils.createMiddleware(()=>JSON.parse(JSON.stringify(props.datas)), async val=>{
    await utils.awaitChange(()=>props.datas, ()=>{
        emit('update:datas', val)
    })
})
</script>