import ListPaginationComponent from '@/components/ListPagination'
import ListScrollComponent from '@/components/ListScroll'
import ScrollContainerComponent from '@/components/ScrollContainer'
import OrderableContainerComponent from '@/components/OrderableContainer'
import ResizeContainerComponent from '@/components/ResizeContainer'
import SpinComponent from '@/components/Spin'
import LoopComponent from '@/components/Loop'

import createListUtils from '@/scripts/list'
import utilsScript from '@/scripts/utils'
// let utilsScript = {}
import loadingDirective from '@/directives/loading'
import dragDirective from '@/directives/drag'
import moveDirective from '@/directives/move'

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

        let { loading, list } = config || {}
        let { icon: loadingIcon } = loading || {}
        let { pagination: paginationList, scroll: scrollList } = list || {}
        let { paginationComponent, dataMapper: paginationDataMapper } = paginationList || {}
        let { dataMapper: scrollDataMapper } = scrollList || {}

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

        app.use(loadingDirective, { loadingIcon })
        app.use(dragDirective)
        app.use(moveDirective)
        
        app.config.globalProperties.$anfoUI = anfoUI
        app.config.globalProperties.$anfoUIConfig = anfoUI
        // 给ListPagination组件引用
        app.config.globalProperties.$anfoUIListPagination = paginationComponent

        let listUtils = createListUtils({ dataMapper: {
            pagination: paginationDataMapper,
            scroll: scrollDataMapper,
        } })
        app.config.globalProperties.$anfoList = listUtils
        app.config.globalProperties.$anfoUtils = utilsScript
    },

    ListPagination: ListPaginationComponent,
    ListScroll: ListScrollComponent,
    OrderableContainer: OrderableContainerComponent,
    ResizeContainer: ResizeContainerComponent,
    ScrollContainer: ScrollContainerComponent,
    Spin: SpinComponent,
    Loop: LoopComponent,

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
export const useList = anfoUI.useList
export const utils = utilsScript