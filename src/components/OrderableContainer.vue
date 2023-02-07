<template>
<div
    ref="container"
    v-drop:[channel]
    @drop-drag-start="handleDragStartByDrop"
    @drop-drag-finish="handleEmitChange"
    @drop-drag-move="handleDragMove" class="anfo-drag-container page">
    <transition-group :name="transitionName">
        <div v-drag:[channel]="{
            data,
            i,
        }"
            @drag-finish="handleDragFinish"
            @drag-start="handleDragStart(i)"
            v-for="(data, i) in lDatas"
            :key="getKey(data, lDatas) || i">
            <slot v-bind="{ data, i }"></slot>
        </div>
    </transition-group>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import utils from '@/scripts/utils'

let props = defineProps({
    datas: {
        type: Array,
        default: ()=>[]
    },
    dataKey: {
        type: Function,
        default: d=>d,
    },
    transitionName: {
        type: String,
        default: 'anfo-move-default',
    },
    channel: {
        type: String,
        default: 'anfo-drag-container',
    },
    horizontal: {
        type: Boolean,
        default: false,
    },
    fixed: {
        type: Boolean,
        default: false,
    }
})

let emit = defineEmits(['change', 'update:datas', 'drag-start-by-drop', 'drag-finish-by-drop'])

let container = ref(null)
// let lDatas = ref(props.datas)
// watch(()=>props.datas, val=>lDatas.value = val)
let lDatas = utils.createMiddleware(()=>props.datas)

let lDatasDict = computed(()=>{
    return lDatas.value.reduce((t, d)=>{
        t[getKey(d, lDatas.value)] = d
        return t
    }, {})
})

let draggingInd = ref(-1)

function getKey(data, datas){
    return props.dataKey instanceof Function ? props.dataKey(data, datas) : null
}
function getKeys(datas){
    return [...datas.map(d=>getKey(d, datas))]
}
function getRemovable(...rest){
    return props.removable instanceof Function ? props.removable(...rest) : !!props.removable
}
function getRestoreWhenNoDrop(...rest){
    return props.restoreWhenNoDrop instanceof Function ? props.restoreWhenNoDrop(...rest) : !!props.restoreWhenNoDrop
}

// 更新datas
function getDataIndex(data){
    let dataKey = getKey(data)
    return lDatas.value.findIndex((d, i)=>{
        let key = getKey(d, lDatas.value)
        return key === dataKey
    })
}
function setData(data, i){
    let ind = getDataIndex(data)
    let datas = [...lDatas.value]
    let isNew = false
    if(ind > -1){
        // modified
        datas[ind] = data
    }else{
        // add
        isNew = true
        if(i != null){
            datas.splice(i, 0, data)
        }else{
            datas.push(data)
        }
    }
    // emit('update:datas', datas)
    lDatas.value = datas
    return isNew
}
function removeData(data){
    let ind = getDataIndex(data)
    if(ind > -1){
        let datas = [...lDatas.value]
        datas.splice(ind, 1)
        // emit('update:datas', datas)
        lDatas.value = datas
    }
}

let oldKeys = []
let oldDatas = ref([])
let oldDatasDict = computed(()=>{
    return oldDatas.value.reduce((t, d)=>{
        t[getKey(d, lDatas.value)] = d
        return t
    }, {})
})
function handleDragStartByDrop(){
    oldDatas.value = [...lDatas.value]
    oldKeys = getKeys(lDatas.value)
    emit('drag-start-by-drop')
}
function handleDragStart(i){
    draggingInd.value = i
}
function handleDragFinish(){
    draggingInd.value = -1
}
function emitChange(){
    // 判断是否有改变，触发change
    let keys = getKeys(lDatas.value)
    if(keys.length !== oldKeys.length || keys.findIndex((k, i)=>k !== oldKeys[i]) > -1){
        // 查找出增加的或删除的
        let news = []
        let rms = []
        if(keys.length > oldKeys.length){
            // 查找新增的
            news = keys.filter(k=>!oldKeys.includes(k)).map(k=>lDatasDict.value[k])
        }else if(keys.length < oldKeys.length){
            // 查找删除的
            rms = oldKeys.filter(k=>!keys.includes(k)).map(k=>oldDatasDict.value[k])
        }
        emit('change', lDatas.value, oldDatas.value, news, rms)
    }
}
function handleEmitChange(e){
    // settimeout 是因为drag的finish-with-no-drop 先执行，
    // drga的finish-with-no-drop 里对没drop到的东西进行了restore操作，所以要用settimeout先等它先完成
    setTimeout(()=>{
        emit('update:datas', lDatas.value)
        emit('drag-finish-by-drop')
        emitChange()
    })
}

// 把之前应用的throttle去掉了、因为加了throttle之后这里的调用顺序就出现了问题、导致handleDragFinish先调用
// draggingInd变成了-1，然后handleDragMove 还最后调用了一次 导致增加了一个新元素、
// 如果要加的话需要一个变量标记dragFinish了、再一次的handleDragMove 就不再调用了
let handleDragMove = (e)=>{
    if(!props.fixed){
        let { event, context, offset } = e.data || {}
        let [x, y] = offset || [0, 0]
        let data = context.value.data

        let ind = getDataIndex(data)
        // 这里只进行顺序的调整
        if(ind > -1 && container.value){
            let doms = [...container.value.children]
            let toInd = doms.filter(d=>!!d).map(d=>props.horizontal ? d.offsetLeft : d.offsetTop).findLastIndex(val=>(props.horizontal ? x: y) >= val)
            toInd = toInd === -1 ? 0 : toInd
            if(toInd !== draggingInd.value){
                let datas = [...lDatas.value]
                if(draggingInd.value > -1){
                    datas.splice(draggingInd.value, 1)
                }
                datas.splice(toInd, 0, data)
                lDatas.value = datas
                draggingInd.value = toInd
            }
        }
    }
}
</script>