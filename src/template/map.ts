import { G } from '../global'
import { Update } from '../reactivity/update'
import { Observable, observable } from '../reactivity/observable'
import { watch } from '../reactivity/watch'
import { getLIS } from './lis'

type Item = {
  _index: Observable
  _value: Observable
  _node: ChildNode
  _updates: Set<Update>
  _mapDatas: Set<MapData>
}

type MapData = {
  _array: Observable
  _root: ParentNode
  _key: Key
  _html: Html
  _items: Map<any, Item>
  _oldKeys: any[]
}

type Html = (value?: Observable, index?: Observable) => ChildNode
type Key = (value?: any, index?: number) => any

const map = (
  _array: Observable,
  _key: Key,
  _root: ParentNode,
  _html: Html
) => {
  const data: MapData = {
    _array,
    _key,
    _root,
    _html,
    _items: new Map(),
    _oldKeys: []
  }

  if (G._mapDatas)
    G._mapDatas.add(data)

  watch(() => setup(data), _array)
  return _root
}

const setup = (m: MapData) => {
  const array = m._array() as any[]
  let oldKeys = m._oldKeys
  let newKeys = []

  for (let i = 0; i < array.length; ++i) {
    // add new key
    const value = array[i]
    const key = m._key(value, i)
    newKeys.push(key)

    // udpate item if exist
    const item = m._items.get(key)
    if (item) {
      item._index(i)
      item._value(value)

    // create new if not
    } else {
      const prevUpdates = G._updates
      const prevMapDatas = G._mapDatas
      G._updates = new Set()
      G._mapDatas = new Set()

      const _index = observable(i)
      const _value = observable(value)
      const item = {
        _index,
        _value,
        _node: m._html(_value, _index),
        _updates: G._updates,
        _mapDatas: G._mapDatas
      }

      m._items.set(key, item)
      G._updates = prevUpdates
      G._mapDatas = prevMapDatas
    }
  }

  // update old keys
  m._oldKeys = newKeys

  // setup trim
  let oldEnd = oldKeys.length - 1
  let newEnd = array.length - 1
  let end = Math.min(oldEnd, newEnd)
  let start = 0

  while (start <= end && oldKeys[start] === newKeys[start])
    ++start
  while (end > start && oldKeys[oldEnd] === newKeys[newEnd]) {
    --end
    --oldEnd
    --newEnd
  }

  // trim
  let prevNode = start
    ? m._items.get(newKeys[start - 1])._node
    : null
  oldKeys = oldKeys.slice(start, oldEnd + 1)
  newKeys = newKeys.slice(start, newEnd + 1)

  // get longest order
  const order = [] as number[]

  for (let i = 0; i < oldKeys.length; ++i) {
    const key = oldKeys[i]
    const pos = newKeys.indexOf(key)

    // remove if not exist in new array
    if (pos < 0) {
      const item = m._items.get(key)
      m._items.delete(key)

      // stop updates
      stopItemUpdates(item)

      // remove node
      item._node.remove()

    // add position if exist
    } else {
      order.push(pos)
    }
  }

  // longest order
  const lis = getLIS(order)

  // add/move items
  for (let i = 0; i < newKeys.length; ++i) {
    const item = m._items.get(newKeys[i])

    if (!lis.includes(i)) {
      if (prevNode) prevNode.after(item._node)
      else m._root.prepend(item._node)
    }

    prevNode = item._node
  }
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
