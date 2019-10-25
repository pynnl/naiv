import { isObservable } from '../reactivity/observable'
import { watch } from '../reactivity/watch'

type Html = {
  _htmls: TemplateStringsArray
  _exprs: any[]
}

type Cache = {
  readonly _index: number
  _attrs?: string[]
  _children?: Cache[]
}

type TemplateSetup = {
  (...props): Html
  _proto?: DocumentFragment
  _caches?: Cache[]
}

const ANCHOR = '__n$a$i$v__'
const ANCHOR_COMMENT = `<!--${ANCHOR}-->`
const ANCHOR_REGEX = RegExp(ANCHOR, 'g')
window[ANCHOR] = null

const html = (_htmls: TemplateStringsArray, ..._exprs) => ({ _htmls, _exprs })

const render = (setup: TemplateSetup, ...props: any[]) => {
  const { _htmls, _exprs } = setup(...props)

  if (!setup._proto) {
    let innerHTML = ''
    for (let i = 0, last = _htmls.length - 1; ; ++i) {
      innerHTML += _htmls[i]
      if (i === last) break
      innerHTML += _htmls[i].slice(-1) === '=' ? ANCHOR : ANCHOR_COMMENT
    }

    setup._proto = fragmentFromHTML(innerHTML)
    setup._caches = []
    parse(setup._proto.childNodes, setup._caches)
  }

  const fragment = setup._proto.cloneNode(true) as DocumentFragment
  renderCaches(fragment, setup._caches, _exprs.values())
  return fragment
}

const fragmentFromHTML = (innerHTML: string) => {
  const templ = document.createElement('template')
  templ.innerHTML = innerHTML
  return templ.content
}

const parse = (
  nodes: NodeList,
  caches: Cache[]
) => {
  for (let _index = 0; _index < nodes.length; ++_index) {
    const node = nodes[_index] as ChildNode
    const type = node.nodeType

    // element
    if (type === 1) {
      const attrs = [] as string[]
      const childCaches = [] as Cache[]

      // parse attributes
      for (const e of (node as Element).attributes) {
        if (e.value === ANCHOR)
          attrs.push(e.name)
      }

      // parse children
      parse(node.childNodes, childCaches)

      // add cache
      if (attrs.length || childCaches.length) {
        const cache = { _index } as Cache
        if (attrs.length)
          cache._attrs = attrs
        if (childCaches.length)
          cache._children = childCaches
        caches.push(cache)
      }
    } else {
      const value = node.nodeValue

      // text
      if (type === 3) {
        if (value.includes(ANCHOR)) {
          const innerHTML = value.replace(ANCHOR_REGEX, ANCHOR_COMMENT)
          const fragment = fragmentFromHTML(innerHTML)
          node.replaceWith(fragment)
          --_index
        }

      // comment
      } else if (type === 8 && value === ANCHOR) {
        caches.push({ _index })
      }
    }
  }
}

const renderCaches = (
  parent: Node,
  caches: Cache[],
  eExprs: Iterator<any>
) => {
  const addFragments = [] as {
    _anchor: ChildNode
    _fragment: DocumentFragment
  }[]

  for (const cache of caches) {
    const _anchor = parent.childNodes[cache._index]

    // element
    if (cache._attrs || cache._children) {
      // attributes
      if (cache._attrs) {
        for (const attr of cache._attrs) {
          const expr = eExprs.next().value
          // event
          if (attr.slice(0, 2) === 'on')
            _anchor.addEventListener(attr.slice(2), expr)
          // others
          else if (isObservable(expr))
            watch(() => (_anchor as Element).setAttribute(attr, expr.$))
          else if (typeof expr === 'function')
            watch(() => (_anchor as Element).setAttribute(attr, expr()))
          else
            (_anchor as Element).setAttribute(attr, expr)
        }
      }

      // children
      if (cache._children)
        renderCaches(_anchor, cache._children, eExprs)
    } else {
      const expr = eExprs.next().value

      // template
      if (expr instanceof DocumentFragment) {
        addFragments.push({ _anchor, _fragment: expr })

        // text
      } else {
        const text = document.createTextNode('')
        _anchor.replaceWith(text)

        if (isObservable(expr))
          watch(() => text.nodeValue = expr.$)
        else if (typeof expr === 'function')
          watch(() => text.nodeValue = expr())
        else
          text.nodeValue = expr
      }
    }
  }

  for (const e of addFragments)
    e._anchor.replaceWith(e._fragment)
}

export {
  Html,
  html,
  render
}
