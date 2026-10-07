<script setup>
import { ref, nextTick } from 'vue'
import { useDeckState } from '../composables/useDeckState'
import { useSound } from '../composables/useSound'
import { useAI, localFallback } from '../composables/useAI'

const props = defineProps({ data: { type: Object, required: true } })
const state = useDeckState()
const { play } = useSound()
const { ask } = useAI()

const messages = ref([{ role: 'bot', text: props.data.greeting }])
const input = ref('')
const thinking = ref(false)
const winEl = ref(null)
const IS_OFFLINE = __OFFLINE__

async function scrollBottom() {
  await nextTick()
  if (winEl.value) winEl.value.scrollTop = winEl.value.scrollHeight
}

async function send(q) {
  const query = (q ?? input.value).trim()
  if (!query || thinking.value) return

  // 在线版未认证：不发问，只提示去激活
  if (!__OFFLINE__ && !state.authorized) {
    messages.value.push({ role: 'user', text: query })
    input.value = ''
    messages.value.push({ role: 'bot', text: '（小绿还在睡觉呢～请先在页面顶部「侦探报到登记」处输入认证编号并点「激活小绿」，我才能醒来回答问题哦）' })
    await scrollBottom()
    return
  }

  messages.value.push({ role: 'user', text: query })
  input.value = ''
  thinking.value = true
  await scrollBottom()

  let answer = null
  if (!__OFFLINE__ && state.authorized) {
    answer = await ask(query, state.pin)
  }
  if (!answer) answer = localFallback(query)

  thinking.value = false
  messages.value.push({ role: 'bot', text: answer })
  play('pop')
  await scrollBottom()
}

// 仅在线版未认证时锁住对话区；离线版直接用本地知识库
function locked() {
  return !__OFFLINE__ && !state.authorized
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 w-full">
    <div class="paper-card p-6 sm:p-8 relative">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <!-- 头像 + 预设 -->
        <div class="lg:col-span-5 flex flex-col items-center text-center">
          <div class="relative mb-3">
            <div class="w-24 h-24 rounded-full bg-botanical-100 border-2 border-bark-800 flex items-center justify-center p-2 shadow-[4px_4px_0px_#3d2612] animate-float">
              <img v-if="data.avatarImg" :src="data.avatarImg" class="w-full h-full object-contain" />
              <span v-else class="text-4xl">🌱</span>
            </div>
          </div>

          <h3 class="font-cute font-black text-2xl text-botanical-900">{{ data.name }}</h3>
          <p class="text-xs text-bark-800/80 font-semibold mt-1 max-w-xs">{{ data.desc }}</p>

          <div class="w-full mt-4 space-y-2 text-left">
            <span class="text-[10px] font-bold text-autumn-500 uppercase tracking-widest block">{{ data.quickLabel }}</span>
            <button
              v-for="(q, i) in data.presets"
              :key="i"
              class="w-full text-left p-2.5 rounded-xl bg-paper-100 hover:bg-paper-200 border border-bark-800 text-xs font-bold text-botanical-900 transition flex items-center gap-2"
              @click="send(q)"
            >
              <span>❓</span> {{ q }}
            </button>
          </div>
        </div>

        <!-- 对话窗 -->
        <div class="lg:col-span-7 bg-paper-100 border-2 border-bark-800 rounded-2xl p-4 flex flex-col h-[380px] relative">
          <!-- 未授权遮罩（仅在线版未认证时） -->
          <div v-if="locked()" class="absolute inset-0 z-30 bg-paper-100/95 rounded-2xl flex flex-col items-center justify-center text-center px-6 gap-2">
            <div class="text-4xl">🔒</div>
            <p class="font-cute font-bold text-botanical-900 text-lg">{{ data.lockedTitle }}</p>
            <p class="text-xs text-bark-800/80 font-semibold leading-relaxed max-w-xs">{{ data.lockedBody }}</p>
          </div>

          <p v-if="IS_OFFLINE" class="text-[10px] font-bold text-botanical-700 bg-botanical-100 border border-botanical-700/30 rounded-lg px-2 py-1 mb-2">
            {{ data.offlineNote }}
          </p>

          <div ref="winEl" class="flex-1 overflow-y-auto space-y-3 pr-2">
            <div v-for="(m, i) in messages" :key="i" class="flex items-start gap-2.5" :class="m.role === 'user' ? 'flex-row-reverse' : ''">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-bark-800" :class="m.role === 'user' ? 'bg-autumn-500 text-paper-50' : 'bg-botanical-700 text-paper-50'">
                {{ m.role === 'user' ? '🕵️' : '🌱' }}
              </div>
              <div
                class="p-3 rounded-2xl border-2 border-bark-800 text-xs sm:text-sm font-semibold max-w-[85%] leading-relaxed shadow-[2px_2px_0px_#3d2612]"
                :class="m.role === 'user' ? 'bg-autumn-400/20 text-botanical-900 rounded-tr-none' : 'bg-paper-50 text-botanical-900 rounded-tl-none'"
              >
                {{ m.text }}
              </div>
            </div>
            <div v-if="thinking" class="flex items-start gap-2.5">
              <div class="w-8 h-8 rounded-full bg-botanical-700 text-paper-50 flex items-center justify-center text-sm font-bold shrink-0 border border-bark-800">🌱</div>
              <div class="bg-paper-50 border-2 border-bark-800 p-3 rounded-2xl rounded-tl-none text-xs text-botanical-900/60">{{ data.thinking }}</div>
            </div>
          </div>

          <form class="mt-3 pt-3 border-t-2 border-bark-800/10 flex gap-2" @submit.prevent="send()">
            <input
              v-model="input"
              type="text"
              :placeholder="data.inputPlaceholder"
              class="flex-1 px-4 py-2.5 rounded-xl bg-paper-50 border-2 border-bark-800 text-xs sm:text-sm font-bold text-botanical-900 focus:outline-none focus:ring-2 focus:ring-autumn-500"
            />
            <button type="submit" class="px-4 py-2.5 rounded-xl bg-autumn-500 hover:bg-autumn-600 text-paper-50 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#3d2612] transition shrink-0">
              {{ data.send }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
