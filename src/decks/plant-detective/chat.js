// 社长小绿：AI 问答
import seniorGreen from '../../assets/lesson/senior-green.jpeg'

export default {
  id: 'chat',
  type: 'chat',
  fit: 'screen',
  nav: '6. 问社长',
  data: {
    avatarImg: seniorGreen,
    name: '社长 · 小绿',
    desc: '三年级植物百科小助手！点下面的问题，小绿离线也能答～',
    quickLabel: '快捷提问点选：',
    presets: [
      '为什么向日葵会跟着太阳转？',
      '植物晚上也要睡觉吗？',
      '捕蝇草是怎么夹住虫子的？',
      '秋天的叶子为什么会变黄？',
      '蒲公英是怎么传播种子的？',
      '我们吃的红薯和土豆是什么部位？',
    ],
    greeting: '小侦探你好！我是社长小绿。今天关于植物有什么好奇的？点左边的问题，或者输入框问我吧！',
    inputPlaceholder: '输入你想问小绿的植物问题...',
    send: '发送 🚀',
    thinking: '小绿正在思考…',
    lockedTitle: '小绿 AI 未激活',
    lockedBody: '回到页面顶部「侦探报到登记」处输入小绿认证编号，点「激活小绿」即可解锁实时问答。未输入也不影响其他探案环节哦～',
    offlineNote: '小绿是本地植物小百科，不联网也能聊，教室断网也能用～',
  },
}
