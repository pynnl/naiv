import { observable, html } from '../src'

const div = document.createElement('div')

describe('text', () => {
  it('raw value', () => {
    div.innerHTML = ''
    div.append(html`text`)
    expect(div.innerHTML).toBe('text')
  })

  it('observable', () => {
    const o = observable()

    div.innerHTML = ''
    div.append(html`${o}`)
    expect(div.innerHTML).toBe('')

    o(0)
    expect(div.innerHTML).toBe('0')

    div.innerHTML = ''
    div.append(html`${() => o() + 1}`)
    expect(div.innerHTML).toBe('1')

    o(1)
    expect(div.innerHTML).toBe('2')
  })
})

describe('attribute', () => {
  it('event', () => {
    const onclick = () => {}
    div.innerHTML = ''
    div.append(html`<a onclick=${onclick}></a>`)
    expect(div.querySelector('a').onclick === onclick)
  })

  it('raw value', () => {
    div.innerHTML = ''
    div.append(html`<a attr=${'attr'}></a>`)
    expect(div.innerHTML).toBe('<a attr="attr"></a>')
  })

  it('observable', () => {
    const o = observable()

    div.innerHTML = ''
    div.append(html`<a attr=${o}></a>`)
    expect(div.innerHTML).toBe('<a attr="undefined"></a>')

    o(0)
    expect(div.innerHTML).toBe('<a attr="0"></a>')

    div.innerHTML = ''
    div.append(html`<a attr=${() => o() + 1}></a>`)
    expect(div.innerHTML).toBe('<a attr="1"></a>')

    o(1)
    expect(div.innerHTML).toBe('<a attr="2"></a>')
  })
})

it('node', () => {
  const world = html`world`
  const hello = html`<a>hello ${world}</a>`
  div.innerHTML = ''
  div.append(hello)
  expect(div.innerHTML).toBe('<a>hello world</a>')
})
