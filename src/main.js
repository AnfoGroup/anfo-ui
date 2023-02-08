import { createApp, h } from 'vue'
import App from './App.vue'
import AnfoUI from './index'

let app = createApp(App)

import Pagination from '@/components/Pagination'

app.use(AnfoUI, {
    list: {
        pagination: {
            paginationComponent: h(Pagination, {})
        }
    }
})

import router from '@/router'
app.use(router)

app.mount('#app')
