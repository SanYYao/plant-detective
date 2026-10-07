<script setup>
import { ref, computed } from 'vue'
import { mdInline } from '../utils/md'
import { useSound } from '../composables/useSound'
import { useProgress } from '../composables/useProgress'

const props = defineProps({ data: { type: Object, required: true } })
const { play } = useSound()
const { unlock } = useProgress()

const active = ref(null)
const found = ref([])
const allFound = computed(() => found.value.length >= props.data.parts.length)

function pick(id) {
  active.value = id
  if (!found.value.includes(id)) {
    found.value.push(id)
    play('pop')
    if (found.value.length >= props.data.parts.length) {
      play('success')
      unlock('flower')
    }
  } else {
    play('tick')
  }
}

const dim = id => active.value && active.value !== id ? 0.35 : 1
const isTouched = id => found.value.includes(id)
const strokeOf = id => active.value === id ? '#8c3a1e' : '#5b3a22'
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
      <!-- 花朵 SVG -->
      <div class="md:col-span-3 paper-card p-3 bg-paper-100 relative">
        <svg viewBox="0 0 300 300" class="w-full h-auto max-h-[46vh] mx-auto select-none">
          <!-- 花茎 -->
          <path d="M150,214 L150,288" stroke="#6f9e5a" stroke-width="7" stroke-linecap="round" fill="none" />

          <!-- 萼片 -->
          <g class="cursor-pointer" :opacity="dim('sepal')" @click="pick('sepal')">
            <path d="M150,212 C122,212 100,232 106,250 C126,252 144,236 150,220 Z"
                  :fill="isTouched('sepal') ? '#6f9e5a' : '#9bb789'" :stroke="strokeOf('sepal')" stroke-width="2.5" />
            <path d="M150,212 C178,212 200,232 194,250 C174,252 156,236 150,220 Z"
                  :fill="isTouched('sepal') ? '#6f9e5a' : '#9bb789'" :stroke="strokeOf('sepal')" stroke-width="2.5" />
          </g>

          <!-- 花瓣 6 片 -->
          <g class="cursor-pointer" :opacity="dim('petal')" @click="pick('petal')">
            <ellipse v-for="n in 6" :key="'p' + n" cx="150" cy="82" rx="28" ry="46"
                     :transform="`rotate(${(n - 1) * 60} 150 150)`"
                     :fill="isTouched('petal') ? '#f2a7c3' : '#f8cfe0'"
                     :stroke="strokeOf('petal')" stroke-width="2.5" />
          </g>

          <!-- 雄蕊 6 根 -->
          <g class="cursor-pointer" :opacity="dim('stamen')" @click="pick('stamen')">
            <g v-for="n in 6" :key="'s' + n" :transform="`rotate(${(n - 1) * 60 + 30} 150 150)`">
              <path d="M150,150 L150,112" stroke="transparent" stroke-width="18" fill="none" />
              <path d="M150,150 L150,112" :stroke="strokeOf('stamen')" stroke-width="2.5" fill="none" />
              <circle cx="150" cy="107" r="8" :fill="isTouched('stamen') ? '#e8b93f' : '#f0d488'" :stroke="strokeOf('stamen')" stroke-width="2" />
            </g>
          </g>

          <!-- 雌蕊（居中） -->
          <g class="cursor-pointer" :opacity="dim('pistil')" @click="pick('pistil')">
            <ellipse cx="150" cy="153" rx="17" ry="21" :fill="isTouched('pistil') ? '#93bb6f' : '#c3dcae'" :stroke="strokeOf('pistil')" stroke-width="2.5" />
            <path d="M150,148 L150,94" :stroke="isTouched('pistil') ? '#93bb6f' : '#b6d39c'" stroke-width="7" stroke-linecap="round" fill="none" />
            <circle cx="150" cy="89" r="11" :fill="isTouched('pistil') ? '#93bb6f' : '#c3dcae'" :stroke="strokeOf('pistil')" stroke-width="2.5" />
          </g>
        </svg>
        <p class="text-center text-xs font-cute font-bold text-bark-800/60 mt-1">{{ data.hint }}</p>
      </div>

      <!-- 部位说明 -->
      <div class="md:col-span-2 space-y-2.5">
        <button
          v-for="p in data.parts"
          :key="p.id"
          class="w-full text-left rounded-2xl border-2 px-3.5 py-2.5 transition-all duration-200"
          :class="active === p.id ? 'border-bark-900/40 bg-paper-50 shadow-md scale-[1.02]' : 'border-bark-900/10 bg-paper-100/70 hover:bg-paper-50'"
          @click="pick(p.id)"
        >
          <div class="flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full border border-bark-900/30 shrink-0" :style="{ background: p.color }"></span>
            <span class="font-cute font-bold text-botanical-900">{{ p.name }}</span>
            <span class="text-[11px] font-bold text-bark-800/70">· {{ p.role }}</span>
            <span v-if="isTouched(p.id)" class="ml-auto text-xs">✅</span>
          </div>
          <p v-if="active === p.id" class="mt-1.5 text-xs text-bark-800 leading-relaxed" v-html="mdInline(p.detail)"></p>
        </button>

        <div v-if="allFound" class="p-3 rounded-xl bg-botanical-100 border-2 border-botanical-700 text-botanical-900 text-xs font-bold leading-relaxed">
          <p class="mb-1">{{ data.allFoundText }}</p>
          <p v-html="mdInline(data.conclusion)"></p>
        </div>
      </div>
    </div>

    <p v-if="allFound" class="mt-4 text-center text-xs font-bold text-bark-800/80">{{ data.chain }}</p>
    <p class="mt-3 text-[11px] text-center text-bark-800/60">⚠️ {{ data.safety }}</p>
  </div>
</template>
