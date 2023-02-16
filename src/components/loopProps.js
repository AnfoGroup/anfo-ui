export default {
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
        default: 'anfo-move-default',
    },

    // islast 内部使用，类似layer，不需要传入，表示迭代的最后一层
    isLast: Boolean,
    // parent
    parent: Object,
}