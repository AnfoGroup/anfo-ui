import ListPaginationComponent from '@/components/ListPagination'
import ListScrollComponent from '@/components/ListScroll'
import ScrollContainerComponent from '@/components/ScrollContainer'
import OrderableContainerComponent from '@/components/OrderableContainer'
import ResizeContainerComponent from '@/components/ResizeContainer'
import SpinComponent from '@/components/Spin'
import LoopComponent from '@/components/Loop'
import TreeComponent from '@/components/Tree'
import GridComponent from '@/components/Grid'
import TransitionFocusComponent from '@/components/transitions/Focus'
import { getUsePagination, getUseScroll } from '@/components/list'

import Pagination from '@/components/Pagination'

import createListUtils from '@/scripts/list'
import utilsScript from '@/scripts/utils'
// let utilsScript = {}
import loadingDirective from '@/directives/loading'
import dragDirective from '@/directives/drag'
import moveDirective from '@/directives/move'
import focusDirective from '@/directives/focus'

import '@/styles/utils.scss'

import { getCurrentInstance } from 'vue'

let anfoUI = {
    /* config
    {
        // loading 指令使用的loadingIcon
        {
            icon: Component
        }
        loading,

        // list
            pagination: {
                // 分页组件
                paginationComponent: Component,
                // 获取数据的mapper
                // return {
                    data: Array,
                    total: Number,
                }
                dataMapper: Function,
            },
            scroll: {
                // 获取数据的mapper
                // return: Array
                dataMapper: Function
            }
            paginationComponent: Component,
            paginationDataMapper
        list,
    }
    */
    install( app, config = {} ){
        let {
            loading: { icon: loadingIcon } = {},
            loading,
            list: {
                scroll: {
                    dataMapper: scrollDataMapper
                } = {},
                scroll: scrollList,
                pagination: {
                    paginationComponent,
                    dataMapper: paginationDataMapper
                } = {},
                pagination: paginationList,
            } = {}
        } = config || {}

        function component(name, com){
            app.component(`anfo-${name}`, com)
        }
        component('list-pagination', ListPaginationComponent)
        component('list-scroll', ListScrollComponent)
        component('scroll-container', ScrollContainerComponent)
        component('orderable-container', OrderableContainerComponent)
        component('resize-container', ResizeContainerComponent)
        component('spin', SpinComponent)
        component('loop', LoopComponent)
        component('tree', TreeComponent)
        component('grid', GridComponent)
        component('transition-focus', TransitionFocusComponent)

        app.use(loadingDirective, { loadingIcon })
        app.use(dragDirective)
        app.use(moveDirective)
        app.use(focusDirective)
        
        app.config.globalProperties.$anfoUI = anfoUI
        app.config.globalProperties.$anfoUIConfig = anfoUI
        // 给ListPagination组件引用
        app.config.globalProperties.$anfoUIListPagination = paginationComponent || Pagination

        let listUtils = createListUtils({ dataMapper: {
            pagination: paginationDataMapper,
            scroll: scrollDataMapper,
        } })

        app.config.globalProperties.$anfoList = listUtils
        app.config.globalProperties.$anfoUtils = utilsScript
        app.config.globalProperties.$anfoUsePagination = getUsePagination(config)
        app.config.globalProperties.$anfoUseScroll = getUseScroll(config)
    },

    ListPagination: ListPaginationComponent,
    ListScroll: ListScrollComponent,
    OrderableContainer: OrderableContainerComponent,
    ResizeContainer: ResizeContainerComponent,
    ScrollContainer: ScrollContainerComponent,
    Spin: SpinComponent,
    Loop: LoopComponent,
    Tree: TreeComponent,
    Grid: GridComponent,
    TransitionFocus: TransitionFocusComponent,

    usePagination(...rest){
        let instance = getCurrentInstance()
        return instance.appContext.config.globalProperties.$anfoUsePagination(...rest)
    },
    useScroll(...rest){
        let instance = getCurrentInstance()
        return instance.appContext.config.globalProperties.$anfoUseScroll(...rest)
    },
    useList(){
        let instance = getCurrentInstance()
        return instance.appContext.config.globalProperties.$anfoList
    },
    utils: utilsScript,
    ...utilsScript,
}

export default anfoUI
export const install = anfoUI.install
export const ListPagination = anfoUI.ListPagination
export const ListScroll = anfoUI.ListScroll
export const OrderableContainer = anfoUI.OrderableContainer
export const ScrollContainer = anfoUI.ScrollContainer
export const Spin = anfoUI.Spin
export const Loop = anfoUI.Loop
export const Tree = anfoUI.Tree
export const Grid = anfoUI.Grid
export const TransitionFocus = anfoUI.TransitionFocus
export const useList = anfoUI.useList
export const usePagination = anfoUI.usePagination
export const useScroll = anfoUI.useScroll
export const utils = utilsScript