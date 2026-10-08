<script setup>
import { ref, computed } from 'vue'
import { mdInline } from '../utils/md'
import { useDeckState } from '../composables/useDeckState'
import { useSound } from '../composables/useSound'
import { useProgress } from '../composables/useProgress'

const props = defineProps({ data: { type: Object, required: true } })
const state = useDeckState()
const { play } = useSound()
const { unlock } = useProgress()

const season = ref(0)
const showStomata = ref(false)

const stage = computed(() => {
  const i = season.value < 34 ? 0 : season.value < 67 ? 1 : 2
  return props.data.stages[i]
})

function onSeasonInput() {
  if (season.value > 66 && !state.solved.leaf) { state.solved.leaf = true; unlock('leaf') }
}

function toggleStomata() {
  showStomata.value = !showStomata.value
  play('breeze')
  if (showStomata.value) { state.solved.leaf = true; unlock('leaf') }
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 w-full">
    <div class="paper-card p-6 sm:p-8 relative">
      <!-- 头部 -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b-2 border-bark-800/20 mb-6">
        <div class="flex items-center gap-3">
          <span class="tag-stamp font-cute">{{ data.tag }}</span>
          <h2 class="font-cute font-black text-2xl sm:text-3xl text-botanical-900">{{ data.title }}</h2>
        </div>
        <div class="text-xs font-bold text-autumn-600 bg-autumn-400/10 px-3 py-1 rounded-full border border-autumn-400/30">
          {{ data.time }}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <!-- 显微透视互动区 -->
        <div class="lg:col-span-7 bg-paper-200 border-2 border-bark-800 rounded-2xl p-5 relative flex flex-col items-center">
          <div class="w-full flex items-center justify-between text-xs font-bold text-botanical-900 mb-2">
            <span>{{ data.viewLabel }}</span>
            <span class="text-autumn-600 font-extrabold">{{ stage.credit }}</span>
          </div>

          <div class="relative w-56 h-56 sm:w-64 sm:h-64 my-3 flex items-center justify-center">
            <svg class="w-full h-full filter drop-shadow-[4px_6px_0px_rgba(61,38,18,0.2)] transition-all duration-300" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop :stop-color="stage.stop1" offset="0%" />
                  <stop :stop-color="stage.stop2" offset="100%" />
                </linearGradient>
              </defs>
              <path d="M100,15 C160,55 185,120 100,185 C15,120 40,55 100,15 Z" fill="url(#leafGrad)" stroke="#3d2612" stroke-width="4" />
              <path d="M100,185 L100,20 M100,140 L145,110 M100,100 L155,70 M100,60 L135,40 M100,140 L55,110 M100,100 L45,70 M100,60 L65,40" stroke="#3d2612" stroke-width="3" stroke-linecap="round" opacity="0.3" fill="none" />
            </svg>
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span class="text-3xl absolute top-12 left-16 transition-opacity duration-300" :style="{ opacity: stage.chef }">👨‍🍳</span>
              <span class="text-2xl animate-pulse absolute bottom-16 right-16 transition-opacity duration-300" :style="{ opacity: stage.sun }">☀️</span>
              <span class="text-3xl absolute top-20 right-16 transition-opacity duration-500" :style="{ opacity: stage.yellow }">🍁</span>
            </div>
          </div>

          <!-- 季节滑杆 -->
          <div class="w-full max-w-md space-y-2 mt-1">
            <div class="flex justify-between text-xs font-bold text-bark-800">
              <span>{{ data.sliderLeft }}</span>
              <span>{{ data.sliderRight }}</span>
            </div>
            <input v-model.number="season" type="range" min="0" max="100" class="w-full h-3 bg-paper-50 rounded-lg border-2 border-bark-800 appearance-none cursor-pointer accent-autumn-500" @input="onSeasonInput" />
          </div>
        </div>

        <!-- 笔记与微实验 -->
        <div class="lg:col-span-5 space-y-4">
          <div class="paper-card-sm p-3 bg-paper-50">
            <div class="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-bark-800 bg-paper-200 flex items-center justify-center">
              <img v-if="data.illustration.img" :src="data.illustration.img" class="w-full h-full object-cover" />
              <div class="absolute top-1 left-1 bg-autumn-500 text-paper-50 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                {{ data.illustration.title }}
              </div>
            </div>
          </div>

          <div class="paper-card-sm p-4 bg-botanical-100 border-2 border-botanical-700">
            <h3 class="font-cute font-bold text-base text-botanical-900 mb-2">{{ data.notesTitle }}</h3>
            <ul class="space-y-2 text-xs text-bark-800 font-semibold leading-relaxed">
              <li v-for="(n, i) in data.notes" :key="i" class="flex items-start gap-2">
                <span class="text-autumn-500 font-bold">{{ i + 1 }}.</span>
                <span v-html="mdInline(n)"></span>
              </li>
            </ul>
          </div>

          <div class="paper-card-sm p-3 bg-paper-50">
            <div class="flex items-center justify-between gap-2">
              <div>
                <span class="text-[10px] font-bold text-autumn-500 uppercase tracking-wider">{{ data.microTitle }}</span>
                <p class="text-xs font-bold text-botanical-900 mt-0.5">{{ data.microQuestion }}</p>
              </div>
              <button class="px-3 py-1.5 rounded-lg bg-botanical-700 text-paper-50 text-xs font-bold hover:bg-botanical-800 transition shadow-[2px_2px_0px_#3d2612] shrink-0" @click="toggleStomata">
                {{ data.microButton }}
              </button>
            </div>
            <p v-if="showStomata" class="text-xs text-bark-800/80 mt-2 font-semibold border-t border-bark-800/20 pt-2">
              {{ data.microAnswer }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
