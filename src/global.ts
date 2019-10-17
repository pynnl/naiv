import { Target } from './reactivity/observable'
import { Update } from './reactivity/update'
import { Cache } from './template/cache'
import { MapData } from './template/map'

// tracking
const G = {
  _targets: null as Set<Target>,
  _updates: null as Set<Update>,
  _mapDatas: null as Set<MapData>
}

// queue
const TARGET_QUEUE = new Set<Target>()
const UPDATE_QUEUE = new Set<Update>()

// template
const CACHES = new Map<string, Cache>()
const ANCHOR = '__n$a$i$v__'
const ANCHOR_COMMENT = `<!--${ANCHOR}-->`
window[ANCHOR] = null

// node
const FRAGMENT = document.createDocumentFragment()
const COMMENT = document.createComment('')

export {
  G,
  TARGET_QUEUE,
  UPDATE_QUEUE,
  CACHES,
  ANCHOR,
  ANCHOR_COMMENT,
  FRAGMENT,
  COMMENT
}
