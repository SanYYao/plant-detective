# 课件引擎 + 《秋天植物侦探社》内容包

一个可复用的**交互课件引擎**，加上它的第一份内容包（小学三年级秋季自然课《秋天植物侦探社》）。

做新课件时只写内容数据，引擎不用动。

## 技术栈

Vue 3.5 · Vite 8 · Tailwind CSS 3.4（构建版，非 CDN）· 糖圆体（本地化）

## 目录结构

```
plant-detective/
├── src/
│   ├── engine/                  # 【引擎】跨课件复用，做新课件不用碰
│   │   ├── components/
│   │   │   ├── SlideDeck.vue    #   幻灯片容器：混合吸附滚动 + 键盘翻页 + 尺寸自检
│   │   │   ├── TopNav.vue       #   顶部导航（滚动自动隐藏）
│   │   │   └── ParticleField.vue#   Canvas 背景落叶粒子
│   │   ├── slides/              #   幻灯片组件库（Hero/案件/拖拽/实验/问答/证书）
│   │   ├── composables/         #   共享状态 / 音效 / AI 接入
│   │   └── utils/
│   ├── decks/
│   │   └── plant-detective/     # 【内容包】改内容只动这里
│   │       ├── index.js         #   幻灯片编排
│   │       ├── meta.js          #   标题/品牌/年级/主题
│   │       └── hero.js / leaf.js / breakfast.js / seed.js / chat.js / certificate.js
│   ├── styles/main.css
│   ├── App.vue
│   └── main.js
├── functions/api/               # Cloudflare Pages Functions
│   ├── auth.js                  #   POST /api/auth  —— PIN 校验（边缘端比对 AI_PIN）
│   └── chat.js                  #   POST /api/chat  —— 反代 OpenRouter（含 PIN 校验）
├── legacy/index.html            # 旧版单文件（备份参照，不再维护）
└── assets/                      # 旧静态资源（字体已迁至 src/assets）
```

## 幻灯片模型

每页是一个对象：

```js
{
  id: 'case-1',
  type: 'leaf',        // 对应 slides/ 里的组件
  fit: 'screen',       // 'screen' = 一屏铺满、自动吸附；'flow' = 内容自适应、自由滚动
  nav: '1. 叶黄谜案',   // 顶部导航文案（不填则不出现）
  data: { ... }        // 该页的全部内容
}
```

**混合吸附**：`fit: 'screen'` 的段落滚到附近会自动对齐铺满一屏；`fit: 'flow'` 的段落（内容超一屏的）保持自由滚动。

## 开发与构建

```bash
npm install

npm run dev            # 开发预览（热更新）
npm run build          # 在线版 → dist/（含 AI 问答，部署 CF Pages）
npm run build:offline  # 离线版 → dist-offline/index.html（单文件，无 AI 无音效，双击即用）
```

## 键盘与手势

- `↓ / PageDown / 空格` 下一段，`↑ / PageUp` 上一段，`Home / End` 首尾
- 鼠标滚轮 / 触控滑动：原生吸附
- `D` 键：显示当前视口尺寸与段号（到教室调投影时用）

## 小绿 AI（在线版）

- 顶部「侦探报到登记」输入认证编号 → 点「激活小绿」。
- **PIN 只在 Cloudflare 边缘端比对**（`functions/api/auth.js` 用环境变量 `AI_PIN`），前端源码里没有 PIN 明文。
- 未认证时 AI 区锁定，其他探案环节照常。
- 离线版直接走本地知识库，无需认证。

## 部署到 Cloudflare Pages（在线版）

1. 仓库推到 GitHub → CF Pages 连接该仓库。
2. 构建设置：**Build command** = `npm run build`，**Build output directory** = `dist`。
3. 环境变量（Settings → Environment variables）：
   - `OPENROUTER_KEY` —— OpenRouter API key（不进代码库）
   - `AI_PIN` —— 小绿认证编号（默认 `022732`）
   - `AI_MODEL` —— 可选，默认 `google/gemini-3-flash`
4. `functions/` 自动变成同源接口，国内访问无需额外代理。

## 离线版交付（教室电脑）

```bash
npm run build:offline
# 产物：dist-offline/index.html（单文件 ~1.9MB，含内联字体与全部逻辑）
```
拷到 U 盘 / 教室电脑，双击用浏览器打开即可，断网也能跑。

## 字体授权

糖圆体（猫啃网）采用 **SIL OFL 1.1**，允许商用与随软件分发；授权全文见 `src/assets/fonts/OFL.txt`。
仅用于 `.font-cute` 点睛位（大标题 / 案件标题 / 证书名 / 徽章），正文用无衬线。

## 待办

- [ ] 插图占位替换为真图（`data.*.img` 填路径即可，组件已支持）
- [ ] 字体子集化（当前 woff2 1.4MB → 可压到几十 KB）
- [ ] 未来多课件/多租户（客户子域 + 租约）——引擎已按可扩展结构分层，暂不实现
