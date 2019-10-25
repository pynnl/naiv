import { Target } from './observable'
import { Update, runUpdate } from './watch'
import { TRACK } from './track'

let IS_ENTRY = true
let UPDATES = [] as Update[]
const TARGETS = new Set<Target>()

const runUpdates = (target?: Target) => {
  // queue
  target && TARGETS.add(target)

  // update
  if (IS_ENTRY && !TRACK._targets) {
    IS_ENTRY = false

    queueUpdates(0)
    for (let i = 0; i < UPDATES.length;) {
      runUpdate(UPDATES[i])
      queueUpdates(++i)
    }

    UPDATES = []
    IS_ENTRY = true
  }
}

const queueUpdates = (fromIndex: number) => {
  for (const target of TARGETS) {
    for (const e of target._updates) {
      if (!UPDATES.includes(e, fromIndex))
        UPDATES.push(e)
    }
  }
  TARGETS.clear()
}

export {
  runUpdates
}
