// 极简行内标记：**粗体** → <strong>（内容为自建数据，非用户输入，安全）
export function mdInline(text) {
  if (!text) return ''
  return String(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
