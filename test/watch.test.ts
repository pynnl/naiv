import { observable, watch } from '../src'

it('init value', () => {
  let v
  const o = observable(0)
  watch(() => v = o())
  expect(v).toBe(0)
})

it('change value', () => {
  let v
  const o = observable()
  watch(() => v = o())

  o(0)
  expect(v).toBe(0)
})

it('same value', () => {
  let n = 0
  const o = observable()
  watch(() => { ++n; o() })

  expect(n).toBe(1)

  o(0)
  expect(n).toBe(2)

  o(0)
  expect(n).toBe(2)
})

it('identical value', () => {
  let n = 0
  const v = {}
  const o = observable(v)
  watch(() => { ++n; o() })

  o(v)
  expect(n).toBe(1)

  o({})
  expect(n).toBe(2)
})

it('recursive', () => {
  let n = 0
  const o = observable(0)
  watch(() => {
    n++
    if (o() < 10)
      o(o() + 1)
  })

  expect(o()).toBe(10)
  expect(n).toBe(11)
})

it('value is observable', () => {
  let v
  const a = observable('a')
  const b = observable('b')
  const c = observable()
  watch(() => v = c())

  c(a)
  expect(v).toBe('a')

  a('aa')
  expect(v).toBe('aa')

  c(b)
  expect(v).toBe('b')

  b('bb')
  expect(v).toBe('bb')
})

it('partial watch', () => {
  const a = observable()
  const b = observable()
  let n = 0
  watch(() => {
    ++n
    a()
    b()
  }, a)

  a(1)
  expect(n).toBe(2)

  b(1)
  expect(n).toBe(2)
})
