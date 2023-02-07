<template>
    <div  class="list-scroll v-xs">
        <slot name="list" v-bind="{
            datas: context?.data?.datas,
            context,
        }"></slot>
        <div :class="containerClass" :style="containerStyle">
            <slot v-for="(item, i) in context?.data?.datas"
                :key="!dataKey?i:(typeof dataKey === 'string'?(item?.[dataKey]):(dataKey?.(item)))" :item="item" :i="i"></slot>
        </div>
        <div v-if="noDataText && context?.data?.datas?.length === 0" class='desc'>{{noDataText}}</div>
        <slot :request="()=>context?.refreshDatas?.()" v-if="$slots['request-more-data']" name="request-more-data"></slot>
        <div v-else-if="!context?.data?.noMoreData" @click="context?.refreshDatas()" class="desc clickable">{{ requestMoreDataDesc }}</div>
        <!-- <div v-else class="desc">没有更多数据啦</div> -->
    </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
    props: {
        context: {
            type: Object,
            default: ()=>({})
        },
        containerClass: String,
        containerStyle: String,
        noDataText: {
            type: String,
            default: ''
        },
        dataKey: {
            type: [String, Function],
            default: null,
        },
        requestMoreDataDesc: {
            type: String,
            default: '点击加载更多',
        }
    },
    setup(props){
        let { context } = props

        let { data, refreshDatas } = context

        // refreshDatas?.({reset: true})
        return {
            context,
        }
    }
}
</script>

<style lang="scss" scoped>
.list-scroll{
    .desc{
        color: #999;
        // font-size: .8em;
    }
}
</style>