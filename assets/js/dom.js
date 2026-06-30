// Minimal safe DOM helpers. We build nodes with createElement/textContent
// only; innerHTML is intentionally avoided so untrusted strings can never
// be parsed as markup.

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value
    else if (key === 'text') node.textContent = value
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2), value)
    } else {
      node.setAttribute(key, value)
    }
  }
  for (const child of [].concat(children)) {
    if (child == null) continue
    node.append(child.nodeType ? child : document.createTextNode(String(child)))
  }
  return node
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild)
}
