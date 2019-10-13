import { TARGET_QUEUE, UPDATE_QUEUE, G } from '../global'
import { runUpdate } from './update'

let IS_ENTRY = true

const queueUpdates = () => {
  for (const target of TARGET_QUEUE) {
    for (const e of target._updates)
      UPDATE_QUEUE.add(e)
  }

  TARGET_QUEUE.clear()
}

const clean = () => {
  if (IS_ENTRY && !G._targets) {
    IS_ENTRY = false

    queueUpdates()
    for (const e of UPDATE_QUEUE) {
      UPDATE_QUEUE.delete(e)
      runUpdate(e)
      queueUpdates()
    }

    IS_ENTRY = true
  }
}

export {
  clean
}
