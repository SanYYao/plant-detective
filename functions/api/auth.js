// Cloudflare Pages Function: /api/auth
// 仅校验「小绿认证编号」，PIN 比对在边缘端用环境变量 AI_PIN，前端永不出现 PIN。
// 前端把用户输入的编号 POST 到此，返回 { authorized: true/false }，不回显 PIN。

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });

export const onRequestPost = async ({ request, env }) => {
  const expected = env.AI_PIN;
  if (!expected) {
    // 环境变量没配：明确拒绝（绝不硬编码 PIN 兜底——代码会进公开仓库）
    return new Response(JSON.stringify({ authorized: false, reason: 'server_not_configured' }), { status: 200, headers: CORS });
  }
  let pin = '';
  try {
    const b = await request.json();
    pin = (b && b.pin || '').toString().trim();
  } catch {
    return new Response(JSON.stringify({ authorized: false }), { status: 200, headers: CORS });
  }
  const authorized = timingSafeEqual(Buffer.from(pin), Buffer.from(expected));
  return new Response(JSON.stringify({ authorized }), { status: 200, headers: CORS });
};
