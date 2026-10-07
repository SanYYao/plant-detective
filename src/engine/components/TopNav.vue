<script setup>
import { useDeckState } from '../composables/useDeckState'

defineProps({
  slides: { type: Array, required: true },
  current: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  meta: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['go'])

const state = useDeckState()
// 编译期常量：脚本里会被 Vite define 替换，模板才能正确读到
const IS_OFFLINE = __OFFLINE__
</script>

<template>
  <header
    class="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-6xl transition-all duration-300 ease-out"
    :class="visible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'"
  >
    <div class="paper-card px-5 py-3 flex flex-wrap items-center justify-between gap-3">
      <!-- 品牌 -->
      <div class="flex items-center gap-3 cursor-pointer" @click="emit('go', 0)">
        <div class="w-10 h-10 rounded-xl bg-botanical-700 text-paper-50 border-2 border-bark-800 flex items-center justify-center font-bold text-xl shadow-[2px_2px_0px_#3d2612]">
          🍂
        </div>
        <div>
          <span class="font-cute font-black text-lg tracking-wide text-botanical-900 block leading-tight">{{ meta.brand || '植物侦探社' }}</span>
          <span class="text-[10px] text-autumn-500 font-bold tracking-widest uppercase">{{ meta.brandSub || 'Autumn Lesson' }}</span>
        </div>
      </div>

      <!-- 段落跳转 -->
      <nav class="hidden md:flex items-center gap-1 text-xs font-bold text-bark-800">
        <template v-for="(s, i) in slides" :key="s.id">
          <button
            v-if="s.nav"
            class="px-2 py-1 rounded-md transition"
            :class="current === i ? 'bg-autumn-400/30 text-autumn-600' : 'hover:text-autumn-500 hover:bg-paper-200'"
            @click="emit('go', i)"
          >
            {{ s.nav }}
          </button>
          <span v-if="i < slides.length - 1 && s.nav" class="text-bark-800/30">→</span>
        </template>
      </nav>

      <!-- 右侧动作 -->
      <div class="flex items-center gap-2">
        <!-- 音效开关（离线版隐藏） -->
        <button
          v-if="!IS_OFFLINE"
          class="px-3 py-1.5 rounded-lg border border-bark-800 bg-paper-100 hover:bg-paper-200 text-xs font-bold flex items-center gap-1.5 transition shadow-[2px_2px_0px_#3d2612]"
          @click="state.soundOn = !state.soundOn"
        >
          <span>{{ state.soundOn ? '🔊' : '🔇' }}</span>
          <span class="hidden sm:inline">环境声音</span>
        </button>

        <button
          class="px-3.5 py-1.5 rounded-lg bg-autumn-500 text-paper-50 font-bold text-xs hover:bg-autumn-600 transition shadow-[2px_2px_0px_#3d2612] flex items-center gap-1"
          @click="emit('go', slides.length - 1)"
        >
          <span>📜</span> 侦探证
        </button>
      </div>
    </div>
  </header>
</template>
