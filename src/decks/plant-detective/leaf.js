// 案件一：叶子为什么变黄了
export default {
  id: 'case-1',
  type: 'leaf',
  fit: 'screen',
  nav: '1. 叶黄谜案',
  data: {
    tag: 'CASE #01',
    title: '案件一：叶子为什么变黄了？',
    time: '⏱ 建议破案时间：10 分钟',
    viewLabel: '🔬 显微透视视角：阳光厨房原理',
    stages: [
      { label: '盛夏状态 (阳光厨房全开)', credit: '盛夏状态 (厨房全开)', stop1: '#345e41', stop2: '#1b3022', chef: 1, sun: 1, yellow: 0 },
      { label: '初秋过渡 (叶绿素准备退场)', credit: '初秋过渡 (叶绿素退场)', stop1: '#e36414', stop2: '#4e8760', chef: 0.5, sun: 0.7, yellow: 0.5 },
      { label: '深秋金黄 (胡萝卜素全面亮相)', credit: '深秋金黄 (胡萝卜素登场)', stop1: '#fb8b24', stop2: '#e36414', chef: 0, sun: 0.2, yellow: 1 },
    ],
    sliderLeft: '🌱 盛夏 (光照强/温度高)',
    sliderRight: '🍂 深秋 (天冷/光照少)',
    sticker: { img: null, label: '🎨 无框贴纸：叶子厨师' },
    illustration: {
      title: '🖼️ AI插画：叶绿素厨师做阳光能量面包',
      img: null,
      prompt: 'Cute leaf shaped chef baking sunlight in a forest kitchen, fairytale picture book illustration',
    },
    notesTitle: '💡 破案侦探笔记：',
    notes: [
      '树叶是植物的**阳光厨房**，绿色的叶绿素像厨师一样用阳光制作能量食物。',
      '到了深秋，天冷光照变少，**厨房**决定打烊休息，叶绿素慢慢退场分解。',
      '一直藏在叶子里的黄色素（胡萝卜素/叶黄素）显露出来，叶子就变黄脱落啦！',
    ],
    microTitle: '互动微小实验',
    microQuestion: '点击让叶片气孔（Stomata）进行呼吸：',
    microButton: '气孔呼吸 💨',
    microAnswer: '🍃 叶片背面的微小孔隙像鼻孔一样吸入二氧化碳、呼出氧气，还能蒸发水分！',
  },
}
