import { Target } from './reactivity/observable'
import { Update } from './reactivity/update'
import { Cache } from './template/cache'
import { MapData } from './template/map'

const G = {
  _targets: null as Set<Target>,
  _updates: null as Set<Update>,
  _mapDatas: null as Set<MapData>
}

const TARGET_QUEUE = new Set<Target>()
const UPDATE_QUEUE = new Set<Update>()

const CACHES = new Map<string, Cache>()
const ANCHOR = '!n@a#i$v%'
const ANCHOR_COMMENT = `<!--${ANCHOR}-->`

export {
  G,
  TARGET_QUEUE,
  UPDATE_QUEUE,
  CACHES,
  ANCHOR,
  ANCHOR_COMMENT
}
