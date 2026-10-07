import { reactive, computed } from 'vue'

// 通用「成就 / 徽章」进度系统（引擎层，内容包只提供徽章定义）
const state = reactive({
  unlocked: {},        // { badgeId: 解锁时间戳 }
  lastUnlocked: null,  // { id, name, icon, at } —— 用于弹提示
})

export function useProgress() {
  function unlock(id, meta) {
    if (!id || state.unlocked[id]) return false
    const at = Date.now()
    state.unlocked[id] = at
    state.lastUnlocked = { id, name: meta?.name || id, icon: meta?.icon || '🏅', at }
    return true
  }

  function isUnlocked(id) {
    return !!state.unlocked[id]
  }

  function reset() {
    Object.keys(state.unlocked).forEach(k => delete state.unlocked[k])
    state.lastUnlocked = null
  }

  const count = computed(() => Object.keys(state.unlocked).length)

  return { state, unlock, isUnlocked, reset, count }
}
