<script setup>
import { computed, watch, ref } from 'vue'
import { useProgress } from '../composables/useProgress'

const props = defineProps({
  badges: { type: Array, required: true },
})

const { state, isUnlocked, count } = useProgress()
const total = computed(() => props.badges.length)
const toast = ref(null)
let toastTimer = null

// 解锁时弹提示（元数据从内容包的徽章表里查，引擎不依赖内容包）
watch(() => state.lastUnlocked, (val) => {
  if (!val) return
  const found = props.badges.find(b => b.id === val.id)
  toast.value = found ? { ...found } : val
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 3200)
})
</script>

<template>
  <div class="fixed left-4 bottom-4 z-30 flex items-center gap-2 select-none no-print">
    <!-- 徽章槽 -->
    <div class="flex items-center gap-1.5 px-2.5 py-2 rounded-2xl bg-paper-100/85 backdrop-blur border border-bark-900/10 shadow-lg">
      <div
        v-for="b in badges"
        :key="b.id"
        class="badge-slot"
        :class="{ 'is-on': isUnlocked(b.id) }"
        :title="isUnlocked(b.id) ? `${b.name} — ${b.desc}` : `${b.name}（未解锁）`"
      >
        <span class="badge-emoji">{{ isUnlocked(b.id) ? b.icon : '?' }}</span>
      </div>
      <span class="ml-1 text-[11px] font-cute font-bold text-bark-800/70">{{ count }}/{{ total }}</span>
    </div>

    <!-- 解锁提示 -->
    <Transition name="badge-toast">
      <div
        v-if="toast"
        class="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-botanical-700 text-paper-50 shadow-xl"
      >
        <span class="text-xl">{{ toast.icon }}</span>
        <div class="leading-tight">
          <p class="text-[10px] font-cute opacity-80">解锁徽章</p>
          <p class="text-sm font-cute font-bold">{{ toast.name }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.badge-slot {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(61, 38, 18, 0.06);
  border: 1px dashed rgba(61, 38, 18, 0.18);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s, border-color 0.3s;
}
.badge-emoji {
  font-size: 17px;
  filter: grayscale(1) opacity(0.35);
  transition: filter 0.35s;
}
.badge-slot.is-on {
  background: linear-gradient(145deg, #fdf6e3, #f5e2b8);
  border: 1px solid #e3b341;
  box-shadow: 0 2px 8px rgba(227, 179, 65, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation: badge-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-slot.is-on .badge-emoji {
  filter: none;
}
@keyframes badge-pop {
  0% { transform: scale(0.7) rotate(-12deg); }
  55% { transform: scale(1.18) rotate(6deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.badge-toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.badge-toast-leave-active { transition: all 0.25s ease; }
.badge-toast-enter-from { opacity: 0; transform: translateX(-16px) scale(0.9); }
.badge-toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
