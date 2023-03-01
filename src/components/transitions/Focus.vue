<template>
<Teleport ref="el" to="body" :disabled="!delayValue">
    <div ref="wrapper" v-if="delayValue" style="z-index: 1">
        <slot></slot>
    </div>
    <slot v-else></slot>
    <transition name="anfo-fade" appear>
        <div @click="$emit('update:value', false)" v-if="value" class="fixed size-full t-0 l-0" style="background: rgba(0, 0, 0, .3)"></div>
    </transition>
</Teleport>
<!-- placeholder -->
<div v-if="delayValue" style="visibility: hidden">
    <slot></slot>
</div>
</template>

<script setup>
import { getCurrentInstance, nextTick, ref, watch } from 'vue'
import utils from '@/scripts/utils'

let instance = getCurrentInstance()
let context = instance.ctx

let props = defineProps({
    value: Boolean,
    top: String,
    transformY: String,
    left: String,
    transformX: String,
    transition: String,
})
let emit = defineEmits(['update:value', 'update:delayValue'])

let getDefaultSlot = ()=>context.$el.nextElementSibling
let wrapper = ref(null)

let prevTop, prevLeft

let delayValue = utils.createAsyncComputed(()=>props.value, async (val)=>{
    if(!val){
        if(wrapper.value){
            return new Promise(r=>{
                function handleTransitionEnd(e){
                    if(e.target === wrapper.value){
                        wrapper.value.style.transition = ''
                        wrapper.value.removeEventListener('transitionend', handleTransitionEnd)
                        r(false)
                    }
                }
                wrapper.value.addEventListener('transitionend', handleTransitionEnd)
            })
        }
    }
    return val
})

watch(()=>props.value, val=>{
    if(!val){
        wrapper.value.style.transform = ''
        wrapper.value.style.left = prevLeft + 'px'
        wrapper.value.style.top = prevTop + 'px'
    }
})

watch(delayValue, val=>{
    if(val){
        let defaultSlot = getDefaultSlot()
        let { left, top, height, width } = defaultSlot.getBoundingClientRect()
        prevLeft = left
        prevTop = top
        nextTick(()=>{
            wrapper.value.style.position = 'fixed'
            wrapper.value.style.left = left + 'px'
            wrapper.value.style.top = top + 'px'

            wrapper.value.style.width = width + 'px'
            wrapper.value.style.height = height + 'px'
            
            wrapper.value.style.margin = 0
            wrapper.value.style.transition = props.transition || 'transform .3s, left .3s, top .3s'
            // wrapper.value.addEventListener('transitionend', function handleTransitionEnd(e){
            //     if(e.target === wrapper.value){
            //         wrapper.value.removeEventListener('transitionend', handleTransitionEnd)
            //     }
            // })
            nextTick(()=>{
                wrapper.value.offsetLeft // 重绘界面，可以刷新保证动画进行
                wrapper.value.style.top = props.top || '50%'
                wrapper.value.style.left = props.left || '50%'
                wrapper.value.style.transform = `translate(${props.transformX || '-50%'}, ${props.transformY || '-50%'})`
            })
        })
    }
    emit('update:delayValue', val)
}, {
    immediate: true
})

</script>