import { Update } from './watch'
import { runUpdates } from './updates'
import { TRACK } from './track'

const TARGET = Symbol()

type Target = {
  _value: any
  _updates: Set<Update>
}

type Observable = number & {
  $: any
  $update: () => void
  [prop: string]: any
  readonly [TARGET]: Target
}

const isObservable = (v): v is Observable => v && v[TARGET]

const observable = (_value?) => new Proxy({
  _value,
  _updates: new Set()
}, HANDLER) as unknown as Observable

const HANDLER: ProxyHandler<Target> = {
  get: (target, prop) => {
    if (prop === TARGET)
      return target

    if (prop === '$update')
      return () => runUpdates(target)

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
        runUpdates(target)
      }
    } else if (target._value[prop] !== value) {
      target._value[prop] = value
      runUpdates(target)
    }
    return true
  }
}

export {
  Target,
  Observable,
  TARGET,
  isObservable,
  observable
}
