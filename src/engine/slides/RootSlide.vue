<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
const leafTinted = computed(() => progress.value > 72)

const activeZone = computed(() => {
  const h = hours.value
  if (h < 4) return 'root'
  if (h < 12) return 'stem'
  return 'leaf'
})

// 芹菜秆（来自 Claude 的纯 CSS 画稿）
const stalks = [
  { x: 0, a: 0, h: 372, w: 30, z: 1, k: 1.1, tinted: true },
  { x: -13, a: -6, h: 350, w: 32, z: 2, k: 1, tinted: true },
  { x: 14, a: 7, h: 356, w: 32, z: 2, k: 1.05, tinted: true },
  { x: -29, a: -13, h: 326, w: 34, z: 3, k: 1, tinted: false },
  { x: 30, a: 14, h: 318, w: 34, z: 3, k: 1, tinted: false },
  { x: -42, a: -21, h: 282, w: 35, z: 4, k: 0.9, tinted: false },
  { x: 45, a: 22, h: 276, w: 35, z: 4, k: 0.9, tinted: false },
]

const leaves = [
  { l: -66, t: -414, r: -16, z: 9 },
  { l: 12, t: -408, r: 18, z: 9 },
  { l: -110, t: -364, r: -36, z: 9 },
  { l: 60, t: -356, r: 38, z: 9 },
]

const pebbles = [
  { l: 224, t: 476, w: 24, h: 14 },
  { l: 322, t: 477, w: 28, h: 15, hue: 20 },
  { l: 268, t: 482, w: 18, h: 10 },
  { l: 190, t: 466, w: 19, h: 11 },
  { l: 358, t: 464, w: 21, h: 12 },
]

const ripples = [{ d: 0 }, { d: 1.4 }, { d: 2.8 }]

const bubbles = [
  { l: 148, t: 436, s: 9, d: 0 }, { l: 172, t: 462, s: 5, d: 1.2 },
  { l: 214, t: 470, s: 7, d: 2.4 }, { l: 236, t: 452, s: 4, d: 0.6 },
  { l: 318, t: 458, s: 6, d: 1.8 }, { l: 344, t: 440, s: 10, d: 3 },
  { l: 398, t: 452, s: 5, d: 0.9 }, { l: 430, t: 430, s: 8, d: 2.1 },
  { l: 300, t: 476, s: 4, d: 3.6 },
]

const drops = [
  { l: 112, t: 520, s: 1 }, { l: 146, t: 538, s: 0.7 }, { l: 424, t: 530, s: 0.85 },
]

function onInput() {
  const h = hours.value
  if (h !== lastTick && h % 2 === 0) { lastTick = h; play('tick') }
  if (progress.value > 85 && !solved.value) {
    solved.value = true
    play('success')
    unlock('root')
  }
}

// 水盆舞台是固定 560×600 的 CSS 画稿，按容器大小等比缩放适配
const wrapEl = ref(null)
const stageScale = ref(1)
let ro = null

function fitStage() {
  const el = wrapEl.value
  if (!el) return
  stageScale.value = Math.min(el.clientWidth / 560, el.clientHeight / 600)
}

onMounted(() => {
  fitStage()
  if (window.ResizeObserver && wrapEl.value) {
    ro = new ResizeObserver(fitStage)
    ro.observe(wrapEl.value)
  }
  window.addEventListener('resize', fitStage)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  window.removeEventListener('resize', fitStage)
})
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
      <!-- 水盆（Claude 纯 CSS 画稿） -->
      <div class="md:col-span-3 paper-card p-3 bg-paper-100">
        <div ref="wrapEl" class="cel-wrap">
          <div class="cel-stage" :class="{ 'is-dyed': leafTinted }" :style="{ '--p': progress / 100, transform: `scale(${stageScale})` }">
            <i class="lt"></i><i class="tb"></i><i class="cs"></i><i class="sh"></i>
            <i class="rm bk"></i><i class="sf"></i><i class="fs"></i>

            <div class="cel">
              <b
                v-for="(s, i) in stalks"
                :key="'s' + i"
                class="sk"
                :class="{ p: s.tinted }"
                :style="{ '--x': s.x + 'px', '--a': s.a + 'deg', '--h': s.h + 'px', '--w': s.w + 'px', '--z': s.z, '--k': s.k }"
              >
                <i></i>
                <i
                  class="dye"
                  :style="{
                    top: Math.round(s.h * (1 - progress / 100)) + 'px',
                    height: Math.round(s.h * progress / 100) + 'px',
                  }"
                ></i>
              </b>
              <i
                v-for="(lf, i) in leaves"
                :key="'l' + i"
                class="lf"
                :style="{ left: lf.l + 'px', top: lf.t + 'px', transform: `rotate(${lf.r}deg)`, zIndex: lf.z }"
              ></i>
            </div>

            <i
              v-for="(pb, i) in pebbles"
              :key="'pb' + i"
              class="pb"
              :style="{ left: pb.l + 'px', top: pb.t + 'px', width: pb.w + 'px', height: pb.h + 'px', filter: pb.hue ? `hue-rotate(${pb.hue}deg)` : 'none' }"
            ></i>

            <i class="wt"></i><i class="sf sg"></i><i class="mn"></i>
            <i v-for="(r, i) in ripples" :key="'r' + i" class="rp" :style="{ '--d': r.d + 's' }"></i>
            <i
              v-for="(b, i) in bubbles"
              :key="'b' + i"
              class="bb"
              :style="{ left: b.l + 'px', top: b.t + 'px', '--s': b.s + 'px', '--d': b.d + 's' }"
            ></i>

            <i class="gl"></i><i class="hl"></i><i class="sn"></i><i class="rm ft"></i>
            <i
              v-for="(d, i) in drops"
              :key="'d' + i"
              class="dr"
              :style="{ left: d.l + 'px', top: d.t + 'px', transform: `scale(${d.s})` }"
            ></i>
            <i class="lf" style="left:96px;top:548px;transform:rotate(-70deg) scale(.7)"></i>
          </div>
        </div>
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

<style scoped>
/* ── 水盆场景：Claude 的纯 CSS 画稿 + 本喵的染色交互 ── */
.cel-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 14 / 15;
  max-height: 44vh;
  margin: 0 auto;
  overflow: hidden;
}
.cel-stage {
  --lf: polygon(50% 100%, 41% 80%, 20% 84%, 27% 66%, 6% 58%, 23% 45%, 10% 29%, 33% 31%, 37% 9%, 50% 19%, 63% 9%, 67% 31%, 90% 29%, 77% 45%, 94% 58%, 73% 66%, 80% 84%, 59% 80%);
  position: absolute;
  left: 0;
  top: 0;
  width: 560px;
  height: 600px;
  transform-origin: 0 0;
  border-radius: 30px;
  overflow: hidden;
  background: linear-gradient(#f7eddc, #ecdcc0 78%);
  box-shadow: 0 24px 56px rgba(50, 30, 10, 0.3);
}
.cel-stage * { position: absolute; }
.cel-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 46%, transparent 56%, rgba(70, 45, 20, 0.2));
}
/* 环境 */
.lt { left: -70px; top: -90px; width: 430px; height: 650px; transform: rotate(-14deg); filter: blur(5px); background: linear-gradient(90deg, transparent 12%, rgba(255,252,236,.55) 12% 40%, transparent 40% 47%, rgba(255,252,236,.42) 47% 75%); -webkit-mask: linear-gradient(#000 25%, transparent 88%); mask: linear-gradient(#000 25%, transparent 88%); }
.tb { left: 0; top: 468px; width: 560px; height: 132px; border-top: 2px solid #ecd2a2; background: repeating-linear-gradient(180deg, rgba(80,48,20,.08) 0 2px, transparent 2px 10px), linear-gradient(#cda274, #b98a57 16%, #a47546 62%, #8b6236); box-shadow: 0 -10px 20px rgba(110,70,30,.22); }
.sh { left: 64px; top: 484px; width: 432px; height: 50px; border-radius: 50%; background: radial-gradient(closest-side, rgba(48,28,10,.6), rgba(48,28,10,.26) 62%, transparent); filter: blur(5px); }
.cs { left: 330px; top: 516px; width: 200px; height: 46px; border-radius: 50%; background: radial-gradient(closest-side, rgba(215,248,252,.8), rgba(150,226,236,.32) 58%, transparent); filter: blur(3px); mix-blend-mode: screen; }
.dr { width: 12px; height: 8px; border-radius: 50%; background: radial-gradient(ellipse at 35% 30%, #fff, rgba(190,230,240,.7) 45%, rgba(100,170,190,.5)); box-shadow: 1px 2px 2px rgba(60,35,10,.35); }
/* 杯口 */
.rm { left: 60px; top: 310px; width: 440px; height: 80px; border-radius: 50%; border: 4px solid rgba(255,255,255,.82); box-shadow: inset 0 0 0 1.5px rgba(100,170,190,.38), 0 0 0 1px rgba(100,170,190,.32); }
.bk { clip-path: inset(-4px -4px 50% -4px); }
.ft { clip-path: inset(50% -4px -4px -4px); }
/* 水面 */
.sf { left: 85px; top: 371px; width: 390px; height: 70px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.55); background: radial-gradient(ellipse at 50% 72%, rgba(196,238,246,.6), rgba(112,192,212,.52) 58%, rgba(58,138,164,.6)); box-shadow: inset 0 4px 9px rgba(24,96,122,.38); }
.sg { background: radial-gradient(ellipse at 38% 22%, rgba(255,255,255,.55), rgba(176,230,242,.2) 58%, rgba(90,168,194,.16)); box-shadow: none; clip-path: inset(50% 0 0 0); }
.fs { left: 224px; top: 476px; width: 112px; height: 16px; border-radius: 50%; background: radial-gradient(closest-side, rgba(20,70,80,.42), transparent); filter: blur(2px); }
/* 芹菜 */
.cel { left: 280px; top: 482px; width: 0; height: 0; isolation: isolate; }
.sk {
  --c1: #64a03a;
  --c2: #9bd062;
  left: calc(var(--x) - var(--w) / 2);
  bottom: 0;
  width: var(--w);
  height: var(--h);
  z-index: var(--z);
  transform-origin: 50% 100%;
  transform: rotate(var(--a));
  border-radius: 15px 15px 7px 7px / 28px 28px 7px 7px;
  background:
    linear-gradient(0deg, rgba(238,247,204,.85), transparent 24%),
    linear-gradient(90deg, transparent 18%, rgba(255,255,255,.3) 30%, transparent 44%),
    repeating-linear-gradient(90deg, transparent 0 4px, rgba(36,90,32,.34) 4px 5.5px, transparent 5.5px 9px),
    linear-gradient(90deg, var(--c1), var(--c2) 42%, var(--c1));
  box-shadow: inset 3px 0 5px rgba(0,60,20,.2), inset -4px 0 6px rgba(0,50,10,.24);
  filter: drop-shadow(2px 3px 2px rgba(28,66,18,.38));
}
.p { --c1: #9bc65e; --c2: #cbe590; }
.sk i, .sk::before, .sk::after, .lf {
  background: linear-gradient(90deg, transparent 47%, rgba(222,244,168,.62) 47% 53%, transparent 53%), radial-gradient(ellipse at 50% 88%, #92c95c, #4f8f32 62%, #38742a);
  clip-path: var(--lf);
}
.sk i { width: 84px; height: 94px; left: 50%; margin-left: -42px; bottom: 100%; margin-bottom: -18px; transform: rotate(calc(var(--a) * -0.55)) scale(var(--k, 1)); transform-origin: 50% 100%; }
.sk::before, .sk::after { content: ""; position: absolute; width: 58px; height: 64px; bottom: 100%; margin-bottom: -46px; }
.sk::before { left: -34px; transform: rotate(-44deg); }
.sk::after { right: -34px; transform: rotate(44deg); }
.lf { width: 70px; height: 78px; }
/* ★ 染色层：蓝色色素随进度从茎底往上爬
   踩坑记录：在这个「零尺寸锚点 + 向上生长」的绝对定位结构里，
   height: calc(var(--h) * var(--p)) 与 transform: scaleY(var(--p))
   都会被算成 0 / identity（内联 !important 也压不住）。
   所以 top 与 height 两个像素值全部由 Vue 内联写死，不留解析余地。 */
.sk i.dye {
  width: auto;
  height: auto;
  left: 0;
  right: 0;
  bottom: auto;
  margin: 0;
  transform: none;
  transform-origin: 50% 100%;
  clip-path: none;
  border-radius: inherit;
  background: linear-gradient(0deg, rgba(37, 99, 235, 0.9), rgba(59, 130, 246, 0.7) 55%, rgba(96, 165, 250, 0.32));
  pointer-events: none;
  z-index: 6;
}
/* ★ 叶片也跟着被染蓝（:not(.dye) 排除染色层本身） */
.cel-stage.is-dyed .lf,
.cel-stage.is-dyed .sk i:not(.dye) {
  background: linear-gradient(90deg, transparent 47%, rgba(190,225,255,.55) 47% 53%, transparent 53%), radial-gradient(ellipse at 50% 88%, #6fb0ea, #3b74c4 62%, #2a558f);
}
/* 水下 */
.pb { border-radius: 50%; background: radial-gradient(ellipse at 35% 30%, #fff, #cfd8dc 40%, #8e9aa3); box-shadow: 0 2px 3px rgba(20,60,70,.35); }
.wt { left: 66px; top: 206px; width: 428px; height: 288px; border-radius: 50%; clip-path: inset(200px 0 0 0); background: linear-gradient(180deg, transparent 69.4%, rgba(210,242,248,.52) 69.4%, rgba(125,205,225,.5) 78%, rgba(60,155,185,.58) 92%, rgba(28,108,138,.72)); backdrop-filter: saturate(1.2) blur(.7px); }
.mn { left: 190px; top: 395px; width: 180px; height: 26px; border: 2px solid rgba(255,255,255,.7); border-radius: 50%; box-shadow: 0 0 7px rgba(255,255,255,.6), inset 0 0 7px rgba(255,255,255,.45); }
.rp { left: 180px; top: 390px; width: 200px; height: 36px; border: 1.5px solid rgba(255,255,255,.75); border-radius: 50%; animation: rp 4.2s ease-out infinite; animation-delay: var(--d); }
.bb { width: var(--s); height: var(--s); border-radius: 50%; background: radial-gradient(circle at 32% 30%, #fff, rgba(255,255,255,.2) 55%, rgba(255,255,255,.6)); border: 1px solid rgba(255,255,255,.6); animation: bb 5s ease-in infinite; animation-delay: var(--d); }
@keyframes rp { 0% { transform: scale(.3); opacity: 0; } 20% { opacity: .85; } 100% { transform: scale(1.8); opacity: 0; } }
@keyframes bb { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-46px); opacity: 0; } }
/* 玻璃 */
.gl { left: 60px; top: 200px; width: 440px; height: 300px; border-radius: 50%; clip-path: inset(150px 0 0 0); -webkit-mask: radial-gradient(ellipse 217px 38px at 50% 150px, transparent 98.5%, #000 100%); mask: radial-gradient(ellipse 217px 38px at 50% 150px, transparent 98.5%, #000 100%); border: 3px solid rgba(255,255,255,.7); background: radial-gradient(ellipse 46% 12% at 50% 94%, rgba(255,255,255,.4), transparent), linear-gradient(90deg, rgba(255,255,255,.5), rgba(255,255,255,.06) 15%, rgba(255,255,255,.03) 85%, rgba(255,255,255,.44)); box-shadow: inset 0 -16px 28px rgba(120,205,225,.32), inset 0 0 0 6px rgba(150,208,224,.16); }
.hl { left: 72px; top: 212px; width: 416px; height: 276px; border-radius: 50%; border: 6px solid transparent; border-left-color: rgba(255,255,255,.85); border-right-color: rgba(255,255,255,.34); clip-path: inset(176px 0 30px 0); filter: blur(.5px); }
.sn { left: 108px; top: 418px; width: 12px; height: 56px; border-radius: 8px; background: linear-gradient(rgba(255,255,255,.75), transparent); transform: rotate(16deg); filter: blur(1.2px); }
@media (prefers-reduced-motion: reduce) {
  .rp, .bb { animation: none !important; }
}
</style>
