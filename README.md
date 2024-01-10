# type-check-lib
[![install size](https://packagephobia.com/badge?p=type-check-lib)](https://packagephobia.com/result?p=type-check-lib)
[![npm](https://img.shields.io/npm/v/type-check-lib)](https://npm.im/type-check-lib)
[![codecov](https://codecov.io/gh/iyegoroff/type-check-lib/branch/main/graph/badge.svg?t=1520230083925)](https://codecov.io/gh/iyegoroff/type-check-lib)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Ftype-check-lib%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/babel-plugin-type-check-lib)
[![npm](https://img.shields.io/npm/l/type-check-lib.svg?t=1495378566925)](https://www.npmjs.com/package/type-check-lib)

Fast, small data validator
Inspired by [spectypes](https://github.com/iyegoroff/spectypes)

---

## Getting started

Install the package:

```sh
npm i type-check-lib
```

## Reference

Primitive validators

- [boolean](#boolean)
- [literal](#literal)
- [nullish](#nullish)
- [number](#number)
- [string](#string)
- [unknown](#unknown)

Complex validators

- [array](#array)
- [filter](#filter)
- [limit](#limit)
- [map](#map)
- [object](#object)
- [optional](#optional)
- [record](#record)
- [template](#template)
- [tuple](#tuple)
- [union](#union)

## Examples

### Primitive validators

#### boolean

```ts
import { boolean } from 'type-check-lib'

const check = boolean

expect(check(true)).toEqual({
  tag: 'success',
  success: true
})

expect(check('false')).toEqual({
  tag: 'failure',
  failure: {
    value: 'false',
    errors: [{ issue: 'not a boolean', path: [] }]
  }
})
```

---

#### literal

```ts
import { literal } from 'type-check-lib'

const check = literal('test')

expect(check('test')).toEqual({
  tag: 'success',
  success: 'test'
})

expect(check('temp')).toEqual({
  tag: 'failure',
  failure: {
    value: 'temp',
    errors: [{ issue: "not a 'test' string literal", path: [] }]
  }
})
```

---

#### nullish

```ts
import { nullish } from 'type-check-lib'

const check = nullish

expect(check(undefined)).toEqual({
  tag: 'success'
  success: undefined
})

expect(check(null)).toEqual({
  tag: 'success'
  success: undefined
})

expect(check(123)).toEqual({
  tag: 'failure',
  failure: {
    value: 'temp',
    errors: [{ issue: "not 'null' or 'undefined'", path: [] }]
  }
})
```

---

#### number

```ts
import { number } from 'type-check-lib'

const check = number

expect(check(0)).toEqual({
  tag: 'success',
  success: 0
})

expect(check({})).toEqual({
  tag: 'failure',
  failure: {
    value: {},
    errors: [{ issue: 'not a number', path: [] }]
  }
})
```

---

#### string

```ts
import { string } from 'type-check-lib'

const check = string

expect(check('')).toEqual({
  tag: 'success',
  success: ''
})

expect(check(null)).toEqual({
  tag: 'failure',
  failure: {
    value: null,
    errors: [{ issue: 'not a string', path: [] }]
  }
})
```

---

#### unknown

```ts
import { unknown } from 'type-check-lib'

const check = unknown

expect(check('anything')).toEqual({
  tag: 'success',
  success: 'anything'
})
```

---

### Complex validators

#### array

```ts
import { array, number } from 'type-check-lib'

const check = array(number)

expect(check([1, 2, 3])).toEqual({
  tag: 'success',
  success: [1, 2, 3]
})

expect(check({ 0: 1 })).toEqual({
  tag: 'failure',
  failure: {
    value: { 0: 1 },
    errors: [{ issue: 'not an array', path: [] }]
  }
})

expect(check([1, 2, '3', false])).toEqual({
  tag: 'failure',
  failure: {
    value: [1, 2, '3', false],
    errors: [
      { issue: 'not a number', path: [2] },
      { issue: 'not a number', path: [3] }
    ]
  }
})
```

---

#### filter

```ts
import { array, number, filter } from 'type-check-lib'

const check = array(filter(filter(number, (x) => x < 10), (x) => x > 1))

expect(check([1, 2, 3, 11])).toEqual({
  tag: 'success',
  success: [2, 3]
})

expect(check([1, 2, null])).toEqual({
  tag: 'failure',
  failure: {
    value: [1, 2, null],
    errors: [{ issue: 'not a number', path: [2] }]
  }
})
```

---

#### limit

```ts
import { number, limit } from 'type-check-lib'

const check = limit(number, (x) => x > 1)

expect(check(5)).toEqual({
  tag: 'success',
  success: 5
})

expect(check(-5)).toEqual({
  tag: 'failure',
  failure: {
    value: -5,
    errors: [{ issue: 'does not fit the limit', path: [] }]
  }
})

expect(check('5')).toEqual({
  tag: 'failure',
  failure: {
    value: '5',
    errors: [{ issue: 'not a number', path: [] }]
  }
})
```

---

#### map

```ts
import { number, map } from 'type-check-lib'

const check = map(number, (x) => x + 1)

expect(check(10)).toEqual({
  tag: 'success',
  success: 11
})

expect(check(undefined)).toEqual({
  tag: 'failure',
  failure: {
    value: undefined,
    errors: [{ issue: 'not a number', path: [] }]
  }
})
```

---

#### object

```ts
import { object, number, string, boolean } from 'type-check-lib'

const check = object({ x: number, y: string, z: boolean })

expect(check({ x: 1, y: '2', z: false })).toEqual({
  tag: 'success',
  success: { x: 1, y: '2', z: false }
})

expect(check({ x: 1, y: '2', z: false, xyz: [] })).toEqual({
  tag: 'failure',
  failure: {
    value: { x: 1, y: '2', z: false, xyz: [] },
    errors: [{ issue: 'excess key - xyz', path: [] }]
  }
})

expect(check({})).toEqual({
  tag: 'failure',
  failure: {
    value: {},
    errors: [
      { issue: 'not a number', path: ['x'] },
      { issue: 'not a string', path: ['y'] },
      { issue: 'not a boolean', path: ['z'] }
    ]
  }
})

expect(check([])).toEqual({
  tag: 'failure',
  failure: {
    value: [],
    errors: [{ issue: 'not an object', path: [] }]
  }
})
```

---

#### optional

```ts
import { optional, struct, number } from 'type-check-lib'

const check = struct({ x: optional(number) })

expect(check({ x: 5 })).toEqual({
  tag: 'success',
  success: { x: 5 }
})

expect(check({ x: undefined })).toEqual({
  tag: 'success',
  success: { x: undefined }
})

expect(check({})).toEqual({
  tag: 'success',
  success: {}
})

expect(check({ x: 'x' })).toEqual({
  tag: 'failure',
  failure: {
    value: { x: 'x' },
    errors: [{ issue: 'not a number', path: ['x'] }]
  }
})
```

---

#### record

```ts
import { record, boolean } from 'type-check-lib'

const check = record(boolean)

expect(check({ foo: false, bar: true })).toEqual({
  tag: 'success',
  success: { foo: false, bar: true }
})

expect(check(true)).toEqual({
  tag: 'failure',
  failure: {
    value: true,
    errors: [{ issue: 'not an object', path: [] }]
  }
})

expect(check({ toString: true })).toEqual({
  tag: 'failure',
  failure: {
    value: { toString: true },
    errors: [{ issue: "includes banned 'toString' key", path: [] }]
  }
})
```

---

#### template

```ts
import { template, literal, number, string, boolean } from 'type-check-lib'

const check = template(literal('test'), string, number, boolean)

expect(check('test___123false')).toEqual({
  tag: 'success',
  success: 'test___123false'
})

expect(check('test___false')).toEqual({
  tag: 'failure',
  failure: {
    value: 'test___false',
    errors: [{ issue: 'template literal mismatch', path: [] }]
  }
})
```

---

#### tuple

```ts
import { tuple, number, string, boolean } from 'type-check-lib'

const check = tuple(number, string, boolean)

expect(check([1, '2', false])).toEqual({
  tag: 'success',
  success: [1, '2', false]
})

expect(check([])).toEqual({
  tag: 'failure',
  failure: {
    value: [],
    errors: [{ issue: 'length is not 3', path: [] }]
  }
})

expect(check([1, '2', false, 1000])).toEqual({
  tag: 'failure',
  failure: {
    value: [1, '2', false, 1000],
    errors: [{ issue: 'length is not 3', path: [] }]
  }
})

expect(check(['1', '2', 'false'])).toEqual({
  tag: 'failure',
  failure: {
    value: ['1', '2', 'false'],
    errors: [
      { issue: 'not a number', path: [0] },
      { issue: 'not a boolean', path: [2] }
    ]
  }
})
```

---

#### union

```ts
import { union, number, string, boolean } from 'type-check-lib'

const check = union(number, string, boolean)

expect(check('temp')).toEqual({
  tag: 'success',
  success: 'temp'
})

expect(check(true)).toEqual({
  tag: 'success',
  success: true
})

expect(check(null)).toEqual({
  tag: 'failure',
  failure: {
    value: null,
    errors: [
      { issue: 'union case #0 mismatch: not a number', path: [] },
      { issue: 'union case #1 mismatch: not a string', path: [] },
      { issue: 'union case #2 mismatch: not a boolean', path: [] }
    ]
  }
})
```