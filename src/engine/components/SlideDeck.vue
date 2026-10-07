<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TopNav from './TopNav.vue'

const props = defineProps({
  slides: { type: Array, required: true },
  registry: { type: Object, required: true }, // type -> 组件
  meta: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['change'])

const deckEl = ref(null)
const current = ref(0)
const navVisible = ref(true)
const showDebug = ref(false)
const viewport = ref({ w: 0, h: 0 })

let lastTop = 0
let idleTimer = null

function slideNodes() {
  const el = deckEl.value
  return el ? Array.from(el.querySelectorAll('.slide')) : []
}

function setNav(v) {
  if (navVisible.value !== v) navVisible.value = v
}

function bumpIdle() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => setNav(false), 2600)
}

function computeCurrent() {
  const el = deckEl.value
  if (!el) return
  const center = el.scrollTop + el.clientHeight / 2
  let best = 0
  let bestDist = Infinity
  slideNodes().forEach((s, i) => {
    const c = s.offsetTop + s.offsetHeight / 2
    const d = Math.abs(c - center)
    if (d < bestDist) { bestDist = d; best = i }
  })
  if (best !== current.value) {
    current.value = best
    emit('change', best)
  }
}

function onScroll() {
  const el = deckEl.value
  if (!el) return
  const top = el.scrollTop
  if (top > lastTop + 4) setNav(false)
  else if (top < lastTop - 4) setNav(true)
  lastTop = top
  bumpIdle()
  computeCurrent()
}

// 翻页滚动：scroll-snap 容器里 scrollIntoView({behavior:'smooth'}) 会被浏览器吃掉，
// 所以动画期间临时关掉 snap；并用定时器轮询兜底（不依赖 rAF——标签页不可见时 rAF 会冻结）。
function smoothScrollTo(el, dest, dur = 600) {
  const start = el.scrollTop
  if (Math.abs(dest - start) < 2) return
  el.style.scrollSnapType = 'none'
  let settled = false
  const settle = () => {
    if (settled) return
    settled = true
    if (Math.abs(el.scrollTop - dest) > 2) el.scrollTop = dest
    el.style.scrollSnapType = ''
    computeCurrent()
  }
  try {
    el.scrollTo({ top: dest, behavior: 'smooth' })
  } catch {
    el.scrollTop = dest
  }
  const t0 = Date.now()
  const poll = setInterval(() => {
    if (settled) { clearInterval(poll); return }
    if (Math.abs(el.scrollTop - dest) <= 2 || Date.now() - t0 > dur) {
      clearInterval(poll)
      settle()
    }
  }, 50)
}

function goTo(i) {
  const el = deckEl.value
  if (!el) return
  const nodes = slideNodes()
  const idx = Math.max(0, Math.min(i, nodes.length - 1))
  const target = nodes[idx]
  if (!target) return
  smoothScrollTo(el, target.offsetTop)
}

function next() { goTo(current.value + 1) }
function prev() { goTo(current.value - 1) }

function onKey(e) {
  const tag = (e.target.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea') return
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next() }
  else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); prev() }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0) }
  else if (e.key === 'End') { e.preventDefault(); goTo(props.slides.length - 1) }
  else if (e.key === 'd' || e.key === 'D') { showDebug.value = !showDebug.value }
}

function onResize() {
  viewport.value = { w: window.innerWidth, h: window.innerHeight }
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKey)
  requestAnimationFrame(computeCurrent)
  bumpIdle()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKey)
  clearTimeout(idleTimer)
})

defineExpose({ goTo, current })
</script>

<template>
  <div class="deck" ref="deckEl" @scroll.passive="onScroll">
    <TopNav
      :slides="slides"
      :current="current"
      :visible="navVisible"
      :meta="meta"
      @go="goTo"
    />

    <section
      v-for="(s, i) in slides"
      :key="s.id"
      class="slide"
      :class="{ 'slide--flow': s.fit === 'flow' }"
      :data-slide="s.id"
    >
      <component :is="registry[s.type]" :data="s.data" :slide-id="s.id" />
    </section>

    <!-- 尺寸自检（按 D 键切换）：到教室后一键查看实际视口 -->
    <div
      v-if="showDebug"
      class="fixed bottom-3 left-3 z-50 bg-bark-800/90 text-paper-50 text-xs font-bold px-3 py-2 rounded-lg pointer-events-none"
    >
      视口 {{ viewport.w }} × {{ viewport.h }} · 第 {{ current + 1 }}/{{ slides.length }} 段
    </div>
  </div>
</template>
