// Cloudflare Pages Function: /api/chat
// 反代 OpenRouter chat/completions，Hermes 小绿（小学三年级植物课答疑助手）。
// 安全：请求必须带 pin，边缘端用环境变量 AI_PIN 校验通过才调用 AI；否则返回降级答案，
//       前端不出现 PIN 明文。
//
// 部署环境变量（CF 后台 / wrangler.toml，绝不进代码库、绝不进前端）：
//   OPENROUTER_KEY  — OpenRouter API key
//   AI_PIN          — 小绿认证编号（6 位数字，只写在环境变量里，绝不进代码库）
//   AI_MODEL        — 可选，默认 google/gemini-3-flash（聊天模型，非生图模型）

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};

const SYSTEM_PROMPT =
  '你是「社长小绿」，一个小学三年级自然科学课《秋天植物侦探社》的卡通植物百科助教，' +
  '形象是戴绿帽子的小绿人。请用简单、生动、拟人化、适合 8-9 岁孩子的中文回答植物相关问题，' +
  '每句尽量短，多用比喻（如“像小厨房”“像小钩子”），可在结尾加一个相关 emoji。' +
  '只回答植物、自然、科学观察相关内容；若问到与课程无关或不宜儿童的内容，' +
  '温柔地说“这个问题小绿还小，先问爸爸妈妈或老师吧～”。不要输出任何色情、暴力、危险或成人内容。' +
  '如果用户问的是“植物”相关但你不很确定，可以诚实说“小绿记不太清，课后我们一起查图鉴吧”，不要编造。';

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });

export const onRequestPost = async ({ request, env }) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const expectedPin = env.AI_PIN;
  const key = env.OPENROUTER_KEY;
  const model = env.AI_MODEL || 'google/gemini-3-flash';

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400, headers: CORS });
  }

  const pin = (body && body.pin || '').toString().trim();
  const message = (body && body.message || '').toString().slice(0, 300).trim();

  // 环境变量没配：直接降级（也避免 Buffer.from(undefined) 抛错）
  if (!expectedPin) {
    return new Response(
      JSON.stringify({ reply: '（小绿还没配好认证编号，先给你本地答案哦）', authorized: false }),
      { status: 200, headers: CORS }
    );
  }

  // PIN 校验（边缘端）：不通过则直接降级，绝不调用 OpenRouter
  if (!timingSafeEqual(Buffer.from(pin), Buffer.from(expectedPin))) {
    return new Response(
      JSON.stringify({ reply: '（小绿还在睡觉呢～输入正确的认证编号才能唤醒我哦）', authorized: false }),
      { status: 200, headers: CORS }
    );
  }

  if (!message) {
    return new Response(JSON.stringify({ error: 'empty message' }), { status: 400, headers: CORS });
  }

  if (!key) {
    return new Response(JSON.stringify({ reply: '（小绿后端未配置密钥，已降级为本地答案）', authorized: true }), { status: 200, headers: CORS });
  }

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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!upstream.ok) {
      // ── 诊断模式：把上游真实状态码 / CF 机房 / 上游返回片段带出来 ──
      // 定位完可把 detail 去掉，恢复成纯文案。
      let snippet = '';
      try {
        snippet = (await upstream.text()).slice(0, 200);
      } catch {
        snippet = '(读不出上游响应体)';
      }
      const colo = (request.cf && request.cf.colo) || 'unknown';
      console.error('[chat] upstream failed', {
        status: upstream.status,
        colo,
        model,
        snippet: snippet.slice(0, 120),
      });
      return new Response(
        JSON.stringify({
          reply: '（小绿网络有点忙，先给你本地答案哦）〔诊断 ' + upstream.status + ' · ' + colo + '〕',
          authorized: true,
          detail: {
            upstreamStatus: upstream.status,
            colo,
            model,
            snippet,
          },
        }),
        { status: 200, headers: CORS }
      );
    }

    const data = await upstream.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) {
      return new Response(JSON.stringify({ reply: '（小绿一时语塞，换个问题试试？）', authorized: true }), { status: 200, headers: CORS });
    }
    return new Response(JSON.stringify({ reply: reply.trim(), authorized: true }), { status: 200, headers: CORS });
  } catch (err) {
    // ── 诊断模式：fetch 直接抛异常时（连不上/超时）也把原因带出来 ──
    const colo = (request.cf && request.cf.colo) || 'unknown';
    console.error('[chat] upstream threw', { message: String(err && err.message || err), colo, model });
    return new Response(
      JSON.stringify({
        reply: '（小绿信号被风吹走了，先给你本地答案）〔诊断 fetch-threw · ' + colo + '〕',
        authorized: true,
        detail: {
          upstreamStatus: 'fetch-threw',
          error: String(err && err.message || err),
          colo,
          model,
        },
      }),
      { status: 200, headers: CORS }
    );
  }
};

export const onRequestGet = () => new Response('Method Not Allowed', { status: 405 });
