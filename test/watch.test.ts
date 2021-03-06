/* eslint-disable no-unused-expressions */
import { observable, watch } from '../src'

it('init value', () => {
  let v
  const o = observable(0)
  watch(() => v = o.$)
  expect(v).toBe(0)
})

it('change value', () => {
  let v
  const o = observable()
  watch(() => v = o.$)

  o.$ = 0
  expect(v).toBe(0)
})

it('same value', () => {
  let n = 0
  const o = observable()
  watch(() => { ++n; o.$ })

  expect(n).toBe(1)

  o.$ = 0
  expect(n).toBe(2)

  o.$ = 0
  expect(n).toBe(2)
})

it('identical value', () => {
  let n = 0
  const v = {}
  const o = observable(v)
  watch(() => { ++n; o.$ })

  o.$ = v
  expect(n).toBe(1)

  o.$ = {}
  expect(n).toBe(2)
})

it('recursive', () => {
  jest.useFakeTimers()

  let n = 0
  const o = observable(0)
  watch(() => {
    n++
    if (o.$ < 10)
      o.$ += 1
  })

  jest.runAllTimers()

  expect(o.$).toBe(10)
  expect(n).toBe(11)
})

it('value is observable', () => {
  let v
  const a = observable('a')
  const b = observable('b')
  const c = observable('c')
  watch(() => v = String(c))

  c.$ = a
  expect(v).toBe('a')

  a.$ = 'aa'
  expect(v).toBe('aa')

  c.$ = b
  expect(v).toBe('b')

  b.$ = 'bb'
  expect(v).toBe('bb')
})
