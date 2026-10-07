import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 两种构建产物：
//   npm run build          → 在线版（正常分片，部署 Cloudflare Pages，含 AI）
//   npm run build:offline  → 离线版（单文件内联，双击可用，构建期关掉 AI/音效）
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline'
  return {
    base: offline ? './' : '/',
    plugins: [vue(), ...(offline ? [viteSingleFile()] : [])],
    build: {
      outDir: offline ? 'dist-offline' : 'dist',
      emptyOutDir: true,
      // 离线版：把字体等资源全部内联进单文件
      assetsInlineLimit: offline ? 1024 * 1024 * 64 : 4096,
      cssCodeSplit: !offline,
    },
    define: {
      // 编译期开关：离线版剥掉 AI 与音效
      __OFFLINE__: JSON.stringify(offline),
    },
  }
})
