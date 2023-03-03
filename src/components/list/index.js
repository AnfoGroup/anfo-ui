import ListPagination from './ListPagination'
import ListScroll from './ListScroll'
import Pagination from './Pagination'
import { reactive, computed, watch, defineComponent, h } from 'vue'
import { throttle } from 'throttle-debounce'

export const getUsePagination = appConfig => {
    let {
        list: {
            pagination: {
                paginationComponent = Pagination,
                dataMapper: paginationDataMapper
            } = {},
        } = {}
    } = appConfig || {}

    return (api, options = {})=>{
        let {
            params = {},
            dataMapper,
            immediate = true,
        } = options

        dataMapper = dataMapper || paginationDataMapper || (d=>({ total: d?.total, data: d?.data }))

        async function getParams(){
            return params instanceof Function ? params() : params
        }
        
        let props = {...options}
        delete props.params
        delete props.dataMapper
        delete props.immediate
        let context = reactive({
            data: [],
            total: 0,
            page: 1,
            pageSize: 20,
            isLoading: false,
            totalPage: computed(()=>Math.ceil(context.total / context.pageSize)),

            autoRefresh: true,
            ...props,
            refresh: async () => {
                context.isLoading = true
                let ret = api({
                    page: context.page,
                    pageSize: context.pageSize,
                    ...await getParams(),
                })
                if(!(ret instanceof Promise)){
                    ret = Promise.resolve(ret)
                }
                return ret.finally(()=>{
                    context.isLoading = false
                }).then(dataMapper).then(res=>{
                    context.data = res.data
                    context.total = res.total
                    return res
                })
            }
        })

        watch(()=>context.page, val=>{
            if(context.autoRefresh){
                context.refresh()
            }
        }, {
            immediate,
        })

        return {
            context,
            List: defineComponent((_, ctx)=>{
                return ()=>h(ListPagination, {
                    context,
                }, {
                    default: ctx.slots.default,
                })
            }),
            Pagination: defineComponent(()=>{
                return ()=>h(paginationComponent, {
                    context,
                    'onUpdate:current': page=>context.page = page,
                })
            })
        }
    }
}

export const getUseScroll = appConfig => {
    let {
        list: {
            scroll: {
                dataMapper: scrollDataMapper
            } = {},
        } = {}
    } = appConfig || {}

    return (api, options = {})=>{
        let {
            params = {},
            dataMapper,
            immediate = true,

            scroller,
        } = options

        dataMapper = dataMapper || scrollDataMapper || (d=>d)

        async function getParams(){
            return params instanceof Function ? await params() : params
        }

        async function getScroller(){
            return scroller instanceof Function ? await scroller() : scroller
        }
        
        let props = {...options}
        delete props.params
        delete props.dataMapper
        delete props.immediate

        let page = 1
        let context = reactive({
            data: [],
            pageSize: 20,
            noMoreData: false,
            isLoading: false,

            ...props,
            refresh: async ( reset = false ) => {
                if(reset){
                    page = 1
                    context.noMoreData = false
                }
                if(!context.noMoreData){
                    context.isLoading = true
                    let ret = api({
                        page: page++,
                        pageSize: context.pageSize,
                        ...await getParams(),
                    })
                    if(!(ret instanceof Promise)){
                        ret = Promise.resolve(ret)
                    }
                    return ret.finally(()=>{
                        context.isLoading = false
                    }).then(dataMapper).then(data=>{
                        if(data?.length < context.pageSize){
                            context.noMoreData = true
                        }
                        if(reset){
                            context.data = data
                        }else{
                            context.data.push(...data)
                        }
                        return data
                    })
                }else{
                    console.debug('scroll list request: no more data')
                }
            }
        })

        if(immediate){
            context.refresh()
        }
        
        getScroller().then(val=>{
            if(val){
                val.addEventListener('scroll', throttle(1000, e=>{
                    if(!context.isLoading){
                        let { target } = e
                        if(target === document){
                            target = target.documentElement
                        }
                        if(target.scrollTop + target.clientHeight >= target.scrollHeight - 10){
                            context.refresh()
                        }
                    }
                }))
            }
            context.hasScroller = !!val
        })

        return {
            context,
            List: defineComponent((_, ctx)=>{
                return ()=>h(ListScroll, {
                    context,
                }, {
                    default: ctx.slots.default,
                    'request-more-data': ctx.slots['request-more-data']
                })
            }),
        }
    }
}