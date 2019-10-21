import { Target } from './observable'
import { Update } from './watch'

const TRACK = {
  _targets: null as Set<Target>,
  _updates: null as Set<Update>
}

export {
  TRACK
}
