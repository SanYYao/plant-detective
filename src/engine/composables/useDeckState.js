import { reactive } from 'vue'

// 跨幻灯片共享状态（单例）。内容包与引擎组件都通过它读写。
const state = reactive({
  // 侦探信息
  detectiveName: '名侦探小明',
  registered: false,
  // AI 授权
  authorized: false,
  pin: '',
  // 音效
  soundOn: true,
  // 破案进度
  solved: { leaf: false, breakfast: false, seed: false },
})

export function useDeckState() {
  return state
}
