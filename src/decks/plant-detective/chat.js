// 社长小绿：AI 问答
export default {
  id: 'chat',
  type: 'chat',
  fit: 'screen',
  nav: '5. 问社长',
  data: {
    avatarImg: null,
    avatarLabel: '🎨 社长小绿形象贴纸',
    name: '社长 · 小绿',
    desc: '三年级植物百科答疑组！有任何不懂的植物好奇心，都可以问我。',
    quickLabel: '快捷提问点选：',
    presets: [
      '为什么向日葵会跟着太阳转？',
      '植物晚上也要睡觉吗？',
      '捕蝇草是怎么夹住虫子的？',
    ],
    greeting: '小侦探你好！我是社长小绿。今天关于植物有什么好奇的？点左边的问题，或者输入框问我吧！',
    inputPlaceholder: '输入你想问小绿的植物问题...',
    send: '发送 🚀',
    thinking: '小绿正在思考…',
    lockedTitle: '小绿 AI 未激活',
    lockedBody: '回到页面顶部「侦探报到登记」处输入小绿认证编号，点「激活小绿」即可解锁实时问答。未输入也不影响其他探案环节哦～',
    offlineNote: '本机为离线版：小绿只答本地知识库里的问题。',
  },
}
