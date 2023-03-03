<template>
    <div class="list-pagination v-xs">
        <!-- context.totalPage是个computed，此处通过props传进来后不会自动解value，所以需要.value -->
        <!-- <a-pagination v-if="context?.totalPage?.value > 1" size="small" v-model:current="context.data.page" v-model:pageSize="context.data.pageSize" :total="context.data.total"></a-pagination> -->
        <!-- {{$slots.pagination && $slots.pagination()}} -->
        <transition :name="transitionName" appear>
            <slot v-if="$slots.pagination" :Pagination="$anfoUIListPagination" name="pagination" :context="context" :total-page="context?.totalPage?.value" :current="context.data.page" :pageSize="context?.data?.pageSize" :total="context?.data?.total"></slot>
            <component :is="$anfoUIListPagination" v-else-if="$anfoUIListPagination && context?.totalPage?.value > 1" v-model:current="context.data.page" v-model:pageSize="context.data.pageSize" :total="context.data.total" />
        </transition>
        <!-- <component v-else-if="$anfoUIListPagination" :is="$anfoUIListPagination" :context="context" :total-page="context?.totalPage?.value" v-model:current="context.data.page" v-model:pageSize="context.data.pageSize" :total="context?.data?.total" /> -->
        <div v-loading="context?.data?.isLoading">
            <transition :name="transitionName" mode="out-in" appear>
                <div v-if="context?.data?.datas?.length === 0 && noDataText" class="desc">{{noDataText}}</div>
                <template v-else>
                    <slot :key="context.data.page || -1"
                        v-if="$slots.list" name="list" v-bind="{
                        datas: context?.data?.datas,
                        context,
                    }"></slot>
                    <div v-else :key="context.data.page || -1" :class="containerClass" :style="containerStyle">
                        <slot v-for="(item, i) in context?.data?.datas"
                        :key="!dataKey?i:(typeof dataKey === 'string'?(item?.[dataKey]):(dataKey?.(item)))"
                        :item="item" :i="i"></slot>
                    </div>
                </template>
            </transition>
        </div>
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
        containerStyle: String,
        containerClass: String,
        noDataText: String,
        dataKey: {
            type: [String, Function],
            default: null,
        },
        transitionName: {
            type: String,
            default: 'anfo-fade',
        }
    },
    setup(props){
        let { context } = props
        let { data, refreshDatas } = context
        watch(()=>data?.page, ()=>{
            refreshDatas?.()
        })
    }
}
</script>

<style lang="scss" scoped>
.list-pagination{
    .desc{
        color: #999;
        // font-size: .8em;
    }
}
</style>