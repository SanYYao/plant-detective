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

// 尚未归位的食物 id
const remaining = ref(props.data.foods.map((f) => f.id))
// 各篮子已收集
const placed = ref(Object.fromEntries(props.data.baskets.map((b) => [b.id, []])))
const selected = ref(null)
const flashWrong = ref(null)

const foodsById = computed(() => Object.fromEntries(props.data.foods.map((f) => [f.id, f])))
const done = computed(() => remaining.value.length === 0)

function place(organ) {
  if (!selected.value) return
  const food = foodsById.value[selected.value]
  if (!food) return
  if (food.organ === organ) {
    placed.value[organ].push(food)
    remaining.value = remaining.value.filter((id) => id !== food.id)
    selected.value = null
    play('pop')
    if (done.value) {
      state.solved.breakfast = true
      unlock('breakfast')
      play('success')
    }
  } else {
    flashWrong.value = organ
    setTimeout(() => (flashWrong.value = null), 500)
  }
}

function pick(id) {
  selected.value = selected.value === id ? null : id
  play('pop')
}

// 拖拽
function onDragStart(e, id) {
  selected.value = id
  e.dataTransfer.setData('text/plain', id)
  e.dataTransfer.effectAllowed = 'move'
}
function onDrop(e, organ) {
  e.preventDefault()
  const id = e.dataTransfer.getData('text/plain') || selected.value
  if (!id) return
  selected.value = id
  place(organ)
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
        <span class="text-xs font-bold text-botanical-700 bg-botanical-100 px-3 py-1 rounded-full border border-botanical-700/30">
          {{ data.hint }}
        </span>
      </div>

      <p class="text-xs sm:text-sm text-bark-800 font-semibold mb-5">{{ data.intro }}</p>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <!-- 食物托盘 -->
        <div class="lg:col-span-4 paper-card-sm p-4 bg-paper-100 space-y-2">
          <h3 class="text-xs font-bold text-autumn-500 uppercase tracking-wider">{{ data.trayTitle }}</h3>
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <div
              v-for="f in data.foods.filter((x) => remaining.includes(x.id))"
              :key="f.id"
              draggable="true"
              class="drag-food-item paper-card-sm p-2.5 text-xs font-bold text-botanical-900 flex items-center justify-between transition"
              :class="selected === f.id ? 'ring-4 ring-autumn-500' : 'hover:border-autumn-500'"
              @click="pick(f.id)"
              @dragstart="onDragStart($event, f.id)"
            >
              <span>{{ f.label }}</span>
              <span class="text-[10px] bg-autumn-400/20 text-autumn-600 px-1.5 py-0.5 rounded">{{ f.chip }}</span>
            </div>
          </div>
          <p v-if="remaining.length === 0" class="text-xs font-bold text-botanical-700 py-2 text-center">🍽️ 配餐盘已空</p>
        </div>

        <!-- 器官篮子 -->
        <div class="lg:col-span-8 grid grid-cols-2 gap-3">
          <div
            v-for="b in data.baskets"
            :key="b.id"
            class="paper-card-sm p-3 min-h-[140px] flex flex-col justify-between transition"
            :class="flashWrong === b.id ? 'bg-autumn-400/30 border-autumn-500' : 'bg-paper-50 border-2 border-dashed border-bark-800'"
            @dragover.prevent
            @drop="onDrop($event, b.id)"
            @click="place(b.id)"
          >
            <div class="flex items-center justify-between border-b border-bark-800/10 pb-1.5">
              <span class="font-cute font-black text-sm text-botanical-900">{{ b.label }}</span>
              <span class="text-[10px] text-bark-800/60 font-bold">{{ b.role }}</span>
            </div>
            <div class="space-y-1.5 my-2">
              <div v-for="f in placed[b.id]" :key="f.id" class="text-xs font-bold bg-botanical-700 text-paper-50 px-2.5 py-1 rounded-lg">
                ✅ {{ f.label }}
              </div>
            </div>
            <span class="text-[10px] text-center text-bark-800/40 font-bold block">{{ data.dropHint }}</span>
          </div>
        </div>
      </div>

      <div v-if="done" class="mt-5 flex items-center gap-4 p-3 rounded-xl bg-botanical-100 border-2 border-botanical-700 text-botanical-900 font-bold text-sm animate-bounce">
        <div v-if="data.sticker && data.sticker.img" class="w-16 h-16 rounded-full overflow-hidden border-2 border-bark-800 shrink-0">
          <img :src="data.sticker.img" class="w-full h-full object-cover" />
        </div>
        <p class="flex-1 text-left">{{ data.success }}</p>
      </div>
    </div>
  </div>
</template>
