// Cloudflare Pages Function: /api/chat
// 反代 OpenRouter chat/completions，Hermes 小绿（小学三年级植物课答疑助手）。
// 部署：Cloudflare Pages 项目根下放 functions/ 目录即自动生效（Pages Functions）。
// 环境变量（CF 后台 / wrangler.toml 设置，绝不进代码库）：
//   OPENROUTER_KEY  — OpenRouter API key
//   AI_PIN          — 小绿认证编号（默认 022732）
//   AI_MODEL        — 可选，默认 google/gemini-3.1-flash-image 不含聊天，改用下方默认 chat 模型

export const onRequestPost = async ({ request, env }) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const pin = env.AI_PIN || '022732';
  const key = env.OPENROUTER_KEY;
  const model = env.AI_MODEL || 'google/gemini-3-flash'; // 聊天用 flash 即可，省钱

  if (!key) {
    return new Response(JSON.stringify({ reply: '（小绿后端未配置密钥，已降级为本地答案）' }), { status: 200, headers: cors });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400, headers: cors });
  }

  const message = (body && body.message || '').toString().slice(0, 300).trim();
  if (!message) {
    return new Response(JSON.stringify({ error: 'empty message' }), { status: 400, headers: cors });
  }

  // 系统提示：锁定三年级小学生植物课助教人格 + 安全约束
  const systemPrompt =
    '你是「社长小绿」，一个小学三年级自然科学课《秋天植物侦探社》的卡通植物百科助教，' +
    '形象是戴绿帽子的小绿人。请用简单、生动、拟人化、适合 8-9 岁孩子的中文回答植物相关问题，' +
    '每句尽量短，多用比喻（如“像小厨房”“像小钩子”），可在结尾加一个相关 emoji。' +
    '只回答植物、自然、科学观察相关内容；若问到与课程无关或不宜儿童的内容，' +
    '温柔地说“这个问题小绿还小，先问爸爸妈妈或老师吧～”。不要输出任何色情、暴力、危险或成人内容。' +
    '如果用户问的是“植物”相关但你不很确定，可以诚实说“小绿记不太清，课后我们一起查图鉴吧”，不要编造。';

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://plant-detective.sanyyao.com',
        'X-Title': 'Plant Detective XiaoLv',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      return new Response(JSON.stringify({ reply: '（小绿网络有点忙，先给你本地答案哦）' }), { status: 200, headers: cors });
    }

    const data = await upstream.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) {
      return new Response(JSON.stringify({ reply: '（小绿一时语塞，换个问题试试？）' }), { status: 200, headers: cors });
    }
    return new Response(JSON.stringify({ reply: reply.trim() }), { status: 200, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ reply: '（小绿信号被风吹走了，先给你本地答案）' }), { status: 200, headers: cors });
  }
};

// 拒绝 GET 等其它方法
export const onRequestGet = () => new Response('Method Not Allowed', { status: 405 });
