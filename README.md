# Anfo UI

AnfoUI`@anfo/ui` 主要包含一些非必要但有用的Vue3组件。

- 👉 [Github](https://github.com/AnfoGroup/anfo-ui)
- 👉 [Documentation](https://anfo.fun/anfoui)
- 
## 安装

```bash
npm i @anfo/ui@latest
```

## 引用

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'

let app = createApp(App)

import AnfoUI from '@anfo/ui'
import '@anfo/ui/style'
app.use(AnfoUI)

app.mount('#app')
```

## 按需引用

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'

let app = createApp(App)

import { OrderableContainer } from '@anfo/ui'
import '@anfo/ui/style'
app.component('anfo-orderable-container', OrderableContainer)

app.mount('#app')
```

## 简单的例子

这是一个**顺序拖拽容器(OrderableContainer)**

```html
<template>
<div class="example-demo" style="width: 200px">
    <!-- 默认的组件名字带anfo-前缀 -->
    <anfo-orderable-container v-model:datas="datas" class="v align-center">
        <template #="{ data }">
            <div class="h justify-center clickable" :style="{
                width: '100px',
                height: '30px',
                color: 'white',
                background: `#${(0xffffff / 5 * data).toString(16)}`,
            }">{{ data }}</div>
        </template>
    </anfo-orderable-container>
</div>
</template>

<script setup>
import { ref, watch } from 'vue'

let datas = ref([1, 2, 3])
</script>
```