import { observable, html, render } from '../src'

const div = document.createElement('div')

describe('text', () => {
  it('raw value', () => {
    div.innerHTML = ''
    div.append(render(() => html`text`))
    expect(div.innerHTML).toBe('text')
  })

  it('observable', () => {
    const o = observable()

    div.innerHTML = ''
    div.append(render(() => html`${o}`))
    expect(div.innerHTML).toBe('')

    o.$ = 0
    expect(div.innerHTML).toBe('0')

    div.innerHTML = ''
    div.append(render(() => html`${() => o + 1}`))
    expect(div.innerHTML).toBe('1')

    o.$ = 1
    expect(div.innerHTML).toBe('2')
  })
})

describe('attribute', () => {
  it('event', () => {
    let n = 0
    const onclick = () => ++n
    div.innerHTML = ''
    div.append(render(() => html`<a onclick=${onclick}></a>`))
    div.querySelector('a').click()
    expect(n).toBe(1)
  })

  it('raw value', () => {
    div.innerHTML = ''
    div.append(render(() => html`<a href=${'attr'}></a>`))
    expect(div.innerHTML).toBe('<a href="attr"></a>')
  })

  it('observable', () => {
    const o = observable()

    div.innerHTML = ''
    div.append(render(() => html`<a href=${o}></a>`))
    expect(div.innerHTML).toBe('<a href="undefined"></a>')

    o.$ = 0
    expect(div.innerHTML).toBe('<a href="0"></a>')

    div.innerHTML = ''
    div.append(render(() => html`<a href=${() => o + 1}></a>`))
    expect(div.innerHTML).toBe('<a href="1"></a>')

    o.$ = 1
    expect(div.innerHTML).toBe('<a href="2"></a>')
  })
})

it('fragment', () => {
  const world = () => html`world`
  const hello = () => html`<a>hello ${render(world)}</a>`
  div.innerHTML = ''
  div.append(render(hello))
  expect(div.innerHTML).toBe('<a>hello world</a>')
})
