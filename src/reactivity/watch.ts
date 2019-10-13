import { G } from '../global'
import { Observable, TARGET } from './observable'
import { Update, runUpdate } from './update'
import { clean } from './clean'

const watch = (
  callback: () => void,
  ...observables: Observable[]
) => {
  const update: Update = {
    _callback: callback,
    _targets: new Set()
  }

  if (observables.length) {
    update._partialTrack = true

    for (const e of observables) {
      const target = e[TARGET]
      target._updates.add(update)
      update._targets.add(target)
    }
  }

  if (G._updates)
    G._updates.add(update)

  runUpdate(update)
  clean()
}

export {
  watch
}
