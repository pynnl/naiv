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

const observable = (value?) => {
  const target = () => {}
  target._value = value
  target._updates = new Set()
  return new Proxy(target, HANDLER) as unknown as Observable
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
      G._targets && G._targets.add(target)
      return target._value
    }
  },
  get: (target, prop) => {
    if (prop === TARGET) return target
    G._targets && G._targets.add(target)

    const item = target._value[prop]
    return typeof item === 'function' && !item[TARGET]
      ? item.bind(target._value)
      : item
  },
  set: (target, prop, value) => {
    if (target._value[prop] !== value) {
      target._value[prop] = value
      TARGET_QUEUE.add(target)
      clean()
    }
    return true
  }
}

const trigger = (obs: Observable) => {
  TARGET_QUEUE.add(obs[TARGET])
  clean()
}

export {
  Target,
  Observable,
  TARGET,
  observable,
  trigger
}
