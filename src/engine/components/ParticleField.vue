<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// 背景落叶粒子（Canvas）。离线版同样保留（纯本地，无网络依赖）。
const canvasEl = ref(null)
let ctx = null
let raf = null
let particles = []
let w = 0
let h = 0

function resize() {
  const c = canvasEl.value
  if (!c) return
  w = c.width = window.innerWidth
  h = c.height = window.innerHeight
}

class Leaf {
  constructor() {
    this.reset(true)
  }
  reset(init) {
    this.x = Math.random() * w
    this.y = init ? Math.random() * h : -20
    this.size = Math.random() * 8 + 6
    this.sx = Math.random() * 2 - 1
    this.sy = Math.random() * 1.5 + 0.8
    this.rot = Math.random() * 360
    this.rs = Math.random() * 2 - 1
    this.color = ['#fb8b24', '#e36414', '#9a031e', '#4e8760'][Math.floor(Math.random() * 4)]
  }
  update() {
    this.x += this.sx + Math.sin(this.y * 0.02) * 0.5
    this.y += this.sy
    this.rot += this.rs
    if (this.y > h + 20) this.reset(false)
  }
  draw() {
    if (!ctx) return
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate((this.rot * Math.PI) / 180)
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function loop() {
  if (ctx) {
    ctx.clearRect(0, 0, w, h)
    particles.forEach((p) => { p.update(); p.draw() })
  }
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  const c = canvasEl.value
  if (!c) return
  ctx = c.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  particles = Array.from({ length: 18 }, () => new Leaf())
  loop()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <canvas ref="canvasEl" class="fixed inset-0 pointer-events-none z-0 opacity-60"></canvas>
</template>
