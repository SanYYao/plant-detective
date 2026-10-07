<script setup>
import { ref, computed } from 'vue'
import { mdInline } from '../utils/md'
import { useDeckState } from '../composables/useDeckState'
import { useSound } from '../composables/useSound'

const props = defineProps({ data: { type: Object, required: true } })
const state = useDeckState()
const { play } = useSound()

const cocklebur = ref({ hook: false, run: false })
const dandelion = ref({ wind: 0 })
const balsam = ref({ burst: false })

const windLabel = computed(() => {
  const w = dandelion.value.wind
  if (w <= 20) return props.data.experiments[1].windLabels[0]
  if (w > 60) return props.data.experiments[1].windStrongLabel
  return props.data.experiments[1].windLabels[1]
})

const exp = computed(() => Object.fromEntries(props.data.experiments.map((e) => [e.id, e])))

function checkDone() {
  const ok = cocklebur.value.hook && dandelion.value.wind > 60 && balsam.value.burst
  if (ok && !state.solved.seed) {
    state.solved.seed = true
    play('success')
  }
}

function runCocklebur() {
  play('pop')
  cocklebur.value.hook = true
  setTimeout(() => { cocklebur.value.run = true }, 500)
  checkDone()
  setTimeout(() => { cocklebur.value.run = false; cocklebur.value.hook = false }, 3600)
}

function onWind() {
  const w = dandelion.value.wind
  if (w > 20) { play('pop'); if (w > 60) checkDone() }
}
function blowStrong() {
  dandelion.value.wind = 85
  onWind()
}

function explode() {
  play('success')
  balsam.value.burst = true
  setTimeout(() => { if (!state.solved.seed) { balsam.value.burst = false } }, 2600)
  checkDone()
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 w-full">
    <div class="paper-card p-6 sm:p-8 relative">
      <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b-2 border-bark-800/20 mb-5">
        <div class="flex items-center gap-3">
          <span class="tag-stamp font-cute">{{ data.tag }}</span>
          <h2 class="font-cute font-black text-2xl sm:text-3xl text-botanical-900">{{ data.title }}</h2>
        </div>
        <span class="text-xs font-bold text-autumn-600 bg-autumn-400/10 px-3 py-1 rounded-full border border-autumn-400/30">{{ data.hint }}</span>
      </div>

      <p class="text-xs sm:text-sm text-bark-800 font-semibold mb-5">{{ data.intro }}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- 苍耳 -->
        <div class="paper-card-sm p-4 bg-paper-50 flex flex-col justify-between border-2 border-bark-800">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-cute font-black text-base text-botanical-900">{{ exp.cocklebur.title }}</h3>
              <span class="text-[10px] bg-autumn-500/20 text-autumn-600 font-bold px-2 py-0.5 rounded-full">{{ exp.cocklebur.tag }}</span>
            </div>
            <div class="relative w-full h-20 mb-2 rounded-lg overflow-hidden border border-dashed border-bark-800 bg-paper-200 flex items-center justify-center">
              <img v-if="exp.cocklebur.img" :src="exp.cocklebur.img" class="w-full h-full object-cover" />
              <span v-else class="text-[9px] text-bark-800/50 font-bold">{{ exp.cocklebur.illustration }}</span>
            </div>
            <p class="text-xs text-bark-800/80 leading-relaxed mb-3 font-semibold">{{ exp.cocklebur.desc }}</p>

            <div class="w-full h-28 bg-paper-200 border-2 border-bark-800 rounded-xl relative overflow-hidden my-2 select-none">
              <div class="absolute left-2 bottom-3 text-3xl transition-all duration-1000 ease-in-out" :style="{ transform: cocklebur.run ? 'translateX(180px)' : 'none' }">🐕</div>
              <div class="absolute text-2xl cursor-pointer hover:scale-125 transition-all duration-500" :class="cocklebur.hook ? '' : 'right-4 top-4'" :style="cocklebur.hook ? (cocklebur.run ? 'right:4.5rem; top:2.5rem;' : 'right:9rem; top:3rem;') : ''" @click="runCocklebur">🫐</div>
              <div class="absolute top-2 left-2 text-[10px] font-bold bg-paper-50/90 border border-bark-800 px-2 py-0.5 rounded shadow">
                {{ cocklebur.hook ? exp.cocklebur.statusDone : exp.cocklebur.statusIdle }}
              </div>
            </div>
          </div>
          <button class="w-full py-2 rounded-lg bg-autumn-500 text-paper-50 text-xs font-bold hover:bg-autumn-600 transition shadow-[2px_2px_0px_#3d2612]" @click="runCocklebur">{{ exp.cocklebur.action }}</button>
        </div>

        <!-- 蒲公英 -->
        <div class="paper-card-sm p-4 bg-paper-50 flex flex-col justify-between border-2 border-bark-800">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-cute font-black text-base text-botanical-900">{{ exp.dandelion.title }}</h3>
              <span class="text-[10px] bg-botanical-500/20 text-botanical-700 font-bold px-2 py-0.5 rounded-full">{{ exp.dandelion.tag }}</span>
            </div>
            <div class="relative w-full h-20 mb-2 rounded-lg overflow-hidden border border-dashed border-bark-800 bg-paper-200 flex items-center justify-center">
              <img v-if="exp.dandelion.img" :src="exp.dandelion.img" class="w-full h-full object-cover" />
              <span v-else class="text-[9px] text-bark-800/50 font-bold">{{ exp.dandelion.illustration }}</span>
            </div>
            <p class="text-xs text-bark-800/80 leading-relaxed mb-3 font-semibold">{{ exp.dandelion.desc }}</p>

            <div class="w-full h-28 bg-paper-200 border-2 border-bark-800 rounded-xl relative overflow-hidden my-2 select-none">
              <span class="text-4xl absolute bottom-2 left-5">🌱</span>
              <div class="absolute bottom-9 left-7 flex gap-1">
                <span v-for="i in 3" :key="i" class="text-lg inline-block transition-all duration-700"
                  :style="{ transform: `translate(${dandelion.wind * 1.8 + (i - 1) * 20}px, ${-(dandelion.wind * 0.7) - (i - 1) * 15}px) rotate(${dandelion.wind * 3 + (i - 1) * 20}deg) scale(0.85)`, opacity: Math.max(0.2, 1 - dandelion.wind / 120) }">🪁</span>
              </div>
              <div class="absolute top-2 left-2 text-[10px] font-bold bg-paper-50/90 border border-bark-800 px-2 py-0.5 rounded shadow">
                {{ dandelion.wind > 60 ? exp.dandelion.statusStrong : (dandelion.wind > 20 ? exp.dandelion.statusSoft : exp.dandelion.statusIdle) }}
              </div>
            </div>

            <div class="space-y-1 mb-2">
              <div class="flex justify-between text-[10px] font-bold text-bark-800">
                <span>{{ exp.dandelion.windLabels[0] }}</span>
                <span class="text-botanical-700 font-extrabold">{{ windLabel }}</span>
                <span>{{ exp.dandelion.windLabels[2] }}</span>
              </div>
              <input v-model.number="dandelion.wind" type="range" min="0" max="100" class="w-full h-2 bg-paper-200 rounded border border-bark-800 appearance-none cursor-pointer accent-botanical-700" @input="onWind" />
            </div>
          </div>
          <button class="w-full py-2 rounded-lg bg-botanical-700 text-paper-50 text-xs font-bold hover:bg-botanical-800 transition shadow-[2px_2px_0px_#3d2612]" @click="blowStrong">{{ exp.dandelion.action }}</button>
        </div>

        <!-- 凤仙花 -->
        <div class="paper-card-sm p-4 bg-paper-50 flex flex-col justify-between border-2 border-bark-800">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-cute font-black text-base text-botanical-900">{{ exp.balsam.title }}</h3>
              <span class="text-[10px] bg-bark-600/20 text-bark-800 font-bold px-2 py-0.5 rounded-full">{{ exp.balsam.tag }}</span>
            </div>
            <div class="relative w-full h-20 mb-2 rounded-lg overflow-hidden border border-dashed border-bark-800 bg-paper-200 flex items-center justify-center">
              <img v-if="exp.balsam.img" :src="exp.balsam.img" class="w-full h-full object-cover" />
              <span v-else class="text-[9px] text-bark-800/50 font-bold">{{ exp.balsam.illustration }}</span>
            </div>
            <p class="text-xs text-bark-800/80 leading-relaxed mb-3 font-semibold">{{ exp.balsam.desc }}</p>

            <div class="w-full h-28 bg-paper-200 border-2 border-bark-800 rounded-xl relative overflow-hidden my-2 select-none flex items-center justify-center">
              <div class="text-3xl cursor-pointer transition-transform duration-200 hover:scale-110" :class="balsam.burst ? 'scale-125' : ''" @click="explode">
                {{ balsam.burst ? '💥' : '🫛' }}
              </div>
              <div v-if="balsam.burst" class="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span class="absolute text-lg animate-ping">💥</span>
                <span v-for="p in [[-3,-2],[3,-1.5],[-2,2],[2.5,1.5]]" :key="p" class="absolute text-xs" :style="{ transform: `translate(${p[0] * 16}px, ${p[1] * 16}px)` }">🌰</span>
              </div>
              <div class="absolute top-2 left-2 text-[10px] font-bold bg-paper-50/90 border border-bark-800 px-2 py-0.5 rounded shadow">
                {{ balsam.burst ? exp.balsam.statusDone : exp.balsam.statusIdle }}
              </div>
            </div>
          </div>
          <button class="w-full py-2 rounded-lg bg-bark-600 text-paper-50 text-xs font-bold hover:bg-bark-800 transition shadow-[2px_2px_0px_#3d2612]" @click="explode">{{ exp.balsam.action }}</button>
        </div>
      </div>

      <div v-if="state.solved.seed" class="mt-5 p-3 rounded-xl bg-botanical-100 border-2 border-botanical-700 text-botanical-900 font-bold text-center text-sm animate-bounce">
        {{ data.success }}
      </div>

      <div class="mt-4 p-3 rounded-xl bg-autumn-400/15 border-2 border-autumn-500/40 flex items-center gap-3 text-xs font-bold text-autumn-600">
        <span class="text-xl">⚠️</span>
        <span v-html="mdInline(data.safety)"></span>
      </div>
    </div>
  </div>
</template>
