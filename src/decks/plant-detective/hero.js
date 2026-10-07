// 第一页：报到登记
export default {
  id: 'hero',
  type: 'hero',
  fit: 'screen',
  data: {
    badge: '🔍 小学科学三级上册 · 45分钟观察与推理手记课件',
    title: '秋天植物侦探社',
    subtitle: '自然是最好的探案现场。用放大镜观察叶片厨房，去早饭里找器官，破解种子的无声旅行法！',
    equipment: {
      label: 'EQUIPMENT',
      title: '植物侦探出勤装备包',
      img: null,
      note: '🖼️ 插画占位：植物侦探出勤装备包',
      prompt: 'Cute watercolor illustration of detective tools, magnifying glass, leaf notebook, acorn badge, autumn colors, hand-drawn vector sticker, white background',
    },
    form: {
      step: 'STEP 01',
      title: '侦探报到登记',
      hint: '输入你的侦探名字，领取今日探案工具与手记：',
      namePlaceholder: '例如：枫叶侦探小明',
      confirm: '领证受命 🚀',
      pinPlaceholder: '小绿认证编号（选填）',
      pinButton: '激活小绿 🔑',
      success: '登记成功！侦探案件卷宗已解锁，向下滑动开始破案。',
    },
    scrollHint: '滑动展开：案件一 · 变黄的叶子',
  },
}
