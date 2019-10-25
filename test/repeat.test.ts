import { observable, html, repeat } from '../src'

const div = document.createElement('div')
const data = [
  { text: 'A' },
  { text: 'B' },
  { text: 'C' },
  { text: 'D' },
  { text: 'E' }
]

const HTML = (...ss: string[]) => {
  let s = '<!---->'
  for (const e of ss)
    s += e + '<!---->'
  return s
}

it('init', () => {
  const o = observable(data)
  div.innerHTML = ''
  div.append(repeat(o, e => html`<a>${e.text}</a>`))
  expect(div.innerHTML).toBe(HTML(
    '<a>A</a>',
    '<a>B</a>',
    '<a>C</a>',
    '<a>D</a>',
    '<a>E</a>'
  ))
})

it('remove', () => {
  const o = observable(data)
  div.innerHTML = ''
  div.append(repeat(o, e => html`<a>${() => e.text}</a>`))
  o.$ = [
    { text: 'B' },
    { text: 'E' }
  ]
  expect(div.innerHTML).toBe(HTML(
    '<a>B</a>',
    '<a>E</a>'
  ))
})

it('add', () => {
  const o = observable(data)
  div.innerHTML = ''
  div.append(repeat(o, e => html`<a>${() => e.text}</a>`))
  o.$ = [
    { text: 'F' },
    { text: 'A' },
    { text: 'G' },
    { text: 'H' },
    { text: 'B' },
    { text: 'C' },
    { text: 'D' },
    { text: 'E' },
    { text: 'I' }
  ]
  expect(div.innerHTML).toBe(HTML(
    '<a>F</a>',
    '<a>A</a>',
    '<a>G</a>',
    '<a>H</a>',
    '<a>B</a>',
    '<a>C</a>',
    '<a>D</a>',
    '<a>E</a>',
    '<a>I</a>'
  ))
})

it('nested', () => {
  const o = observable([
    ['A', 'B'],
    ['C', 'D']
  ])
  div.innerHTML = ''
  div.append(repeat(o, e => html`${
    repeat(e, e => html`${e}`)
  }`))
  expect(div.innerHTML).toBe(HTML(
    HTML('A', 'B'),
    HTML('C', 'D')
  ))

  o[0] = ['E']
  expect(div.innerHTML).toBe(HTML(
    HTML('E'),
    HTML('C', 'D')
  ))

  o.$ = [...o.$, ['F', 'G', 'H']]
  expect(div.innerHTML).toBe(HTML(
    HTML('E'),
    HTML('C', 'D'),
    HTML('F', 'G', 'H')
  ))
})
