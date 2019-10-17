import { ANCHOR, ANCHOR_COMMENT, CACHES } from '../global'
import { parseCache } from './cache'
import { watch } from '../reactivity/watch'

// const REGEX_ATTR_EVENT = /on[a-z]+=$/

const html = (htmls: TemplateStringsArray, ...exprs: any[]) => {
  // create template string
  let html = ''
  for (let i = 0, last = htmls.length - 1; ; ++i) {
    // const m = s.match(REGEX_ATTR_EVENT)
    html += htmls[i]
    if (i === last) break
    html += htmls[i].slice(-1) === '='
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

  // clone
  const clone = cache._proto.cloneNode(true)
  const addFragments = [] as {
    _anchor: ChildNode
    _fragment: DocumentFragment
  }[]

  // bind values
  for (let i = 0, j = 0; i < cache._exprs.length; ++i) {
    const cachedExpr = cache._exprs[i]

    // get anchor
    let _anchor = clone as ChildNode
    for (const e of cachedExpr._path)
      _anchor = _anchor.childNodes[e]

    // element attributes
    if (cachedExpr._attrs) {
      for (const e of cachedExpr._attrs) {
        const expr = exprs[j++]

        // element reference
        if (e === 'element')
          expr(_anchor)

        // event
        else if (e.slice(0, 2) === 'on')
          _anchor.addEventListener(e.slice(2), expr)

        // attribute
        else if (typeof expr === 'function')
          watch(() => (_anchor as Element).setAttribute(e, expr()))
        else
          (_anchor as Element).setAttribute(e, expr)
      }
    } else {
      const expr = exprs[j++]

      // child node
      if (expr instanceof DocumentFragment) {
        addFragments.push({ _anchor, _fragment: expr })
      // text
      } else {
        const textNode = document.createTextNode('')
        _anchor.replaceWith(textNode)

        if (typeof expr === 'function')
          watch(() => textNode.nodeValue = expr())
        else
          textNode.nodeValue = expr
      }
    }
  }

  for (const e of addFragments)
    e._anchor.replaceWith(e._fragment)

  return clone as DocumentFragment
}

export {
  html
}
