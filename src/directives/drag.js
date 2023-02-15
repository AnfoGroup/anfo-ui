import EventEmitter from 'events'
import shortid from 'shortid'

let dropContexts = []
// 待删除队列、延迟删除是因为直接删除会导致v-drag附着元素unmount后事件不再响应
// let dropContextsDeleteMap = {}
let dragContextsDeleteMap = {}

function getOffset(el, attr){
    let value = 0
    do{
        value += el[attr]
    }while(el = el.offsetParent)
    return value
}
function getScreenOffsetLeft(el){
    // return getOffset(el, 'offsetLeft')
    // let rect = el.getBoundingClientRect()
}
function getScreenOffsetTop(el){
    // return getOffset(el, 'offsetTop')
}

function isPointInRect(point, rect){
    let x = rect[0]
    let y = rect[1]
    let width = rect[2]
    let height = rect[3]
    let px = point[0]
    let py = point[1]
    return px >= x && px <= x + width
        && py >= y && py <= y + height
}

function dispatchEvent(vnode, name, data = {}){
    let event = new Event(name)
    event.data = data
    event.getData = key=>key !== undefined ? data?.[key] : data
    // event.getValue = key=>key !== undefined ? value?.[key] : value
    event.getContext = ()=>event.getData()?.context
    event.getValue = key=>key !== undefined ? event.getContext()?.value?.[key] : event.getContext()?.value
    vnode.el.dispatchEvent(event)
}

let dragContexts = {}


// drags events
const EVENT_DRAG_START = 'drag-start'
// const EVENT_DRAG_END = 'drag-end'
const EVENT_DRAG_LEAVE = 'drag-leave'
const EVENT_DRAG_ENTER = 'drag-enter'
// const EVENT_DRAG_MOVE = 'drag-move'
const EVENT_DRAG_FINISH_WITH_DROP = 'drag-finish-with-drop'
const EVENT_DRAG_FINISH = 'drag-finish'
const EVENT_DRAG_FINISH_WITH_NO_DROP = 'drag-finish-with-no-drop'

// drops events
const EVENT_DROP_DRAG_START = 'drop-drag-start'
const EVENT_DROP_DRAG_LEAVE = 'drop-drag-leave'
const EVENT_DROP_DRAG_ENTER = 'drop-drag-enter'
const EVENT_DROP_DRAG_MOVE = 'drop-drag-move'
const EVENT_DROP_DRAG_FINISH_WITH_DROP = 'drop-drag-finish-with-drop'
const EVENT_DROP_DRAG_FINISH = 'drop-drag-finish'
const EVENT_DROP_DRAG_FINISH_WITH_NO_DROP = 'drop-drag-finish-with-no-drop'
const EVENT_DROP_ACTIVE = 'drop-active'
const EVENT_DROP_DISACTIVE = 'drop-disactive'

const EVENT_CLICK = 'click'

// 记录触发mousemove事件的数量与该阈值对比
const clickThreshold = 5

function createDragContext(el, { value, oldValue, arg, modifiers, instance, dir }, vnode, prevVnode){
    let id = shortid.generate()
    let context = {
        id,
        el,
        ...createNewElements(el),
        channel: arg,
        value,
        event: new EventEmitter,
    }
    dragContexts[id] = context


    context.handleMouseDown = e=>{
        if(e.button === 0){
            context._bubbleClickEvent = false
            context._isMouseDown = true
            let { el, newEl, channel, event } = context || {}
            newEl.remove()
            Object.assign(context, createNewElements(el))
            context._mouseMoveCount = 0
            context._mouseEvent = e
            let rect = el.getBoundingClientRect()
            context._currentX = rect.left
            context._currentY = rect.top
            // context._currentX = getScreenOffsetLeft(el)
            // context._currentY = getScreenOffsetTop(el)
            // 记录当前el的屏幕xy
            Object.assign(newEl.style, {
                top: `${context._currentY}px`,
                left: `${context._currentX}px`
            })
            // event.emit(EVENT_DRAG_START)
            // dropContexts.filter(d=>d.channel === channel).forEach(d=>d.event.emit(EVENT_DRAG_START, context))
            
            let dragRefPosition = [e.clientX, e.clientY]
            let ds = dragDirective.getDroppables(dragRefPosition, channel)
            ds.in.forEach(d=>d._isEnter = true)
            e.stopPropagation()
        }
    }
    context.handleMouseMove = e=>{
        let { newEl, opacityWrapper, channel, event } = context || {}
        
        if(context._isMouseDown){
            if(!newEl.parentElement){
                if(context._mouseMoveCount < clickThreshold){
                    context._mouseMoveCount += 1
                }else{
                    event.emit(EVENT_DRAG_START, {
                        event: e,
                        context
                    })
                    dropContexts.filter(d=>d.channel === channel).forEach(d=>d.event.emit(EVENT_DROP_DRAG_START, {
                        event: e,
                        context
                    }))
                    document.querySelector('body').appendChild(newEl)

                    // 确保transition能运转
                    requestAnimationFrame(()=>requestAnimationFrame(()=>{
                        // opacityWrapper.style.opacity = .6
                    }))
                }
            }
            if(newEl.parentElement){
                // 使用鼠标位置作为参考
                let dragRefPosition = [e.clientX, e.clientY]
                let drops = dragDirective.getDroppables(dragRefPosition, channel)
                context.time = Date.now()
                drops.in.forEach(d=>{
                    // 提供dragelement 相对于drop元素的相对位置
                    // let dropElement = d.el
                    // let rect = dropElement.getBoundingClientRect()
                    // let dropPosition = [
                    //     rect.left,
                    //     rect.top,
                    // ]
                    // let offset = [dragRefPosition[0] - dropPosition[0], dragRefPosition[1] - dropPosition[1]] 
                    if(!d._isEnter){
                        d.event.emit(EVENT_DROP_DRAG_ENTER, {
                            event: e,
                            context,
                            offset: d.offset,
                        })
                        d._isEnter = true
                    }
                    if(!d._isDropActive){
                        d.event.emit(EVENT_DROP_ACTIVE, {
                            event: e,
                            context
                        })
                        d._isDropActive = true
                    }

                    d.event.emit(EVENT_DROP_DRAG_MOVE, {
                        event: e,
                        dropContext: d,
                        context,
                        offset: d.offset,
                    })
                })
                drops.out.forEach(d=>{
                    if(d._isEnter){
                        d.event.emit(EVENT_DROP_DRAG_LEAVE, {
                            event: e,
                            context
                        })
                        d._isEnter = false
                    }
                    if(d._isDropActive){
                        d.event.emit(EVENT_DROP_DISACTIVE, {
                            event: e,
                            context,
                        })
                        d._isDropActive = false
                    }
                })
                
                if(context._enterContexts?.length > 0){
                    // 查找和上次的对比，查找_enterContexts与上次哪里不同
                    let enterContexts = drops.in
                    let enterContextsIds = enterContexts.map(d=>d.id)
                    let _enterContextsIds = context._enterContexts.map(d=>d.id)
                    let enterDiff = enterContextsIds.filter(d=>!_enterContextsIds.includes(d))
                    if(enterDiff.length > 0){
                        event.emit(EVENT_DRAG_ENTER, {
                            event: e, 
                            drops: enterDiff.map(d=>enterContexts.find(c=>c.id === d)),
                        })
                        context._enterContexts = enterContexts
                    }
                    let leaveDiff = _enterContextsIds.filter(d=>!enterContextsIds.includes(d))
                    if(leaveDiff.length > 0){
                        event.emit(EVENT_DRAG_LEAVE, {
                            event: e,
                            drops: leaveDiff.map(d=>context._enterContexts.find(c=>c.id === d)),
                            context,
                        })
                        context._enterContexts = enterContexts
                    }
                }else{
                    if(drops.in.length > 0){
                        event.emit(EVENT_DRAG_ENTER, {
                            event: e, 
                            drops: drops.in,
                        })
                    }
                }
                context._enterContexts = drops.in
                context._currentX += (e.pageX - context._mouseEvent.pageX)
                context._currentY += (e.pageY - context._mouseEvent.pageY)
                Object.assign(newEl.style, {
                    left: `${context._currentX}px`,
                    top: `${context._currentY}px`,
                })
                context._mouseEvent = e
            }
        }
    }

    context.handleMouseUp = e=>{
        if(e.button === 0){
            let { newEl, channel, event } = context || {}
            if(context._isMouseDown){
                context._isMouseDown = false
                
                if(context._mouseMoveCount < clickThreshold){
                    // event.emit(EVENT_CLICK, e)
                    context._bubbleClickEvent = true
                }else{
                    let dragRefPosition = [e.clientX, e.clientY]
                    let drops = dragDirective.getDroppables(dragRefPosition, channel)
                    drops.in.forEach(d=>{
                        d.event.emit(EVENT_DROP_DRAG_FINISH_WITH_DROP, {
                            event,
                            context,
                            dropContext: d,
                            offset: d.offset,
                        })
                    })
                    dropContexts.filter(d=>d.channel === channel).forEach(d=>{
                        d.event.emit(EVENT_DROP_DRAG_FINISH, {
                            event,
                            context,
                            dropContext: d,
                            offset: d.offset,
                        })
                        delete d._isDropActive
                    })
                    dropContexts.filter(d=>d.channel === channel && !drops.in.includes(d)).forEach(d=>{
                        d.event.emit(EVENT_DROP_DRAG_FINISH_WITH_NO_DROP, {
                            event,
                            context,
                            dropContext: d,
                            offset: d.offset,
                        })
                    })
                    let finishType = drops.in.length > 0 ? EVENT_DRAG_FINISH_WITH_DROP : EVENT_DRAG_FINISH_WITH_NO_DROP
                    let finishParams = finishType === EVENT_DRAG_FINISH_WITH_DROP ? {event, drops, context} : { event, context }
                    event.emit(finishType, finishParams)
                    dropContexts.filter(d=>d.channel === channel).forEach(d=>{
                        d.event.emit(EVENT_DROP_DRAG_FINISH_WITH_NO_DROP, {event, context})
                    })
                    event.emit(EVENT_DRAG_FINISH_WITH_NO_DROP, {event, context})
                    event.emit(EVENT_DRAG_FINISH, {event, context})
                    newEl.remove()
                }
                Object.keys(dragContextsDeleteMap).forEach(id=>{
                    dragDirective.destroyContext(id)
                })
                dragContextsDeleteMap = {}
                // Object.keys(dropContextsDeleteMap).forEach(id=>{
                //     dropDirective.destroyContext(id)
                // })
                // dropContextsDeleteMap = {}
            }
            // resetall
            dropContexts.filter(d=>d.channel === channel).forEach(d=>{
                if(d._isEnter){
                    d._isEnter = false
                }
                if(d._isDropActive){
                    d.event.emit(EVENT_DROP_DISACTIVE, {event, context})
                    d._isDropActive = false
                }
            })
            context._mouseEvent = null
            context._mouseMoveCount = 0
        }
    }
    // 在拖拽时右键菜单不响应
    context.handleContextMenu = e=>{
        if(context._isMouseDown){
            e.preventDefault()
            e.stopPropagation()
        }
    }
    context.handleClickCapture = e=>{
        if(context._bubbleClickEvent){

        }else{
            e.stopPropagation()
        }
    }

    return context
}
function createNewElements(el){
    let newEl = document.createElement('div')
    let opacityWrapper = document.createElement('div')
    let entityEl = el.cloneNode(true)
    opacityWrapper.appendChild(entityEl)
    newEl.appendChild(opacityWrapper)
    // 将enter-from leave-to类去掉，因为如果有设置动画 就会将动画的类带上造成样式问题，这两个类通常表示消失的类
    let classListShouldBeRemoved = [...entityEl.classList].filter(c=>/(-enter-from)|(-leave-to)|(-enter-active)|(-leave-active)/.test(c))
    if(classListShouldBeRemoved){
        classListShouldBeRemoved.forEach(c=>entityEl.classList.remove(c))
    }

    Object.assign(newEl.style, {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 99999,
    })
    Object.assign(opacityWrapper.style, {
        transition: 'all 1s',
    })
    return {
        newEl,
        opacityWrapper,
        entityEl,
    }
}
function removeContext(id){
    delete dragContexts[id]
}
function getContext(id){
    return dragContexts[id]
}
function getDropContext(id){
    return dropContexts.find(d=>d.id === id)
}

let dragDirective = {
    getDroppables(position, channel,){
        let ins = []
        let out = []
        dropContexts.filter(d=>d.channel === channel).forEach(d=>{
            let dropElement = d.el
            let rect = dropElement.getBoundingClientRect()
            let x = rect.left
            let y = rect.top
            let width = dropElement.offsetWidth
            let height = dropElement.offsetHeight
            d.offset = [position[0] - x, position[1] - y]
            // 取中心点
            if(isPointInRect(position, [x, y, width, height])){
                ins.push(d)
            }else{
                out.push(d)
            }
        })

        // ins 里需要对父子关系的drop容器进行处理，只响应子元素
        // 父元素往子元素移动需要添加 leave事件，添加到out数组
        function isParent(child, parent){
            if(!child.parentElement){
                return false
            }
            if(child.parentElement !== parent){
                return isParent(child.parentElement, parent)
            }else{
                return true
            }
        }
        let finalIns = []
        for(let i = 0; i < ins.length; ++i){
            let inContext = ins[i]
            let isElParent = false
            for(let j = 0; j < ins.length; ++j){
                let oEl = ins[j].el
                if(j !== i){
                    if(isParent(oEl, inContext.el)){
                        isElParent = true
                        break
                    }
                }
            }
            if(!isElParent){
                finalIns.push(inContext)
            }else{
                out.push(inContext)
            }
        }
        return {
            in: finalIns,
            out,
        }
    },

    updated(el, { value }){
        let context = getContext(el.dragContextID)
        if(context){
            context.value = value
        }
    },

    mounted(el, { value, oldValue, arg, modifiers, instance, dir }, vnode, prevVnode){
        // 添加不可选取
        el.style.userSelect = 'none'
        el.style.webkitUserSelect = 'none'

        let context = createDragContext(...arguments)
        // newEl 会改变、所以mounted的context需要context.newEl来引用newEl
        let {  event, } = context || {}
        let {
            classes = {}
        } = value || {}

        classes = Object.assign({
            active: 'is-drag-active',
            droppable: 'is-drag-droppable',
        }, classes)

        let dispatch = (name, data)=>dispatchEvent(vnode, name, data)

        event.on(EVENT_DRAG_ENTER, (...rest)=>{
            context.newEl.classList.add(classes.droppable)
            dispatch(EVENT_DRAG_ENTER, ...rest)
        })
        event.on(EVENT_DRAG_LEAVE, (...rest)=>{
            context.newEl.classList.remove(classes.droppable)
            dispatch(EVENT_DRAG_LEAVE, ...rest)
        })

        event.on(EVENT_DRAG_START, (...rest)=>{
            el.classList.add(classes.active)
            context.newEl.classList.add(classes.active)
            dispatch(EVENT_DRAG_START, ...rest)
        })
        event.on(EVENT_DRAG_FINISH, (...rest)=>{
            el.classList.remove(classes.active)
            context.newEl.classList.remove(classes.active)
            dispatch(EVENT_DRAG_FINISH, ...rest)
        })
        event.on(EVENT_DRAG_FINISH_WITH_NO_DROP, (...rest)=>{
            dispatch(EVENT_DRAG_FINISH_WITH_NO_DROP, ...rest)
        })
        event.on(EVENT_DRAG_FINISH_WITH_DROP, (...rest)=>{
            dispatch(EVENT_DRAG_FINISH_WITH_DROP, ...rest)
        })
        // event.on(EVENT_CLICK, e=>{
        // })
        el.dragContextID = context.id
        el.addEventListener('mousedown', context.handleMouseDown)
        el.addEventListener('click', context.handleClickCapture, true)
        document.addEventListener('mousemove', context.handleMouseMove)
        document.addEventListener('mouseup', context.handleMouseUp)
        document.addEventListener('contextmenu', context.handleContextMenu, true)
    },

    beforeUnmount(el){
        dragContextsDeleteMap[el.dragContextID] = true    
    },

    destroyContext(dragContextID){
        let context = getContext(dragContextID)
        if(context){
            let el = context.el
            el.removeEventListener('mousedown', context.handleMouseDown)
            el.removeEventListener('click', context.handleClickCapture)
            document.removeEventListener('mousemove', context.handleMouseMove)
            document.removeEventListener('mouseup', context.handleMouseUp)
            document.removeEventListener('context', context.handleMouseContext)
            document.removeEventListener('contextmenu', context.handleContextMenu)
            removeContext(dragContextID)
        }
    },
}

function createDropContext(el, { value, oldValue, arg: channel, modifiers, instance, dir }, vnode, prevVnode){
    let context = {
        el,
        channel,
        value,
    }
    let id = shortid.generate()
    context.id = id
    return context
}

let dropDirective = {
    updated(el, { value }){
        let context = getDropContext(el.dropContextID)
        if(context){
            context.value = value
        }
    },

    mounted(el, { value, oldValue, arg, modifiers, instance, dir }, vnode, prevVnode){
        // ctx[arg] = 
        let e = new EventEmitter
        let {
            classes = {},
        } = value || {}

        classes = Object.assign({
            active: 'is-drop-active',
        }, classes)

        let dispatch = (name, data)=>dispatchEvent(vnode, name, data)

        e.on(EVENT_DROP_DRAG_START, (...rest)=>{
            dispatch(EVENT_DROP_DRAG_START, ...rest)
        })

        e.on(EVENT_DROP_DRAG_ENTER, (...rest)=>{
            dispatch(EVENT_DROP_DRAG_ENTER, ...rest)
        })
        
        e.on(EVENT_DROP_DRAG_LEAVE, (...rest)=>{
            dispatch(EVENT_DROP_DRAG_LEAVE, ...rest)
        })

        e.on(EVENT_DROP_DRAG_FINISH_WITH_DROP, (...rest)=>{
            dispatch(EVENT_DROP_DRAG_FINISH_WITH_DROP, ...rest)
        })

        e.on(EVENT_DROP_DRAG_FINISH, (...rest)=>{
            el.classList.remove(classes.active)
            dispatch(EVENT_DROP_DRAG_FINISH, ...rest)
        })
        e.on(EVENT_DROP_DRAG_FINISH_WITH_NO_DROP, (...rest)=>{
            dispatch(EVENT_DROP_DRAG_FINISH_WITH_NO_DROP, ...rest)
        })

        e.on(EVENT_DROP_DRAG_MOVE, (...rest)=>{
            dispatch(EVENT_DROP_DRAG_MOVE, ...rest)
        })

        e.on(EVENT_DROP_ACTIVE, (...rest)=>{
            el.classList.add(classes.active)
            dispatch(EVENT_DROP_ACTIVE, ...rest)
        })

        e.on(EVENT_DROP_DISACTIVE, (...rest)=>{
            el.classList.remove(classes.active)
            dispatch(EVENT_DROP_DISACTIVE, ...rest)
        })

        let context = createDropContext(...arguments)
        context.event = e
        el.dropContextID = context.id
        dropContexts.push(context)
    },

    destroyContext(id){
        let ind = dropContexts.findIndex(c=>c.id === id)
        if(ind > -1){
            dropContexts.splice(ind, 1)
        }
    },

    beforeUnmount(el){
        // dropContextsDeleteMap[el.contextID] = true
        dropDirective.destroyContext(el.dropContextID)
    }

}

export default {
    install(app){
        app.directive('drag', dragDirective)
        app.directive('drop', dropDirective)
    },
}