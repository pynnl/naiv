import { Update } from './watch'
import { update } from './updates'
import { TRACK } from './track'

const TARGET = Symbol()

type Target = {
  _value: any
  _updates: Set<Update>
}

type Observable = number & {
  $: any
  [prop: string]: any
  readonly [TARGET]: Target
}

const observable = (_value?) => new Proxy({
  _value,
  _updates: new Set()
}, HANDLER) as unknown as Observable

const HANDLER: ProxyHandler<Target> = {
  get: (target, prop) => {
    if (prop === TARGET)
      return target

    if (prop === '$update')
      return () => update(target)

    TRACK._targets && TRACK._targets.add(target)
    if (prop === '$')
      return target._value

    const item = target._value[prop]
    return typeof item === 'function' && !item[TARGET]
      ? item.bind(target._value)
      : item
  },
  set: (target, prop, value) => {
    if (prop === '$') {
      if (target._value !== value) {
        target._value = value
        update(target)
      }
    } else if (target._value[prop] !== value) {
      target._value[prop] = value
      update(target)
    }
    return true
  }
}

export {
  Target,
  Observable,
  TARGET,
  observable
}
