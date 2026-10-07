/**
 * deadcat-inspect-copy —— 点选组件 → 源码定位串进系统剪贴板（Wayland: wl-copy）
 *
 * 两条路都汇到这里：
 *  1) 页面里「Alt + 点击」任意组件 —— 注入的客户端脚本从 Vue 组件实例取 __file，
 *     请求 /__inspect-copy
 *  2) Vue DevTools 面板里点「打开编辑器」—— 它请求 /__open-in-editor，被本插件拦下
 *
 * 服务端用 @vue/compiler-sfc 解析出各块行范围，拼成定位串写进剪贴板：
 *   src/engine/slides/HeroSlide.vue:63（script setup 1-49，template 51-146，全文 147 行）
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { parse } from '@vue/compiler-sfc'

const META_CACHE = new Map()

const CLIENT_CODE = `
(function () {
  if (window.__deadcatInspectInstalled) return
  window.__deadcatInspectInstalled = true

  function pickFile(el) {
    var n = el
    while (n && n !== document.body) {
      var comp = n.__vueParentComponent
      if (comp && comp.type && comp.type.__file) return comp.type.__file
      n = n.parentElement
    }
    return null
  }

  // 元素指纹：同一文件里区分是哪块 DOM（组件级定位只能到文件）
  function fingerprint(el) {
    var n = el
    while (n && n !== document.body) {
      var txt = (n.textContent || '').replace(/\\s+/g, ' ').trim()
      var key = (typeof n.className === 'string' ? n.className : '').split(/\\s+/)
        .filter(function (c) { return /^(bg-|paper-card|tag-stamp)/.test(c) })
        .slice(0, 2)
      if (txt || key.length) {
        var label = n.tagName.toLowerCase()
        if (key.length) label += '.' + key.join('.')
        if (txt) label += '「' + txt.slice(0, 18) + (txt.length > 18 ? '…' : '') + '」'
        return label
      }
      n = n.parentElement
    }
    return ''
  }

  function toast(msg, ok) {
    var d = document.createElement('div')
    d.textContent = msg
    d.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);' +
      'background:' + (ok ? 'rgba(27,48,34,.94)' : 'rgba(154,3,30,.94)') + ';color:#fcfbf7;' +
      'padding:10px 18px;border-radius:12px;font:600 13px/1.4 system-ui,-apple-system,sans-serif;' +
      'z-index:99999;pointer-events:none;box-shadow:0 6px 20px rgba(0,0,0,.35);max-width:80vw;word-break:break-all'
    document.body.appendChild(d)
    setTimeout(function () { d.remove() }, 3000)
  }

  document.addEventListener('click', function (e) {
    if (!e.altKey) return
    var file = pickFile(e.target)
    if (!file) return
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    fetch('/__inspect-copy?file=' + encodeURIComponent(file) + '&el=' + encodeURIComponent(fingerprint(e.target)))
      .then(function (r) { return r.text() })
      .then(function (t) { toast('📋 已复制：' + t, true) })
      .catch(function () { toast('✗ 复制失败', false) })
  }, true)

  console.log('%c[inspect-copy] 按住 Alt + 点击任意组件 → 源码定位复制到剪贴板', 'color:#4e8760;font-weight:bold')
})()
`

function copyToClipboard(text) {
  return new Promise((resolve) => {
    let settled = false
    const done = (ok) => { if (!settled) { settled = true; resolve(ok) } }
    try {
      const child = spawn('wl-copy', [], { stdio: ['pipe', 'ignore', 'ignore'] })
      child.on('error', () => done(false))
      child.on('close', () => done(true))
      child.stdin.on('error', () => done(false))
      child.stdin.end(text)
      setTimeout(() => done(true), 800) // wl-copy 可能驻留持有剪贴板，不必等 close
    } catch {
      done(false)
    }
  })
}

function analyze(absFile) {
  if (META_CACHE.has(absFile)) return META_CACHE.get(absFile)
  const meta = { total: 0, blocks: {} }
  try {
    const code = fs.readFileSync(absFile, 'utf-8')
    meta.total = code.split('\n').length
    if (absFile.endsWith('.vue')) {
      const { descriptor } = parse(code, { filename: absFile })
      const pick = (block, label) => {
        if (block && block.loc) meta.blocks[label] = [block.loc.start.line, block.loc.end.line]
      }
      pick(descriptor.scriptSetup, 'script setup')
      pick(descriptor.script, 'script')
      pick(descriptor.template, 'template')
      pick(descriptor.styles && descriptor.styles[0], 'style')
    }
  } catch (err) {
    meta.error = String((err && err.message) || err)
  }
  META_CACHE.set(absFile, meta)
  return meta
}

export default function inspectCopy() {
  return {
    name: 'deadcat-inspect-copy',
    apply: 'serve',

    transformIndexHtml() {
      return [{ tag: 'script', children: CLIENT_CODE, injectTo: 'body' }]
    },

    configureServer(server) {
      const root = server.config.root

      const buildText = (rawFile, line, col) => {
        let absFile = rawFile
        if (!path.isAbsolute(absFile)) absFile = path.join(root, absFile.replace(/^\//, ''))
        const rel = path.relative(root, absFile) || absFile
        const meta = analyze(absFile)
        const parts = []
        for (const label of ['script setup', 'script', 'template', 'style']) {
          if (meta.blocks[label]) parts.push(`${label} ${meta.blocks[label][0]}-${meta.blocks[label][1]}`)
        }
        parts.push(`全文 ${meta.total} 行`)
        const at = line ? `:${line}${col ? ':' + col : ''}` : ''
        return `${rel}${at}（${parts.join('，')}）`
      }

      const handle = async (rawParam, elFp, res) => {
        const m = String(rawParam).match(/^(.*?):(\d+):(\d+)$/)
        const rawFile = m ? m[1] : rawParam
        const line = m ? Number(m[2]) : 0
        const col = m ? Number(m[3]) : 0
        const base = buildText(rawFile, line, col)
        const text = elFp ? `${base} · ${elFp}` : base
        const ok = await copyToClipboard(text)
        console.log(`\n[inspect-copy] ${ok ? '✓ 已复制到剪贴板' : '✗ 复制失败'} → ${text}\n`)
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(ok ? text : 'copy-failed')
      }

      // 早于 Vite 内置中间件注册，因此能先截胡 /__open-in-editor
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next()
        const isCopy = req.url.startsWith('/__inspect-copy')
        const isOpen = req.url.startsWith('/__open-in-editor')
        if (!isCopy && !isOpen) return next()
        try {
          const url = new URL(req.url, 'http://localhost')
          const param = url.searchParams.get('file') || ''
          const elFp = url.searchParams.get('el') || ''
          if (!param) { res.statusCode = 400; res.end('missing file'); return }
          await handle(param, elFp, res)
        } catch (err) {
          console.error('[inspect-copy] error:', err)
          res.statusCode = 500
          res.end('error')
        }
      })
    },
  }
}
