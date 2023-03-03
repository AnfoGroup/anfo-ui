<template>
    <div  class="list-scroll v-xs">
        <transition-group :name="transitionName" appear>
            <slot v-if="context.data?.length > 0" v-bind="{
                data: context.data,
                context,
            }"></slot>
            <div v-else-if="noDataText">{{noDataText}}</div>
            <slot :request="()=>context.refresh()" v-if="$slots['request-more-data']" name="request-more-data"></slot>
            <div v-else-if="!context.noMoreData && !context.hasScroller" @click="context.refresh()" class="clickable">{{ requestMoreDataDesc }}</div>
        </transition-group>
    </div>
</template>

<script>
export default {
    props: {
        context: {
            type: Object,
            default: ()=>({})
        },
        noDataText: {
            type: String,
            default: ''
        },
        requestMoreDataDesc: {
            type: String,
            default: '点击加载更多',
        },
        transitionName: {
            type: String,
            default: 'anfo-fade',
        }
    },
}
</script>