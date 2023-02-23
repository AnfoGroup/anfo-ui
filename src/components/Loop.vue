<template>
    <div
        ref="container"
        :class="containerClass"
        :style="{
            '--layer': layer,
            ...containerStyle,
        }">
        <transition-group :name="transitionName" appear>
            <template
                v-for="(item, i) in middleware"
                :key="getKey(item) || i">
                <div class="h h-sem align-stretch">
                    <!-- <div v-if="getChildren(item).length > 0" @click="handleToggleSubLoops(item, i)" class="clickable h">
                        <CaretRightOutlined :class="['button-fold', folds[getKey(item)] ? 'is-fold':'']" />
                    </div> -->
                    <slot
                        v-bind="typeof item === 'object'?{
                        item,
                        datas: middleware,
                        i,
                        key: getKey(item,),
                        layer,
                        hasChildren: getChildren(item).length > 0,
                        prevHasChildren: middleware[i - 1] && getChildren(middleware[i - 1]).length > 0,
                        toggle: (_item = item, _i = i)=>handleToggleSubLoops(_item,  _i),
                        isFold: folds[getKey(item,)],
                        isLast: (isLast || !parent) && !(getChildren(item).length > 0) && i === middleware.length - 1,
                        isFirst: i === 0 && !parent,
                        parent,
                    } : { }"></slot>
                </div>
                <transition @after-enter="handleAfterEnter" name="fade-height" mode="out-in">
                    <div v-show="!folds[getKey(item)] && getChildren(item).length > 0"
                        class="sub-loop-wrapper">
                        <anfo-loop
                            v-bind="$props"
                            class="sub-loop"
                            :childrenKey="childrenKey"
                            v-model:datas="item[getChildrenKey(item)]"
                            :layer="(+layer) + 1"

                            :parent="item"
                            :is-last="(isLast || !parent) && i === middleware.length - 1">
                            <template v-slot="item">
                                <slot v-bind="item"></slot>
                            </template>
                        </anfo-loop>
                    </div>
                </transition>
            </template>
        </transition-group>
    </div>
</template>
    
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { CaretRightOutlined } from '@ant-design/icons-vue'
import utils from '@/scripts/utils'
import loopProps from './loopProps'

let props = defineProps({
    ...loopProps,
})

let container = ref(null)

// 当前的折叠状态
// let folds = ref((props.datas || []).reduce((t, d)=>{
//     let children = getChildren(d)
//     if(children.length > 0 && children.every(d=>d.state === '!!!!!!here!')){
//         t[d._id] = true
//     }
//     return t
// }, {}))
let folds = ref({})

function handleAfterEnter(el){
    el.style.height = ''
    el.style.overflow = ''
}
async function handleToggleSubLoops(item , i){
    let itemRef = container.value.children[i]
    let currentFoldState = folds.value[getKey(item)]
    let toFoldState =!currentFoldState
    if(itemRef){
        let subLoopWrapper = [...itemRef.children].find(c=>[...c.classList].includes('sub-loop-wrapper'))
        if(subLoopWrapper){
            let subLoop = [...subLoopWrapper.children].find(c=>[...c.classList].includes('sub-loop'))
            let subLoopHeight
            if(toFoldState){
                subLoopWrapper.classList.add('overflow-hidden')
                subLoopHeight = subLoop.offsetHeight
            }else{
                subLoopWrapper.classList.remove('overflow-hidden')
                // 要把这个el扔到一个fixed 屏幕看不见的地方、然后测量高度再取回来
                let el = subLoop.cloneNode(true)
                Object.assign(el.style, {
                    opacity: 0,
                    pointerEvents: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: 'auto',
                })
                document.body.appendChild(el)
                // 等待一次UI重新绘制
                await new Promise(requestAnimationFrame)
                subLoopHeight = el.offsetHeight
                el.remove()
            }
            subLoopWrapper.style.height = subLoopHeight + 'px'
            await new Promise(r=>nextTick(r))
            folds.value[getKey(item)] = toFoldState
        }
    }
}

// function getDataKey(item){
//     return props.dataKey instanceof Function ? props.dataKey(item, middleware.value)
//         : props.dataKey
// }
function getKey(item){
    return props.dataKey instanceof Function ? props.dataKey(item)
        : item?.[props.dataKey]
    // return item?.[getDataKey(item)]
}
function getChildrenKey(item){
    return props.childrenKey instanceof Function ? props.childrenKey(item, middleware.value)
        : props.childrenKey
}
function getChildren(item){
    return item[getChildrenKey(item)] || []
}

let emit = defineEmits(['update:datas'])
let middleware = utils.createMiddleware(()=>props.datas, async val=>{
    emit('update:datas', val)
})
</script>

<style lang="scss" scoped>
.fade-height-enter-active,
.fade-height-leave-active {
    transition: opacity .6s, height .3s;
}

.fade-height-enter-from,
.fade-height-leave-to {
    height: 0!important;
    opacity: 0;
}
.sub-loop-wrapper{
    // overflow: hidden;
}
.button-fold{
    position: relative;
    // position: absolute;
    // 对齐plan-tree的虚线
    left: -.15em;
    transition: transform .3s;
    transform: rotate(90deg);
    &.is-fold{
        transform: none;
    }
}
</style>