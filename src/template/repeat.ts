import { Observable, observable } from '../reactivity/observable'
import { Update, watch, stopUpdate } from '../reactivity/watch'
import { TRACK } from '../reactivity/track'
import { Html, render } from './html'

type Item = {
  readonly _value: Observable
  readonly _index: Observable
  readonly _key: any
  readonly _anchor: Comment
  _updates: Set<Update>
  _prev: Item
  _next: Item
}

type Repeat = {
  readonly _array: Observable
  readonly _key: Key
  readonly _template: Template
  readonly _anchor: Comment
  _items: Item[]
}

type Template = (value?: Observable, index?: Observable) => Html
type Key = (value?: any, index?: number) => any

const repeat: {
  (array: Observable, template: Template): DocumentFragment
  (array: Observable, key: Key, template: Template): DocumentFragment
} = (_array: Observable, ...args) => {
  const fragment = document.createDocumentFragment()
  const repeat = {
    _array,
    _key: args[1] ? args[0] : defaultKey,
    _template: args[1] || args[0],
    _anchor: document.createComment(''),
    _items: []
  }

  fragment.append(repeat._anchor)

  const update = watch(() => setup(repeat), _array)
  update._onStop = () => repeat._items.forEach(stopItemUpdates)

  return fragment
}

const defaultKey = (_, i: number) => i

const setup = (m: Repeat) => {
  const array = m._array.$ as readonly any[]
  const newItems = new Array(array.length) as Item[]
  let oldItems = m._items

  let oldEnd = oldItems.length - 1
  let newEnd = newItems.length - 1
  let end = Math.min(oldEnd, newEnd)
  let start = 0

  // trim start
  while (start <= end) {
    const value = array[start]
    const key = m._key(value, start)
    const item = oldItems[start]

    if (item._key === key) {
      item._value.$ = value
      item._index.$ = start
      newItems[start] = item
      ++start
    } else { break }
  }

  // trim end
  while (end > start) {
    const value = array[newEnd]
    const key = m._key(value, newEnd)
    const item = oldItems[oldEnd]

    if (item._key === key) {
      item._value.$ = value
      item._index.$ = newEnd
      newItems[newEnd] = item
      --oldEnd
      --newEnd
      --end
    } else { break }
  }

  oldItems = oldItems.slice(start, oldEnd + 1)
  const order = new Array(oldItems.length)

  // parse middle
  for (let i = start; i <= newEnd; ++i) {
    const value = array[i]
    const _key = m._key(value, i)
    const j = oldItems.findIndex(e => e._key === _key)
    let item: Item

    // new
    if (j < 0) {
      item = {
        _value: observable(value),
        _index: observable(i),
        _key,
        _anchor: document.createComment('')
      } as Item

    // existing
    } else {
      item = oldItems.splice(j, 1)[0]
      order[item._index.$ - start] = i
      item._value.$ = value
      item._index.$ = i
    }

    newItems[i] = item
  }

  // remove non-exist
  for (const e of oldItems) {
    stopItemUpdates(e)

    let node = e._prev ? e._prev._anchor : m._anchor as ChildNode
    let next = node.nextSibling
    while (node !== e._anchor) {
      node = next
      next = next.nextSibling
      node.remove()
    }

    if (e._next) e._next._prev = e._prev
    if (e._prev) e._prev._next = e._next
    e._next = null
    e._prev = null
  }

  // longest same order
  const lis = getLIS(order.filter(e => e !== undefined))

  // add/move nodes
  const fragment = document.createDocumentFragment()

  for (
    let i = start,
      prev = m._items[start - 1],
      next = m._items[start];
    i <= newEnd;
    ++i
  ) {
    const item = newItems[i]

    if (!lis.includes(i)) {
      // setup move
      if (item._updates) {
        let node = item._prev ? item._prev._anchor : m._anchor as ChildNode
        let next = node.nextSibling
        while (node !== item._anchor) {
          node = next
          next = next.nextSibling
          fragment.append(node)
        }

        if (item._next) item._next._prev = item._prev
        if (item._prev) item._prev._next = item._next

      // setup add
      } else {
        const prevUpdates = TRACK._updates
        TRACK._updates = new Set()

        const template = render(m._template, item._value, item._index)
        fragment.append(template, item._anchor)

        item._updates = TRACK._updates
        TRACK._updates = prevUpdates
      }

      // proceed
      item._next = next
      item._prev = prev
      if (next) next._prev = item
      if (prev) {
        prev._next = item
        prev._anchor.after(fragment)
      } else {
        m._anchor.after(fragment)
      }
    }

    prev = item
    next = item && item._next
  }

  m._items = newItems
}

const stopItemUpdates = (item: Item) => item._updates.forEach(stopUpdate)

// longest increasing unique sequence
const getLIS = (nums: readonly number[]) => {
  if (!nums.length) return []
  const sequences = [[nums[0]]]

  for (let i = 1; i < nums.length; ++i) {
    const num = nums[i]

    for (let j = sequences.length - 1; j >= 0; --j) {
      const s = sequences[j]

      if (num < s[s.length - 1]) {
        if (j) continue
        else sequences.splice(0, 1, [num])
      } else {
        sequences.splice(j + 1, 1, [...s, num])
      }
      break
    }
  }

  return sequences.pop()
}

export {
  repeat
}
