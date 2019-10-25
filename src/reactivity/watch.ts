import { Target, Observable, TARGET } from './observable'
import { TRACK } from './track'
import { runUpdates } from './updates'

type Update = {
  _callback: Function
  _targets: Set<Target>
  _partial?: true
  _onStop?: Function
}

const watch = (_callback: Function, ...obs: Observable[]) => {
  const update = {
    _callback,
    _targets: new Set()
  } as Update

  if (obs.length) {
    update._partial = true
    for (const e of obs) {
      const target = e[TARGET]
      update._targets.add(target)
      target._updates.add(update)
    }
  }

  TRACK._updates && TRACK._updates.add(update)
  runUpdate(update)
  runUpdates()
  return update
}

const runUpdate = (update: Update) => {
  if (update._partial) {
    update._callback()
  } else {
    const prevTargets = TRACK._targets
    TRACK._targets = new Set()

    update._callback()

    for (const e of update._targets) {
      if (!TRACK._targets.has(e))
        e._updates.delete(update)
    }

    for (const e of TRACK._targets)
      e._updates.add(update)

    update._targets = TRACK._targets
    TRACK._targets = prevTargets
  }
}

const stopUpdate = (update: Update) => {
  for (const e of update._targets)
    e._updates.delete(update)

  update._onStop && update._onStop()
}

export {
  Update,
  watch,
  runUpdate,
  stopUpdate
}
