import { G, COMMENT, FRAGMENT } from '../global'
import { Update } from '../reactivity/update'
import { Observable, observable, TARGET } from '../reactivity/observable'
import { watch } from '../reactivity/watch'
import { getLIS } from './lis'

type Item = {
  readonly _index: Observable
  readonly _value: Observable
  readonly _key: any
  _anchorStart: ChildNode
  _anchorEnd: ChildNode
  readonly _updates: Set<Update>
  readonly _mapDatas: Set<MapData>
}

type MapData = {
  _array: Observable
  _key: Key
  _html: Html
  _anchor: ChildNode
  _items: Item[]
}

type Html = (value?: Observable, index?: Observable) => DocumentFragment
type Key = (value?: any, index?: number) => any

type MapFunction = {
  (array: Observable, html: Html): DocumentFragment
  (array: Observable, key: Key, html: Html): DocumentFragment
}

const map: MapFunction = (_array, ...args) => {
  const fragment = FRAGMENT.cloneNode() as DocumentFragment
  const data: MapData = {
    _array,
    _key: args[1] ? args[0] : defaultKey,
    _html: args[1] || args[0],
    _anchor: COMMENT.cloneNode() as ChildNode,
    _items: []
  }

  fragment.append(data._anchor)

  // track map
  if (G._mapDatas)
    G._mapDatas.add(data)

  watch(() => setup(data), _array)

  return fragment
}

const defaultKey = (_, i: number) => i

const setup = (m: MapData) => {
  let array = m._array() as any[]
  let items = m._items

  let oldEnd = items.length - 1
  let newEnd = array.length - 1
  let end = Math.min(oldEnd, newEnd)
  let start = 0

  // setup trim start
  while (start <= end) {
    const value = array[start]
    const key = m._key(value, start)
    const item = items[start]

    // update if item in same place
    if (key === item._key) {
      item._index(start)
      item._value(value)

      ++start
    } else { break }
  }

  // setup trim end
  while (end > start) {
    const value = array[newEnd]
    const key = m._key(value, newEnd)
    const item = items[oldEnd]

    // update if item in same place
    if (key === item._key) {
      item._index(newEnd)
      item._value(value)

      --oldEnd
      --newEnd
      --end
    } else { break }
  }

  // trim
  items = items.slice(start, oldEnd + 1)
  array = array.slice(start, newEnd + 1)
  // console.log(items, array)
  const order = [] as number[]

  // parse middle
  for (let i = 0, index = start; i < array.length; ++i, ++index) {
    const value = array[i]
    const _key = m._key(value, index)
    const pos = items.findIndex(e => e._key === _key)

    // add if item is new
    if (pos < 0) {
      array[i] = {
        _index: observable(index),
        _value: observable(value),
        _key,
        _updates: new Set(),
        _mapDatas: new Set()
      } as Item

    // update if item exists
    } else {
      const item = items[pos]

      // track position
      order[item._index[TARGET]._value] = i

      // update
      item._index(index)
      item._value(value)
      array[i] = item

      items.splice(pos, 1)
    }
  }

  // remove non-exist items
  for (const e of items) {
    // stop updates
    stopItemUpdates(e)

    // remove nodes
    let node
    let next = e._anchorStart
    while (node !== e._anchorEnd) {
      node = next
      next = next.nextSibling
      node.remove()
    }
  }

  // longest same order
  const lis = getLIS(order.filter(e => e !== undefined))

  // add/move nodes
  const fragment = FRAGMENT.cloneNode() as DocumentFragment
  let anchor = start ? m._items[start - 1]._anchorEnd : m._anchor

  for (let i = 0; i < array.length; ++i) {
    const item = array[i] as Item

    // setup add
    if (!item._anchorStart) {
      const prevUpdates = G._updates
      const prevMapDatas = G._mapDatas
      G._updates = new Set()
      G._mapDatas = new Set()

      const nodes = m._html(item._value, item._index)
      item._anchorStart = COMMENT.cloneNode() as ChildNode
      item._anchorEnd = COMMENT.cloneNode() as ChildNode
      fragment.append(item._anchorStart, nodes, item._anchorEnd)

      G._updates = prevUpdates
      G._mapDatas = prevMapDatas

    // setup move
    } else if (!lis.includes(i)) {
      let node
      let next = item._anchorStart
      while (node !== item._anchorEnd) {
        node = next
        next = next.nextSibling
        fragment.append(node)
      }
    }

    // proceed
    anchor.after(fragment)
    anchor = item._anchorEnd
  }

  // update items
  m._items.splice(start, oldEnd - start + 1, ...array)
}

const stopItemUpdates = (item: Item) => {
  // stop nested updates
  for (const update of item._updates) {
    for (const e of update._targets)
      e._updates.delete(update)
  }

  // stop nested maps
  for (const e of item._mapDatas)
    e._items.forEach(stopItemUpdates)
}

export {
  MapData,
  map
}
