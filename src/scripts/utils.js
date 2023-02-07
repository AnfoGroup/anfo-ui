import { ref, watch } from 'vue'

export default {

    async awaitChange(value, beforeWatch, options = {}){
        if(beforeWatch instanceof Function){
            let ret = beforeWatch(...arguments)
            if(ret instanceof Promise){
                await ret
            }
        }
        return new Promise(r=>{
            watch(value, r, {
                deep: true,
                ...options,
            })
        })
    },

    createMiddleware(value, emit, options = {}){
        let middleware = ref(null)
        let {
            valueWatch: valueWatchOptions = {},
            middlewareWatch: middlewareWatchOptions = {},
        } = options

        let canSetMiddleware = true
        let canEmit = true
        watch(value, val=>{
            if(canSetMiddleware){
                canEmit = false
                middleware.value = val
                canEmit = true
            }
        }, {
            deep: true,
            immediate: true,
            ...valueWatchOptions,
        })
        watch(middleware, val=>{
            if(canEmit && emit instanceof Function){
                canSetMiddleware = false
                let ret = emit(val, this.awaitChange)
                if(ret instanceof Promise){
                    ret.finally(()=>{
                        canSetMiddleware = true
                    })
                }else{
                    canSetMiddleware = true
                }
            }
        }, {
            deep: true,
            ...middlewareWatchOptions,
        })

        return middleware
    },

    createAsyncComputed(watcher, asyncFunction, initValue, options){
        let ret = ref(initValue)
        watch(watcher, async ()=>{
            ret.value = await asyncFunction?.()
        }, {
            immediate: true,
            ...options
        })
        return ret
    },
}