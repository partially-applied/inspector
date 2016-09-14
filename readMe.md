
![](http://imgur.com/CWdlttG.jpg)


*fast schema validator for nested json*



```

npm install @partially-applied/inspector

```

### Quick Guide

```livescript

inspector = require('@partially-applied/inspector').default

lo = require('lodash')

S = lo.isString

schema =
 a:S
 b:
   c:S
   d:S

testInput1 = # Correct Input
 a:"hello"
 b:
   c:"foo"
   d:'world'


tester = inspector(schema)

console.log tester testInput1 # [true]

testInput2 = # Incorrect Input
 a:"hello"
 b:
  *c:"foo"
   d:1


console.log(tester(testInput2)) # [false,['b','d']]

```



Features

- Performance
- Small API surface
- Error handling inspired from studying the writer monad.

Docs

- I have written a [short post](https://github.com/partially-applied/inspector/blob/master/doc/guide.md) that details the context under which `@partially-applied/inspector` is useful. 

- The [API guide](https://github.com/partially-applied/inspector/blob/master/doc/api.md) on the otherhand is for quick referencing purpose.










