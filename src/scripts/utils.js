import { nextTick, ref, watch } from 'vue'

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
            deep = true,
            valueWatch: valueWatchOptions = {},
            middlewareWatch: middlewareWatchOptions = {},
            debug = false,
        } = options
        let canSetMiddleware = true
        let canEmit = true
        watch(value, val=>{
            if(debug){
                console.warn('watch value(val, canSetMiddleware, canEmit): ', val, canSetMiddleware, canEmit)
            }
            if(canSetMiddleware){
                canEmit = false
                middleware.value = val
                canEmit = true
            }
            if(debug){
                console.warn('after watch value')
            }
        }, {
            deep,
            immediate: true,
            ...valueWatchOptions,
        })
        watch(middleware, val=>{
            // val = JSON.parse(JSON.stringify(val))
            if(debug){
                console.warn('watch middleware(val, canSetMiddleware, canEmit): ', val, canSetMiddleware, canEmit)
            }
            if(canEmit && emit instanceof Function){
                canSetMiddleware = false
                let ret = emit(val, this.awaitChange)
                let nextTickPromise = new Promise(nextTick)
                let promises = [nextTickPromise]
                if(ret instanceof Promise){
                    promises.push(ret)
                }
                Promise.all(promises).finally(()=>{
                    canSetMiddleware = true
                    if(debug){
                        console.warn('after watch middleware, canSetMiddleware: ', canSetMiddleware)
                    }
                })
            }
        }, {
            deep,
            ...middlewareWatchOptions,
        })

        return middleware
    },

    createAsyncComputed(watcher, asyncFunction, initValue, options){
        let ret = ref(initValue)
        watch(watcher, async (val, old, ...rest)=>{
            if(val !== old){
                ret.value = await asyncFunction?.(val, old, ...rest)
            }
        }, {
            immediate: true,
            deep: true,
            ...options
        })
        return ret
    },
    async iterate(datas, childrenKey, func, parent = null){
        if(func instanceof Function){
            for(let i = 0; i < datas.length; ++i){
                let d = datas[i]
                let ret = await func(d, i, datas, parent)
                if(ret !== undefined){
                    return ret
                }else{
                    if(childrenKey instanceof Function){
                        childrenKey = childrenKey(d)
                    }
                    if(d[childrenKey] instanceof Array){
                        ret = await this.iterate(d[childrenKey], childrenKey, func, d)
                        if(ret !== undefined){
                            return ret
                        }
                    }
                }
            }
        }
    },
    async iterateMap(datas, childrenKey, func){
        let ret = []
        await this.iterate(datas, childrenKey, d=>{
            ret.push(func(d))
        })
        return ret
    },
}