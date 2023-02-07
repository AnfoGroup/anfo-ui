let moveDirective = {
    mounted(el){
        let context = {
            el
        }
        el.addEventListener('mousedown', e=>moveDirective.handleMouseDown(e, context))
        document.addEventListener('mousemove', e=>moveDirective.handleMouseMove(e, context))
        document.addEventListener('mouseup', e=>moveDirective.handleMouseUp(e, context))
    },
    beforeUnmount(el){
        el.removeEventListener('mousedown', moveDirective.handleMouseDown)
        document.removeEventListener('mousemove', moveDirective.handleMouseMove)
        document.removeEventListener('mouseup', moveDirective.handleMouseUp)
    },
    handleMouseDown(e, context){
        context._isActive = true
        context._prevEvent = e
    },
    handleMouseMove(e, context){
        if(context._isActive){
            let event = new Event('move')
            event.offset = {
                x: e.pageX - context._prevEvent.pageX,
                y: e.pageY - context._prevEvent.pageY,
            }
            context.el.dispatchEvent(event)
            context._prevEvent = e
        }
    },
    handleMouseUp(e, context){
        context._isActive = false
        context._prevEvent = null
    }
}

export default {
    install(app){
        app.directive('move', moveDirective)
    },
}