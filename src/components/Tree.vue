<template>
    <anfo-loop
        v-bind="$props"
        v-model:datas="middleware"
        class="anfo-tree"
        container-class="tree-unit">
        <template #="data">
            <div
                v-drag="data"
                v-drop="data"
                :class="['touch-area h f-1', ]"
                @drop-drag-move="handleDragMove"
                @drop-drag-finish-with-drop="handleDrop">
                <div class="h h-s f-1">
                    <div class="h p-l-xs" style="align-self: stretch" v-if="data.layer > 0 && !data.hasChildren">
                        <div class="is-sub"></div>
                    </div>
                    <CaretRightOutlined
                        @click="data.toggle?.()"
                        class="clickable shrink-0" v-if="data.hasChildren" :style="{
                        fontSize: '.8em',
                        transition: 'transform .3s',
                        transform: `rotate(${data.isFold ? 0 : 90}deg)`,
                    }"/>
                    <slot v-bind="data"></slot>
                </div>
            </div>
        </template>
    </anfo-loop>
</template>
<script setup>
import utils from '@/scripts/utils'
import loopProps from './loopProps'
import { CaretRightOutlined } from '@ant-design/icons-vue'
import extend from 'extend'

let props = defineProps({
    ...loopProps,
})

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
let emit = defineEmits(['update:datas', 'change'])

let middleware = utils.createMiddleware(()=>extend(true, [], props.datas))

function getTypeByOffset(el, offset){
    return [
        offset[0] < el.offsetWidth / 4, // isLeft
        offset[1] < el.offsetHeight / 4, // isTop
    ]
}

async function handleDragMove(e){
    let dropContext = e.getData('dropContext') || {}
    let dropValue = dropContext.value
    let dropValueItem = dropValue.item
    let { el } = dropContext
    let offset = e.getData('offset') || []
    let value = e.getValue()
    let valueItem = value.item
    el.classList.remove('is-top', 'is-left', 'is-right', 'is-bottom')
    if(!await isImInFamilyOfTarget(valueItem, getChildrenKey(valueItem), dropValueItem)){
        let target = el
        let [ isLeft, isTop ] = getTypeByOffset(target, offset)
        if(isLeft || !isTop){
            // 没有右上
            el.classList.add(isTop ? 'is-top' : 'is-bottom')
            el.classList.add(isLeft ? 'is-left' : 'is-right')
        }else{
            el.classList.add('is-top', 'is-left')
        }
    }
}

async function isImInFamilyOfTarget(target, targetChildrenKey, me){
    return !!(await utils.iterate([target], targetChildrenKey, d=>{
        if(getKey(d) === getKey(me)){
            return d
        }
    }))
}

async function fromParentToParent(treeData, from, fromIndex, to, toIndex){
    let offset = 0
    from = await utils.iterate(treeData, d=>getChildrenKey(d), d=>{
        if(getKey(d) === (from && getKey(from))){
            return d
        }
    })
    to = await utils.iterate(treeData, d=>getChildrenKey(d), d=>{
        if(getKey(d) === (to && getKey(to))){
            return d
        }
    })
    if((from && getKey(from)) === (to && getKey(to))){
        // 同级
        if(fromIndex < toIndex){
            offset = -1
        }
    }
    // getchildren 为空，表示顶层
    if(to && !Array.isArray(to[getChildrenKey(to)])){
        to[getChildrenKey(to)] = []
    }
    ;(to ? getChildren(to) : treeData).splice(offset + toIndex, 0,
        ...(from ? getChildren(from) : treeData).splice(fromIndex, 1))
}

async function handleDrop(e){
    let dropContext = e.getData('dropContext')
    let dropValue = dropContext.value
    let dropValueItem = dropValue.item
    let value = e.getValue()
    let valueItem = value?.item
    let [ isLeft, isTop ] = getTypeByOffset(dropContext.el, e.getData('offset'))
    let ind = Math.min(dropValue.datas?.length, Math.max(0, isTop ? dropContext.value?.i : dropContext.value?.i + 1))
    // 不处理和自己相关的
    if(!await isImInFamilyOfTarget(valueItem, getChildrenKey(valueItem), dropValueItem)){
        let treeData = extend(true, [], middleware.value)
        let parent
        if(isLeft){
            parent = await utils.iterate(treeData, d=>getChildrenKey(d), (d, i, datas, parent)=>{
                if(getKey(d) === getKey(dropValueItem)){
                    return parent
                }
            })
        }
        let toValueItem = isLeft ? parent : dropValueItem
        await fromParentToParent(treeData, value.parent, value.i, toValueItem, ind)

        emit('change', {
            treeData,
            value: valueItem,
            dropValue: toValueItem,
            index: ind,
            parent: value.parent,
        })
        emit('update:datas', treeData)
    }
}
</script>

<style lang="scss">
.anfo-tree{
    .tree-unit{
        padding-left: 2.5em;
        .tree-unit{
            position: relative;
            &::after{
                content: '';
                position: absolute;
                left: .4em;
                top: 0;
                height: 100%;
                border-left: 1px dashed dimgray;
            }
        }
    }

    .touch-area{
        position: relative;
        transition: all .3s;
        // 防止拖拽时因为两个area边界粘连导致有可能同时被触发
        margin-bottom: .5px;

        &>div{
            transition: opacity .3s;
        }

        &::after{
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 2px;
            background: dimgray;
            opacity: 0;
            transition: opacity .3s, transform .3s;
        }
        &::before{
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background: dimgray;
            opacity: 0;
            transition: opacity .3s, transform .3s;
        }
        &.is-drop-active{
            background: rgba(0, 0, 0, .05);
            
            &.is-bottom{
                &::before{
                    opacity: 1;
                }
                &::after{
                    opacity: 0;
                }
            }
            &.is-top{
                &::before{
                    opacity: 0;
                }
                &::after{
                    opacity: 1;
                }
            }
            &.is-right{
                &::before{
                        transform: translateX(5%) scaleX(.9);
                }
                &::after{
                    transform: translateX(5%) scaleX(.9);
                }
            }

            &.is-left{
                &::before{
                    transform: none;
                }
                &::after{
                    transform: none;
                }
            }
        }

        &.is-drag-active{
            // border-radius: 5px;
            background: rgba(0, 0, 0, .05);

            &>div{
                opacity: .3;
            }
        }
    }

    .is-sub{
        height: 50%;
        width: .55em;
        border-radius: 6px;
        border: 1px dashed darken(whitesmoke, 25%);
        background: darken(whitesmoke, 5%);
    }
}
</style>