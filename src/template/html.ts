import { ANCHOR, ANCHOR_COMMENT, CACHES } from '../global'
import { parseCache } from './cache'
import { watch } from '../reactivity/watch'

const html = (htmls: TemplateStringsArray, ...exprs: any[]) => {
  // create template string
  let html = ''
  for (let i = 0, last = htmls.length - 1; ; ++i) {
    const s = htmls[i]
    html += s
    if (i === last) break
    html += s.slice(-1) === '='
      ? ANCHOR
      : ANCHOR_COMMENT
  }

  // get cache or create if not found
  let cache = CACHES.get(html)
  if (!cache) {
    const template = document.createElement('template')
    template.innerHTML = html
    cache = {
      _proto: template.content,
      _exprs: []
    }
    parseCache(cache)
    CACHES.set(html, cache)
  }

  // clone & set expression values
  const clone = cache._proto.cloneNode(true)

  for (let i = 0, j = 0; i < cache._exprs.length; ++i) {
    const cachedExpr = cache._exprs[i]

    // get anchor
    let anchor = clone as ChildNode
    for (const e of cachedExpr._path)
      anchor = anchor.childNodes[e]

    // element attributes
    if (cachedExpr._attrs) {
      for (const e of cachedExpr._attrs) {
        const expr = exprs[j++]

        // event
        if (e.substring(0, 2) === 'on') {
          anchor[e] = expr

        // attribute
        } else {
          if (typeof expr === 'function')
            watch(() => (anchor as Element).setAttribute(e, expr()))
          else
            (anchor as Element).setAttribute(e, expr)
        }
      }
    } else {
      const expr = exprs[j++]

      // child node
      if (expr instanceof Node) {
        anchor.replaceWith(expr)
      // text
      } else {
        const textNode = document.createTextNode('')
        anchor.replaceWith(textNode)
        if (typeof expr === 'function')
          watch(() => textNode.nodeValue = expr())
        else
          textNode.nodeValue = expr
      }
    }
  }

  return clone.childNodes[0] || document.createComment('') as Node | Element
}

export {
  html
}
