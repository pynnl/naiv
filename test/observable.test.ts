import { observable } from '../src'

it('init value', () => {
  const a = observable()
  expect(a()).toBe(undefined)

  const b = observable(0)
  expect(b()).toBe(0)

  const c = observable('c')
  expect(c()).toBe('c')

  const d = observable({ prop: 'prop' })
  expect(d()).toEqual({ prop: 'prop' })
})

it('change value', () => {
  const o = observable()

  o(0)
  expect(o()).toBe(0)

  o('c')
  expect(o()).toBe('c')

  o({ prop: 'prop' })
  expect(o()).toEqual({ prop: 'prop' })
})

it('recursive', () => {
  const o = observable(0)
  o(o() + 1)
  expect(o()).toBe(1)
})

it('get children', () => {
  const a = observable({
    b: 'b',
    c: observable('c')
  })

  expect(a.b).toBe('b')
  expect(a.c()).toBe('c')
})

it('set children', () => {
  const a = observable({})
  a.b = 'b'
  expect(a()).toEqual({ b: 'b' })
})

it('value is observable', () => {
  const a = observable('a')
  const b = observable('b')
  const c = observable()

  c(a)
  expect(String(c)).toBe('a')

  c(b)
  expect(String(c)).toBe('b')
})
