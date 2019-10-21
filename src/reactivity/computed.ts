import { observable } from './observable'
import { watch } from './watch'

const computed = (getValue: Function) => {
  const o = observable()
  watch(() => o.$ = getValue())
  return o
}

export {
  computed
}
