import { G, TARGET_QUEUE } from '../global'
import { Update } from './update'
import { clean } from './clean'

const TARGET = Symbol()

type Target = {
  ()
  _value: any
  readonly _updates: Set<Update>
}

type Observable = {
  (value?)
  readonly [TARGET]: Target
  [prop: string]: any
}

const HANDLER: ProxyHandler<Target> = {
  apply (target, _this, args: any[]) {
    if (args.length) {
      if (target._value !== args[0]) {
        target._value = args[0]
        TARGET_QUEUE.add(target)
        clean()
      }
    } else {
      if (G._targets)
        G._targets.add(target)

      return typeof target._value === 'function'
        ? target._value()
        : target._value
    }
  },
  get: (target, prop) => {
    return prop === TARGET
      ? target
      : target._value[prop]
  },
  set: (target, prop, value) => {
    target._value[prop] = value
    return true
  }
}

const observable = (value?) => {
  const target = () => {}
  target._value = value
  target._updates = new Set()
  return new Proxy(target, HANDLER) as unknown as Observable
}

const trigger = (observable: Observable) => {
  TARGET_QUEUE.add(observable[TARGET])
  clean()
}

export {
  Target,
  Observable,
  TARGET,
  observable,
  trigger
}
