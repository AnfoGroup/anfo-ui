import { createApp, h } from 'vue'
import App from './App.vue'
import AnfoUI from './index'

let app = createApp(App)

app.use(AnfoUI)

import router from '@/router'
app.use(router)

app.mount('#app')
