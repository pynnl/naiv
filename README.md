# naiv
Naive implementation of a template library

**npm**: `npm i -S naiv`

## observable
```javascript
import { observable } from 'naiv'

const o = observable()
console.log(o()) // undefined

o('hello world')
console.log(o()) // hello world
```

## watch
```javascript
import { observable, watch } from 'naiv'

const o = observable()
watch(() => console.log(o())) // undefined

o('hello world') // hello world
```

```javascript
import { observable, watch } from 'naiv'

const o = observable(0)
watch(() => {
  console.log(o())
  if (o() < 10)
    o(o() + 1)
})

// 0
// 1
// ...
// 10
```

## template
```javascript
import { html } from 'naiv'

document.body.append(html`<span>hello world</span>`)
```

```javascript
import { observable, html } from 'naiv'

const Component = () => {
  const attr = 'attr'
  const text = observable('text')
  const nested = html`<div>nested</div>`
  
  return html`
    <div attr=${attr}>
      <span>${text}</span>
      ${nested}
    </div>`
}

console.log(Component())
// <div attr=attr>
//   <span>text</span>
//   <div>nested</div>
// </div>
```

```javascript
import { observable, html } from 'naiv'

const o = observable(0)
const e = html`
  <div>
    ${o}
    ${o() + 1}
    ${() => o() + 1}
  </div>
`
console.log(e)
// <div>
//   0
//   1
//   1
// </div>

o(1)
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

const o = observable(['a', 'b', 'c'])
const e = map(
  o, // array observable
  html`<ul></ul>`, // root element
  (value, index) => value, // key function
  (value, index) => html`<li>${value} - ${index}</li>`
)
console.log(e)
// <ul>
//   <li>a - 0</li>
//   <li>b - 1</li>
//   <li>c - 2</li>
// </ul>

o(['a', 'c'])
console.log(e)
// <ul>
//   <li>a - 0</li>
//   <li>c - 1</li>
// </ul>
```

## Inspiration
This is just a hobby practical project outside of school I do in my freetime. Got inspired a lot after reading Ryan Solid's article about reactivity, and seeing Sinuous template syntax. Learned a lot from them, big thanks.
