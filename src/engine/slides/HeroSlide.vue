<script setup>
import { ref } from 'vue'
import { useDeckState } from '../composables/useDeckState'
import { useSound } from '../composables/useSound'
import { useAI } from '../composables/useAI'

const props = defineProps({ data: { type: Object, required: true } })
const state = useDeckState()
const { play } = useSound()
const { authorize } = useAI()

const nameInput = ref('')
const pinInput = ref('')
const pinMsg = ref('')
const pinState = ref('') // '', 'ok', 'warn'
const pinDone = ref(false)
const authBusy = ref(false)
const IS_OFFLINE = __OFFLINE__

function confirmEntry() {
  state.detectiveName = nameInput.value.trim() || '枫叶侦探小明'
  state.registered = true
  play('success')
}

async function activate() {
  const v = pinInput.value.trim()
  if (!v) {
    pinMsg.value = 'ℹ️ 未输入编号，AI 对话暂不可用（其他环节照常玩）'
    pinState.value = 'warn'
    return
  }
  authBusy.value = true
  const ok = await authorize(v)
  authBusy.value = false
  if (ok) {
    state.authorized = true
    state.pin = v
    pinDone.value = true
    pinMsg.value = '🔓 小绿 AI 已激活，可以开始实时问答啦！'
    pinState.value = 'ok'
  } else {
    state.authorized = false
    state.pin = ''
    pinMsg.value = '❌ 编号不对，AI 暂未解锁（其他环节照常玩）'
    pinState.value = 'warn'
  }
}
</script>

<template>
  <div class="px-6 text-center max-w-5xl mx-auto w-full">
    <!-- 装备包装饰贴纸（预留） -->
    <div v-if="data.equipment.img" class="absolute -top-4 left-4 lg:left-12 hidden md:block w-32 h-32 pointer-events-none z-20 animate-float">
      <img :src="data.equipment.img" :alt="data.equipment.title" class="w-full h-full object-contain" />
    </div>

    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-botanical-100 border-2 border-botanical-700 text-botanical-900 text-xs font-bold mb-6 shadow-[2px_2px_0px_#1b3022]">
      <span>{{ data.badge }}</span>
    </div>

    <h1 class="font-cute font-black text-5xl sm:text-7xl md:text-8xl text-botanical-900 tracking-tight mb-6 leading-none">
      {{ data.title }}
    </h1>

    <p class="max-w-2xl mx-auto text-base sm:text-xl text-bark-800 font-medium mb-10 leading-relaxed">
      {{ data.subtitle }}
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto text-left items-stretch">
      <!-- 装备包插画卡 -->
      <div class="paper-card p-5 bg-paper-100 flex flex-col justify-between relative overflow-hidden">
        <div class="flex items-center justify-between mb-2">
          <span class="tag-stamp text-[10px] font-cute">{{ data.equipment.label }}</span>
          <span class="text-[10px] font-bold text-autumn-600 bg-autumn-400/20 px-2 py-0.5 rounded">AI画框图画</span>
        </div>
        <div class="relative w-full h-40 rounded-xl overflow-hidden border-2 border-dashed border-bark-800 bg-paper-200 flex flex-col items-center justify-center p-2 text-center my-2">
          <img v-if="data.equipment.img" :src="data.equipment.img" :alt="data.equipment.title" class="w-full h-full object-cover rounded-lg" />
          <p v-else class="text-[10px] text-bark-800/50 font-bold leading-tight px-2">🖼️ 插图待生成<br />{{ data.equipment.prompt }}</p>
        </div>
        <p class="text-[11px] font-bold text-bark-800/80 text-center">{{ data.equipment.note }}</p>
      </div>

      <!-- 报到登记卡 -->
      <div class="paper-card p-6 sm:p-8 text-left relative overflow-hidden flex flex-col justify-between">
        <div class="flex items-center gap-2 mb-3">
          <span class="tag-stamp text-xs font-cute">{{ data.form.step }}</span>
          <h3 class="font-cute font-bold text-lg text-botanical-900">{{ data.form.title }}</h3>
        </div>
        <p class="text-xs text-bark-800/80 mb-4 font-medium">{{ data.form.hint }}</p>

        <div class="space-y-3">
          <div class="flex gap-2">
            <input
              v-model="nameInput"
              type="text"
              :placeholder="data.form.namePlaceholder"
              class="flex-1 px-4 py-2.5 rounded-xl border-2 border-bark-800 bg-paper-50 text-botanical-900 font-bold focus:outline-none focus:ring-2 focus:ring-autumn-500 text-sm"
              @keydown.enter="confirmEntry"
            />
            <button class="px-5 py-2.5 rounded-xl bg-botanical-700 hover:bg-botanical-800 text-paper-50 font-bold text-sm shadow-[3px_3px_0px_#3d2612] transition shrink-0" @click="confirmEntry">
              {{ data.form.confirm }}
            </button>
          </div>

          <!-- PIN 认证（离线版隐藏） -->
          <template v-if="!IS_OFFLINE">
            <div class="flex gap-2 items-center">
              <input
                v-model="pinInput"
                type="password"
                inputmode="numeric"
                :disabled="pinDone"
                :placeholder="data.form.pinPlaceholder"
                class="flex-1 px-4 py-2.5 rounded-xl border-2 border-bark-800 bg-paper-50 text-botanical-900 font-bold focus:outline-none focus:ring-2 focus:ring-autumn-500 text-sm disabled:opacity-60"
                @keydown.enter="activate"
              />
              <button
                type="button"
                :disabled="pinDone || authBusy"
                class="px-4 py-2.5 rounded-xl bg-autumn-500 hover:bg-autumn-600 text-paper-50 font-bold text-xs shadow-[3px_3px_0px_#3d2612] transition shrink-0 disabled:opacity-60"
                @click="activate"
              >
                {{ pinDone ? '已激活 ✓' : data.form.pinButton }}
              </button>
            </div>
            <div v-if="pinMsg" class="text-[11px] font-bold" :class="pinState === 'ok' ? 'text-botanical-700' : 'text-autumn-600'">
              {{ pinMsg }}
            </div>
          </template>

          <div v-if="state.registered" class="text-xs text-botanical-700 font-bold flex items-center gap-1 pt-1">
            <span>✅</span> {{ data.form.success }}
          </div>
        </div>
      </div>
    </div>

    <a href="#case-1" class="mt-12 inline-flex flex-col items-center gap-2 text-xs font-bold text-botanical-700 hover:text-autumn-500 transition" @click.prevent="void 0">
      <span>{{ data.scrollHint }}</span>
      <div class="w-6 h-10 rounded-full border-2 border-bark-800 flex justify-center pt-2 bg-paper-50 shadow-[2px_2px_0px_#3d2612]">
        <div class="w-1.5 h-2.5 bg-autumn-500 rounded-full animate-bounce"></div>
      </div>
    </a>
  </div>
</template>
