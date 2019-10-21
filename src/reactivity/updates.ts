import { Target } from './observable'
import { Update } from './watch'

let IS_ENTRY = true
const UPDATES = new Set<Update>()

const update = (target: Target) => {
  // queue
  for (const e of target._updates)
    UPDATES.add(e)

  // update
  if (IS_ENTRY) {
    IS_ENTRY = false

    for (const e of UPDATES)
      e()

    UPDATES.clear()
    IS_ENTRY = true
  }
}

export {
  update
}
