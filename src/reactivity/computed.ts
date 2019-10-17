import { observable } from './observable'
import { watch } from './watch'

const computed = (getter: () => any) => {
  const o = observable()
  watch(() => o(getter()))
  return o
}

export {
  computed
}
