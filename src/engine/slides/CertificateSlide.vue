<script setup>
import { mdInline } from '../utils/md'
import { useDeckState } from '../composables/useDeckState'

const props = defineProps({ data: { type: Object, required: true } })
const state = useDeckState()

function doPrint() {
  document.body.classList.add('print-cert-only')
  window.print()
  setTimeout(() => document.body.classList.remove('print-cert-only'), 200)
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 w-full">
    <div class="paper-card p-8 sm:p-12 text-center relative bg-gradient-to-b from-paper-50 to-paper-100 border-4 border-bark-800 shadow-[8px_8px_0px_#3d2612]">
      <!-- 奖章章印 -->
      <div class="absolute right-6 top-6 w-20 h-20 rounded-full border-4 border-autumn-500/30 flex items-center justify-center text-autumn-600 font-cute font-black text-[10px] rotate-12 pointer-events-none uppercase leading-tight whitespace-pre-line">
        {{ data.stamp }}
      </div>

      <!-- 奖章贴纸 -->
      <div v-if="data.sticker && data.sticker.img" class="absolute left-6 top-6 w-20 h-20 rounded-full overflow-hidden border-2 border-bark-800 shadow-[3px_3px_0px_#3d2612]">
        <img :src="data.sticker.img" class="w-full h-full object-cover" />
      </div>

      <div class="inline-block text-4xl mb-1">{{ data.badge }}</div>
      <h2 class="font-cute font-black text-3xl sm:text-5xl text-botanical-900 mb-1">{{ data.title }}</h2>
      <p class="text-xs uppercase font-bold text-autumn-600 tracking-widest mb-5">{{ data.subtitle }}</p>

      <div class="max-w-md mx-auto bg-paper-50 border-2 border-bark-800 rounded-2xl p-5 space-y-2 mb-5">
        <p class="text-sm font-bold text-bark-800">
          {{ data.nameLabel }}
          <span class="text-autumn-600 underline text-lg font-black px-1">{{ state.detectiveName || data.nameDefault }}</span>
        </p>
        <p class="text-xs text-bark-800/80 leading-relaxed font-semibold">{{ data.body }}</p>
      </div>

      <!-- 深色任务卡：不要用 .paper-card-sm（它的浅色背景会盖掉 bg-botanical-900，导致浅底浅字看不见） -->
      <div class="p-4 bg-botanical-900 text-paper-50 text-left max-w-lg mx-auto mb-5 space-y-2 rounded-2xl border-2 border-bark-800 shadow-[3px_3px_0px_#3d2612]">
        <h4 class="font-bold text-autumn-400 text-sm">{{ data.homeworkTitle }}</h4>
        <ul class="text-xs space-y-1.5 pl-5 list-disc font-semibold text-paper-100 leading-relaxed">
          <li v-for="(h, i) in data.homework" :key="i" v-html="mdInline(h)"></li>
        </ul>
      </div>

      <button class="px-6 py-2.5 rounded-xl bg-botanical-700 hover:bg-botanical-800 text-paper-50 font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#3d2612] transition no-print" @click="doPrint">
        {{ data.printButton }}
      </button>

      <p class="mt-6 text-[10px] text-bark-800/50 font-bold">{{ data.footer }}</p>
    </div>
  </div>
</template>
