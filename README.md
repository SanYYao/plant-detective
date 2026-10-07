# 秋天植物侦探社 · 交互课件

小学三年级《秋天植物侦探社》45 分钟自然探秘交互手记课件。含三个探案互动（叶黄 / 早餐器官拖拽 / 种子传播实验）、社长「小绿」问答、破案证书。

## 分支说明

- `main` —— 完整版（含真实 AI 问答 + 音效）。部署到 **Cloudflare Pages**，国内经 Pages 同源反代免代理。
- `local` —— 离线版（**无 AI、无音效、纯本地知识库兜底**）。给教室电脑离线打开，双击 `index.html` 即用，断网也能跑。

两个分支的 `index.html` 都已把字体（糖圆体）和插图占位**本地化**，不依赖外网 CDN。

## 本地预览

```bash
# 任一分支
python3 -m http.server 8080
# 浏览器开 http://localhost:8080
```
local 分支也可直接双击 `index.html`（file:// 协议即可，无需服务器）。

## 部署到 Cloudflare Pages（main 分支）

1. 把仓库推到 GitHub（或 GitLab），Cloudflare Pages 连该 repo。
2. 构建设置：**Framework = None（或 Custom）**，**Build command 留空**，**Publish directory = `/`**（根目录即含 index.html）。
3. Pages Functions 已就位：`functions/api/chat.js` 会自动变成同源接口 `/api/chat`。
4. 设置环境变量（CF 后台 → Pages → 项目 → Settings → Environment variables，生产环境）：
   - `OPENROUTER_KEY` —— 你的 OpenRouter API key（**绝不进代码库**）
   - `AI_PIN` —— 小绿认证编号，默认 `022732`（给小姨的码）
   - `AI_MODEL` —— 可选，默认 `google/gemini-3-flash`（聊天模型；注意生图模型是 `gemini-3.1-flash-image`，别混）

> 国内访问：网页和小绿 AI 都走 Cloudflare 同源（`/api/chat` 由 CF 边缘节点转发 OpenRouter），无需额外代理。

## 小绿 AI 使用方式（main 版）

1. 页面顶部「侦探报到登记」处输入侦探名字 → 点「领证受命」。
2. 同一卡片里输入「小绿认证编号」→ 点「激活小绿 🔑」。
   - 编号正确：AI 对话区解锁，可实时问答。
   - 编号错误 / 不输：**不影响其他探案环节**，只是 AI 对话区保持锁定（显示提示），问答走本地知识库兜底。

### 安全设计（重要）

**PIN 比对只在 Cloudflare 边缘端进行，前端源码里不会出现 PIN 明文。**

- 前端把用户输入的编号 POST 到 `/api/auth`，由 Pages Function 用环境变量 `AI_PIN` 比对，返回 `{ authorized: true/false }`，**永不回显 PIN**。
- 聊天请求 `/api/chat` 也必须带 `pin`，边缘端校验通过才调用 OpenRouter；不通过返回降级答案。
- 因此即便网站公开、`view-source` 也拿不到 PIN——PIN 仅存在于 CF 环境变量。改 PIN 只需改 `AI_PIN` 环境变量，无需动前端。

## 字体

糖圆体（猫啃网）仅用于 `.font-cute` 类（大标题 / CASE 标题 / 证书名 / 徽章），正文保持无衬线，避免审美疲劳。字体文件：`assets/fonts/tangyuan.ttf` + `.woff2`（已本地化）。

## 目录结构

```
plant-detective/
├── index.html              # 课件主体
├── assets/
│   ├── fonts/              # 糖圆体 ttf + woff2
│   └── img/               # 待填充（占位图换真图，暂未生成）
├── functions/
│   ├── api/auth.js        # Cloudflare Pages Function：PIN 校验（边缘端比对 AI_PIN）
│   └── api/chat.js        # Cloudflare Pages Function：反代 OpenRouter（含 pin 校验）
└── README.md
```
