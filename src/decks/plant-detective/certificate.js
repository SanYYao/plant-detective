// 破案证书 + 亲子任务
import medalSticker from '../../assets/lesson/medal-sticker.webp'
import certificateBg from '../../assets/lesson/certificate-bg.png'

export default {
  id: 'certificate',
  type: 'certificate',
  fit: 'flow',
  nav: '侦探证',
  data: {
    badge: '🏅',
    title: '植物小侦探破案证书',
    subtitle: 'Junior Botanical Detective Certificate',
    stamp: 'Botanist\nPassed',
    nameLabel: '兹证明侦探：',
    nameDefault: '名侦探小明',
    body: '在本次《秋天植物侦探社》45分钟探秘课程中，成功破解叶子变黄、早餐器官归类及种子传播三项案情，特发此证！',
    homeworkTitle: '🏡 本周亲子探秘小任务：',
    homework: [
      '本周和爸爸妈妈在小区或公园找 **3 种不同的落叶或果实**。',
      '用手机拍照或贴在纸上，猜猜它是植物的哪个器官。',
      '下节课带到班级分享展示！',
    ],
    printButton: '🖨️ 打印/保存此证书',
    bgImg: certificateBg,
    sticker: { img: medalSticker },
    footer: '《秋天植物侦探社》自然探秘交互手记 · Designed for Primary Science Education',
  },
}
