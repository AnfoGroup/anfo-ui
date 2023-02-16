export default {
    install(app){
        app.directive('focus', {
            mounted(el){
                if(el instanceof HTMLInputElement
                    || el instanceof HTMLTextAreaElement){
                    el.focus()
                }else{
                    el.querySelector('input,textarea')?.focus?.()
                }
            }
        })
    }
}