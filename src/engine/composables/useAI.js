// 小绿 AI 接入（离线版构建时整体禁用，只走本地知识库）

// 本地兜底知识库（离线可用）
export const LOCAL_KB = {
  向日葵: '小向日葵花盘下方的茎生长素怕光，背光侧长得快，就把花盘顶向太阳啦！但成熟开花后就不转了，一直朝东边。',
  睡觉: '是的！很多植物晚上会“睡觉”。比如合欢树和合掌草，晚上叶子会合拢，减少水分蒸发和热量散失。',
  捕蝇草: '捕蝇草的叶子像带刺的小夹子，上面有敏感的触发毛。只要虫子连续碰到两次触发毛，夹子就会在0.1秒内猛地关上！',
}

export function localFallback(query) {
  for (const key in LOCAL_KB) {
    if (query.includes(key)) return LOCAL_KB[key]
  }
  return `关于“${query}”，小绿探长笔记记录：植物的世界充满适应生存环境的奇妙智慧！课后你可以和爸爸妈妈一起查查植物图鉴哦！`
}

export function useAI() {
  // 认证：把编号发给后端 /api/auth 比对（PIN 不落前端）
  async function authorize(pin) {
    if (__OFFLINE__) return false
    try {
      const resp = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await resp.json()
      return !!(data && data.authorized)
    } catch {
      return false
    }
  }

  // 提问：走 /api/chat，失败返回 null（由调用方降级本地库）
  async function ask(message, pin) {
    if (__OFFLINE__) return null
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, pin }),
      })
      if (!resp.ok) throw new Error('bad status ' + resp.status)
      const data = await resp.json()
      return (data && data.reply) || null
    } catch (e) {
      console.warn('AI 调用失败，降级本地知识库：', e)
      return null
    }
  }

  return { authorize, ask }
}
