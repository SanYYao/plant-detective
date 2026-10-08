// 案件二：早饭里的植物器官（拖拽/点击匹配）
import foxPicnic from '../../assets/lesson/fox-picnic.webp'

export default {
  id: 'case-2',
  type: 'breakfast',
  fit: 'screen',
  nav: '2. 早餐器官',
  data: {
    tag: 'CASE #02',
    title: '案件二：我早饭里的植物部位',
    hint: '手指拖拽或点击归位',
    intro: '今天的早餐桌上有 6 样美味食物！请将食物拖拽（或点击选择）到正确的植物器官篮子里：',
    trayTitle: '早餐配餐盘（点击或拖动）',
    foods: [
      { id: 'bread', label: '🍞 馒头 (小麦)', organ: 'seed', chip: '种子' },
      { id: 'soy', label: '🥛 豆浆 (黄豆)', organ: 'seed', chip: '种子' },
      { id: 'veg', label: '🥬 炒青菜', organ: 'leaf', chip: '叶' },
      { id: 'fries', label: '🥔 薯条 (土豆)', organ: 'stem', chip: '茎' },
      { id: 'sweet', label: '🍠 烤红薯', organ: 'root', chip: '根' },
      { id: 'peanut', label: '🥜 水煮花生', organ: 'seed', chip: '种子' },
    ],
    baskets: [
      { id: 'root', label: '🪴 根 (Root)', role: '吸收与固定' },
      { id: 'stem', label: '🎋 茎 (Stem)', role: '支撑与输送' },
      { id: 'leaf', label: '🍃 叶 (Leaf)', role: '制造养料' },
      { id: 'seed', label: '🌰 种子 (Seed)', role: '繁衍与储备' },
    ],
    dropHint: '拖入此处',
    success: '🎉 成功破案！原来我们每天吃的早饭，绝大多数都直接来自于植物的不同身体器官！',
    sticker: { img: foxPicnic, label: '🎨 无框贴纸：小狐狸在野餐' },
  },
}
