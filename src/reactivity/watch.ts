import { Target } from './observable'
import { TRACK } from './track'

type Update = {
  ()
  _targets: Set<Target>
}

const watch = (callback: Function) => {
  const update = () => runUpdate(callback, update)
  update._targets = new Set<Target>()
  TRACK._updates && TRACK._updates.add(update)
  update()
}

const runUpdate = (callback: Function, update: Update) => {
  const prevTargets = TRACK._targets
  TRACK._targets = new Set()

  callback()

  for (const e of update._targets) {
    if (!TRACK._targets.has(e))
      e._updates.delete(update)
  }

  for (const e of TRACK._targets)
    e._updates.add(update)

  update._targets = TRACK._targets
  TRACK._targets = prevTargets
}

export {
  Update,
  watch
}
