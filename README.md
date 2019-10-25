# naiv
Naive implementation of a template library

**npm**: `npm i -S naiv`

## observable
```javascript
import { observable } from 'naiv'

const o = observable()
console.log(o.$) // undefined

o.$ = 'hello world'
console.log(o.$) // hello world
console.log(o + '!') // hello world!
```

## watch
```javascript
import { observable, watch } from 'naiv'
let n
const o = observable(0)
watch(() => n = o + 1)
console.log(n) // 1

o.$ = 1
console.log(n) // 2
```

```javascript
import { observable, watch } from 'naiv'

const o = observable(0)
watch(() => {
  console.log(o.$)
  if (o < 10)
    o.$ += 1
})

// 0
// 1
// ...
// 10
```

## template
```javascript
import { html, render } from 'naiv'

document.body.append(render(() => html`<span>hello world</span>`))
console.log(document.body.innerHTML) // <span>hello world</span>
```

```javascript
import { observable, html, render } from 'naiv'

const Nested = text => html`<div>${text}</div>`

const Component = () => {
  const attr = 'attr'
  const text = observable('text')
  
  return html`
    <div attr=${attr}>
      <span>${text}</span>
      ${render(Nested, 'nested')}
    </div>`
}

console.log(render(Component))

// <div attr=attr>
//   <span>text</span>
//   <div>nested</div>
// </div>
```

```javascript
// reactive template
import { observable, html } from 'naiv'

const o = observable(0)
const e = render(() => html`
  <div>
    ${o}
    ${o + 1}
    ${() => o + 1}
  </div>
`)
console.log(e)
// <div>
//   0
//   1
//   1
// </div>

o.$ = 1
console.log(e)
// <div>
//   1
//   1
//   2
// </div>
```

## map
```javascript
import { observable, html, map } from 'naiv'

const array = observable(['a', 'b', 'c'])
const e = map(array, (value, index) => html`<li>${value} - ${index}</li>`)
console.log(e)
// <ul>
//   <li>a - 0</li>
//   <li>b - 1</li>
//   <li>c - 2</li>
// </ul>

o.$ = ['a', 'c']
console.log(e)
// <ul>
//   <li>a - 0</li>
//   <li>c - 1</li>
// </ul>
```

## Inspiration
This is just a hobby practical project outside of school I do in my freetime. Got inspired a lot after reading Ryan Solid's article about reactivity, and seeing Sinuous template syntax. Learned a lot from them, big thanks.
