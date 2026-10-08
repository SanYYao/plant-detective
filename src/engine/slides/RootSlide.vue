<script setup>
import { ref, computed } from 'vue'
import { mdInline } from '../utils/md'
import { useSound } from '../composables/useSound'
import { useProgress } from '../composables/useProgress'

const props = defineProps({ data: { type: Object, required: true } })
const { play } = useSound()
const { unlock } = useProgress()

const progress = ref(0) // 0-100 → 0-24 小时
const solved = ref(false)
let lastTick = -1

const hours = computed(() => Math.round((progress.value / 100) * 24))
const stemFill = computed(() => Math.round((progress.value / 100) * 168))
const leafTinted = computed(() => progress.value > 72)

const activeZone = computed(() => {
  const h = hours.value
  if (h < 4) return 'root'
  if (h < 12) return 'stem'
  return 'leaf'
})

function onInput() {
  const h = hours.value
  if (h !== lastTick && h % 2 === 0) { lastTick = h; play('tick') }
  if (progress.value > 85 && !solved.value) {
    solved.value = true
    play('success')
    unlock('root')
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div class="flex items-center gap-3">
        <span class="tag-stamp text-xs font-cute">{{ data.tag }}</span>
        <h2 class="font-cute font-black text-2xl sm:text-3xl text-botanical-900">{{ data.title }}</h2>
      </div>
      <span class="text-xs font-bold text-bark-800/70 bg-paper-200 px-3 py-1 rounded-full border border-bark-900/10">{{ data.time }}</span>
    </div>

    <p class="text-sm text-bark-800 font-semibold mb-4 text-center">{{ data.intro }}</p>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-5 items-center">
      <!-- 芹菜 SVG -->
      <div class="md:col-span-3 paper-card p-3 bg-paper-100">
        <svg viewBox="0 0 300 330" class="w-full h-auto max-h-[44vh] mx-auto select-none">
          <!-- 水盆 -->
          <rect x="58" y="252" width="184" height="62" rx="12" fill="#cfeaf9" stroke="#3d2612" stroke-width="2.5" />
          <rect x="62" y="258" width="176" height="16" rx="8" fill="#8ecdf0" opacity="0.75" />
          <text x="150" y="300" text-anchor="middle" font-size="13" fill="#2b5c78" font-weight="bold">{{ data.waterLabel }}</text>

          <!-- 根系（浸在水里） -->
          <path d="M150,250 C150,266 146,278 138,292" stroke="#a8763f" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M150,252 C154,266 158,276 166,288" stroke="#a8763f" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M150,254 C150,270 150,282 150,296" stroke="#a8763f" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M150,252 C142,262 134,268 126,274" stroke="#a8763f" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <path d="M150,252 C160,262 168,266 176,272" stroke="#a8763f" stroke-width="2.5" fill="none" stroke-linecap="round" />
          <!-- 根毛 -->
          <g stroke="#c2955c" stroke-width="1.4" fill="none" opacity="0.9" stroke-linecap="round">
            <path d="M138,292 l-5,5 M138,292 l6,4 M166,288 l5,5 M150,296 l-4,6 M150,296 l5,5 M126,274 l-5,2 M176,272 l5,2" />
          </g>

          <!-- 茎 -->
          <rect x="143" y="86" width="14" height="168" rx="7" fill="#9ec27f" stroke="#3d2612" stroke-width="2.5" />

          <!-- 茎里往上爬的蓝色水柱（随滑杆上升） -->
          <rect x="143" :y="252 - stemFill" width="14" :height="stemFill" rx="7" fill="#3b82f6" opacity="0.8" />

          <!-- 叶柄 -->
          <path d="M144,104 L130,100" stroke="#3d2612" stroke-width="2" stroke-linecap="round" />
          <path d="M156,114 L170,116" stroke="#3d2612" stroke-width="2" stroke-linecap="round" />

          <!-- 叶片 -->
          <ellipse cx="110" cy="98" rx="34" ry="19" :fill="leafTinted ? '#7fb4e8' : '#a8cd8a'" stroke="#3d2612" stroke-width="2.5" transform="rotate(-18 110 98)" />
          <ellipse cx="190" cy="114" rx="32" ry="18" :fill="leafTinted ? '#7fb4e8' : '#a8cd8a'" stroke="#3d2612" stroke-width="2.5" transform="rotate(16 190 114)" />

          <!-- 叶片上的气孔提示 -->
          <g v-if="leafTinted" fill="#2b5c78" opacity="0.55">
            <circle cx="100" cy="94" r="2.2" /><circle cx="116" cy="102" r="2" /><circle cx="126" cy="90" r="1.8" />
            <circle cx="182" cy="110" r="2.2" /><circle cx="196" cy="120" r="2" /><circle cx="204" cy="108" r="1.8" />
          </g>
        </svg>
        <p class="text-center text-xs font-cute font-bold text-bark-800/60 mt-1">{{ data.plantLabel }}</p>
      </div>

      <!-- 时间滑杆 + 阶段说明 -->
      <div class="md:col-span-2 space-y-3">
        <div class="paper-card p-4 bg-paper-100">
          <div class="flex items-baseline justify-between mb-2">
            <span class="text-xs font-bold text-bark-800/70">{{ data.timeLabel }}</span>
            <span class="font-cute font-black text-xl text-botanical-900">{{ hours }} {{ data.hoursUnit }}</span>
          </div>
          <input
            v-model.number="progress"
            type="range"
            min="0"
            max="100"
            step="1"
            class="w-full accent-botanical-700 cursor-pointer"
            @input="onInput"
          />
          <div class="flex justify-between text-[10px] font-bold text-bark-800/60 mt-1">
            <span>{{ data.sliderLeft }}</span>
            <span>{{ data.sliderRight }}</span>
          </div>
        </div>

        <button
          v-for="z in data.zones"
          :key="z.id"
          class="w-full text-left rounded-2xl border-2 px-3.5 py-2.5 transition-all duration-200"
          :class="activeZone === z.id ? 'border-bark-900/40 bg-paper-50 shadow-md scale-[1.02]' : 'border-bark-900/10 bg-paper-100/70'"
          @click="progress = z.id === 'root' ? 6 : z.id === 'stem' ? 45 : 95; onInput()"
        >
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full border border-bark-900/30 shrink-0" :style="{ background: z.color }"></span>
            <span class="font-cute font-bold text-botanical-900">{{ z.name }}</span>
            <span class="text-[11px] font-bold text-bark-800/70">· {{ z.range }}</span>
          </div>
          <p v-if="activeZone === z.id" class="mt-1.5 text-xs text-bark-800 leading-relaxed" v-html="mdInline(z.detail)"></p>
        </button>

        <div v-if="solved" class="p-3 rounded-xl bg-botanical-100 border-2 border-botanical-700 text-botanical-900 text-xs font-bold leading-relaxed">
          <p class="mb-1">{{ data.success }}</p>
          <p v-html="mdInline(data.conclusion)"></p>
        </div>
      </div>
    </div>

    <p v-if="solved" class="mt-4 text-center text-xs font-bold text-bark-800/80">{{ data.chain }}</p>
    <p class="mt-3 text-[11px] text-center text-bark-800/60">💡 {{ data.safety }}</p>
  </div>
</template>
