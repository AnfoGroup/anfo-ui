import { createApp, h } from 'vue'
import App from './App.vue'
import anfoUI from './index'

let app = createApp(App)

import Pagination from '@/components/Pagination'

app.use(anfoUI, {
    list: {
        pagination: {
            paginationComponent: h(Pagination, {})
        }
    }
})

app.mount('#app')
