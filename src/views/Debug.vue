<template>
    <div class="v-m p-l">
        <h1>AnfoUI</h1>
        <div>
            <anfo-grid :datas="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" min-size="100px">
                <template #="{item}">
                    <div>
                        {{ item }}
                    </div>
                </template>
            </anfo-grid>
        </div>

<anfo-orderable-container is-leavable is-enterable v-model:datas="exDatas" class="v-m">
    <template #="data">
        <div class="h justify-center" :style="{width: '50px',height: '50px', background: 'lightgray',borderRadius: '5px'}">
            {{ data.data }}
        </div>
    </template>
</anfo-orderable-container>

<anfo-orderable-container :datas="[4, 5, 6]" class="h-s" is-enterable is-horizontal is-leavable>
    <template #="data">
        <div class="h justify-center" :style="{width: '50px',height: '50px', background: 'yellow',borderRadius: '5px'}">
            {{ data.data }}
        </div>
    </template>
</anfo-orderable-container>

        <anfo-tree v-model:datas="treeDatas" :data-key="d=>d?.label">
            <template #="{ item }">
                <div>
                    {{ item.label }}
                </div>
            </template>
        </anfo-tree>
        
        <anfo-spin></anfo-spin>
        <anfo-list-pagination :context="paginationContext">
            <template #="{ item }">
                <div>{{ item }}</div>
            </template>
        </anfo-list-pagination>

        <anfo-list-scroll :context="scrollContext">
            <template #="data">
                <div>{{ data }}</div>
            </template>
            <template #request-more-data="{ request }">
                <div @click="request" class="title clickable">request more data</div>
            </template>
        </anfo-list-scroll>

        <anfo-resize-container>
            <template #="{ width, height }">
                width : {{ width }}
                height: {{ height }}</template>
        </anfo-resize-container>
        <div style="width: 300px">
            <anfo-scroll-container style="height: 200px;border-radius: 5px;background: whitesmoke" :duration="3000"
                :segs="[.1, .5]">
                <template #="{ progress, progressInSeg, seg }">
                    <div class="p-l ch ch-s cc1shrink-0 cc1width-104 cc0f-1 cc1title">
                        <div>
                            <div>progress</div>
                            <div>{{ progress.toFixed(2) }}</div>
                        </div>
                        <div>
                            <div>progressInSeg</div>
                            <div>{{ progressInSeg.toFixed(2) }}</div>
                        </div>
                        <div>
                            <div>seg</div>
                            <div>{{ seg }}</div>
                        </div>
                    </div>
                </template>
            </anfo-scroll-container>

            <!-- <anfo-orderable-container v-model:datas="datas" :data-key="d => d.a">
                <template #="item">{{ item }}</template>
            </anfo-orderable-container>
            <anfo-orderable-container v-model:datas="datas2" :data-key="d => d.a">
                <template #="item">{{ item }}</template>
            </anfo-orderable-container> -->

            <anfo-loop :datas="treeDatas" :data-key="d => d.label">
                <template #="{ item }">
                    <div @click="item.label = Math.random()">
                        {{ item.label }}
                    </div>
                </template>
            </anfo-loop>

            <div style="width: 300px;height: 200px" class="h justify-center" v-loading="isLoading">
                <div style="width: 100px;height: 100px;background: red"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useList, utils } from '@/index'
import { reactive, ref } from 'vue'

let list = useList()
let paginationContext = list.pagination.createContext({
  props: {
    pageSize: 3,
  },
  api: ()=>({
    total: 30,
    data: [1, 2, 3],
  })
})

paginationContext.refreshDatas()

let scrollContext = list.scroll.createContext({
  props: {
    pageSize: 4,
  },
  api: ()=>[1, 2, 3, 4],
})
scrollContext.refreshDatas()

let exDatas = ref([1, 2, 3])
let datas = ref([{a: 1}, {a: 2}, {a: 3}, {a: 4}])
let datas2 = utils.createMiddleware(datas, async val=>{await new Promise(r=>setTimeout(r, 1000));datas.value = val}, )

setTimeout(()=>datas2.value[1].a = 100, 1000)
setTimeout(()=>datas.value[2].a = 99999, 2000)

let treeDatas = ref([{
  label: 'hello',
  children: [{
    label: 'test'
  }, {
    label: 'equal',
    children: [{
        label: '11'
    },{
        label: 'd22'
    },{
        label: '33'
    },{
        label: '44'
    },]
  }],
}, {
  label: 'hello2'
}])

let isLoading = ref(true)

setInterval(()=>isLoading.value = !isLoading.value, 1000)
</script>