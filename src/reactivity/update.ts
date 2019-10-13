import { G } from '../global'
import { Target } from './observable'

type Update = {
  readonly _callback: () => void
  _targets: Set<Target>
  _partialTrack?: true
}

const runUpdate = (update: Update) => {
  if (update._partialTrack) {
    update._callback()
  } else {
    const prevTargets = G._targets
    G._targets = new Set()

    update._callback()

    for (const e of update._targets) {
      if (!G._targets.has(e))
        e._updates.delete(update)
    }

    for (const e of G._targets)
      e._updates.add(update)

    update._targets = G._targets
    G._targets = prevTargets
  }
}

export {
  Update,
  runUpdate
}
