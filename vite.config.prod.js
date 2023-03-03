import { defineConfig, mergeConfig } from 'vite'
import defaultConfig from './vite.config.base'

import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(
  mergeConfig(defaultConfig, {
    build: {
      lib: {
        formats: ['es', 'umd', 'iife'],
        entry: path.resolve(__dirname, 'src/index.js'),
        name: 'AnfoUI',
        fileName: 'anfoUI',
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ['vue'],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  })
)
