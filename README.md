# 快速开始

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

```html
<template>
<div>
    <!-- 默认的组件名字带anfo-前缀 -->
    <anfo-orderable-container :datas="[1, 2, 3]"></anfo-orderable-container>
</div>
</template>
```