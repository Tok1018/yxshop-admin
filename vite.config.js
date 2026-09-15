import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import viteCompression from 'vite-plugin-compression'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isProduction = mode === 'production'
  const apiTarget = env.VITE_API_TARGET || env.VITE_APP_BASE_URL || 'http://127.0.0.1:8777'

  return defineConfig({
    base: isProduction ? '/yxadmin/' : '/',
    plugins: [vue(), vueJsx(), viteCompression({ algorithm: 'gzip', threshold: 10240 })],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.esm-bundler.js'
      }
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('monaco-editor')) return 'vendor-monaco'
              if (id.includes('echarts')) return 'vendor-echarts'
              if (id.includes('@wangeditor')) return 'vendor-editor'
              if (id.includes('@arco-design')) return 'vendor-ui'
              if (id.includes('vue-i18n')) return 'vendor-i18n'
              if (id.includes('/vue/') || id.includes('vue-router') || id.includes('pinia')) return 'vendor-vue'
              if (id.includes('lodash') || id.includes('crypto-js') || id.includes('dayjs') || id.includes('nprogress') || id.includes('axios')) return 'vendor-utils'
              return 'vendor-misc'
            }
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: env.VITE_APP_PORT || 5173,
      proxy: {
        '/admin/api': {
          target: apiTarget,
          changeOrigin: true,
          ws: true
        },
        '/yxadmin': {
          target: apiTarget,
          changeOrigin: true
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  })
}
