// 案件三：种子传播三大实验
import burdockDog from '../../assets/lesson/burdock-dog.webp'
import dandelion from '../../assets/lesson/dandelion.webp'
import balsam from '../../assets/lesson/balsam.webp'

export default {
  id: 'case-3',
  type: 'seed',
  fit: 'flow',
  nav: '3. 种子便车',
  data: {
    tag: 'CASE #03',
    title: '案件三：谁在偷偷搭便车？',
    hint: '点击或拖动体验 3 大传播物理实验',
    intro: '植物没有脚，怎么把种子送到远方？请亲自操控下方 3 个实验装置，破解种子的无声旅行法：',
    experiments: [
      {
        id: 'cocklebur',
        title: '苍耳 · 倒钩绒毛刺',
        tag: '动物传播',
        desc: '果实外壳长满微小弯钩，遇到小狗或裤腿就能牢牢挂住！',
        img: burdockDog,
        action: '🧷 挂在小狗毛发上',
        statusIdle: '点击苍耳挂在小狗身上',
        statusDone: '✅ 钩子固定在小狗毛发上！小狗跑远了~',
      },
      {
        id: 'dandelion',
        title: '蒲公英 · 降落伞冠毛',
        tag: '风力传播',
        desc: '种子带着绒毛小降落伞，秋风一吹就能飞到几公里外。',
        img: dandelion,
        action: '🌬️ 一键呼唤秋风吹飞',
        statusIdle: '滑动下方滑块控制风速',
        statusSoft: '💨 微风摇曳，种子准备起飞',
        statusStrong: '🍃 强风把蒲公英伞吹到了百米高空！',
        windLabels: ['🍃 无风', '微风吹拂', '🌬️ 强风'],
        windStrongLabel: '🌬️ 狂风大作',
      },
      {
        id: 'balsam',
        title: '凤仙花 · 弹射自爆炮',
        tag: '机械自弹',
        desc: '成熟果皮积聚强大张力，轻触瞬间猛烈卷曲弹射种子！',
        img: balsam,
        action: '💥 点击触发果皮爆裂',
        statusIdle: '点击果荚增加张力并弹射',
        statusDone: '💣 嘭！果皮卷曲弹射，种子飞出 3 米外！',
      },
    ],
    success: '🎉 太棒了！你已成功破解苍耳（毛发钩挂）、蒲公英（风力风筝）与凤仙花（果皮弹射）3 种传播绝活！',
    safety: '侦探安全守护提醒：野外或小区看到不认识的野生果实，未询问爸爸妈妈或老师前，**绝对不能入口品尝**！',
  },
}
