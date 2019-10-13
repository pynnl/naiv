import { ANCHOR } from '../global'

type Cache = {
  readonly _proto: DocumentFragment
  readonly _exprs: Array<{
    _path: number[]
    _attrs?: string[]
  }>
}

const isCommentAnchor = (node: Node) => {
  return node && node.nodeType === 8 && node.nodeValue === ANCHOR
}

const parseCache = (
  cache: Cache,
  parent: Node = cache._proto,
  path: number[] = []
) => {
  for (let i = 0; i < parent.childNodes.length; ++i) {
    const node = parent.childNodes[i]
    const type = node.nodeType

    // text
    if (type === 3) {
      let value = node.nodeValue

      if (!isCommentAnchor(node.previousSibling))
        value = value.trimStart()
      if (!isCommentAnchor(node.nextSibling))
        value = value.trimEnd()

      if (value) {
        const texts = value.split(ANCHOR)
        --i

        for (let j = 0; ; ++j) {
          // static text
          const text = texts[j].replace(/\s+/, ' ')
          if (text) {
            node.before(document.createTextNode(text))
            i += 2
          } else {
            i += 1
          }

          // skip the last static text
          if (j === texts.length - 1) break

          // add anchor refs
          node.before(document.createComment(''))
          cache._exprs.push({ _path: [...path, i] })
        }
      }

      // remove the parsed text
      parent.removeChild(node)
      --i
    } else {
      const _path = [...path, i]

      // element
      if (type === 1) {
        const _attrs = []

        for (const e of (node as Element).attributes)
          e.value === ANCHOR && _attrs.push(e.name)

        // add attribute refs
        _attrs.length && cache._exprs.push({ _path, _attrs })

        // parse children
        parseCache(cache, node, _path)

      // add comment anchor refs
      } else if (isCommentAnchor(node)) {
        cache._exprs.push({ _path })
      }
    }
  }
}

export {
  Cache,
  parseCache
}
