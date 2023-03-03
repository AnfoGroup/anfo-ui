<template>
    <div v-loading="context.isLoading">
        <transition :name="transitionName" mode="out-in" appear>
            <div v-if="context?.data?.length === 0 && noDataText" class="desc">{{noDataText}}</div>
            <slot v-else :key="context.page" v-bind="{
                data: context?.data || [],
                context,
            }"></slot>
        </transition>
    </div>
</template>

<script setup>
let props = defineProps({
    context: Object,
    noDataText: String,
    dataKey: {
        type: [String, Function],
        default: null,
    },
    transitionName: {
        type: String,
        default: 'anfo-fade',
    }
})
</script>