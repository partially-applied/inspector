![](http://imgur.com/CWdlttG.jpg)

## Guide

### Primer on Input Validation

Perfect-Code™ (*noun*) - Code that **you** think is perfect.

Lets say you have written some Perfect-Code™. Now regardless of how perfect your code is, at the boundary you will always be exposed to dealing with imperfect values as input.  These values need to be filtered out, repaired, or if they are imperfect beyound repair then your program might need to terminate.

![](http://imgur.com/hG8Wp6q.jpg)


Normally what arrives at the door of your Perfect-Code™ is a *compound* value. How can someone validate compound values ? 

The simplest way  is to write *individual* functions that validate each part of the compound value, if we know each part is perfect then surely the compound value is also perfect. Also, if we can provide a definition for each of the parts then we can state that they are of a **type**. 

The interesting thing is these individual validator functions can be used to ***define*** those types. Instead of stating in documentation that the input needs to be a `date` value - which is vague, its more precise to write an actual function that acts as a decider as to what a date value actually ***means***. As in any value that passes your test function is what defines a `date` type.


**A simple validator function**

Imagine you have a simple variable for number that is passed as a string - maybe from a `.json` file.

```livescript
Age = "22"

```

  
A simple validation function for age might look like this :


```livescript

isAge = (value) ->

 age = parseFloat value
 
 if age === NaN
  return false
 else
  return true

```


You will notice right away that `isAge` will not correct for all:

*possible things that can be passed as an argument to a javascript function*

It turns out writing a good validator function is really **hard** - [Andre Staltz has written a excellect article on this topic](http://staltz.com/is-your-javascript-function-actually-pure.html) - even for something as simple as a number. Things that we need to worry about includes. 

- negative numbers.
- Age needs to be whole numbers.
- Appropiate age range, maybe from 0 to 150, this also changes based on application.
- What happens if the `typeof` is a number already, instead of a string.

A more complete validator function would look like this :


```livescript

isAge = (range,value) ->

 age = parseFloat value
 
 if age === NaN

  return [false,"Age is not a numerical value"] 

 else

   if Math.abs (age - Math.round age) > 0.00001

    return [false,"Age is not a whole number"]

   else

    if age < 0

     return [false,"Age is a negative value"]

    else

     if range.start < age < range.end

      return [true] # All Conditions are finally Met!

     else

      return [false,"Age is not within range"]


```


This is much better.

**however** it still rests on the behaviour of `parseFloat`,

`parseFloat` may look innocent but it makes critical assumptions about what *you want*.

For example:

```livescript
 
parseFloat "22.-1" # 22

parseFloat "22.£" # 22

```

It turns out `parseFloat` does greedy parsing and ignores once a match is made.

For now it seems `parseFloat` is making reasonable assumptions for our example, but what is reasonable may change based on your application.


**Note:** Most programmers at this point start to make tradeoffs based on [diminishing returns](https://en.wikipedia.org/wiki/Diminishing_returns) , if the above code covers *99.99%* of possible expected inputs for your application, it might just be fine to not take into account the *0.01%* cases.

**House Cleaning**

If your validator function is going to be run *many* **many** times, a simple optimization win would be to move all your long debug messages to the upper scope, it helps when it comes to code refactoring :

```livescript

debug =
 *nan:"Age is not a numerical value"
  whole:"Age is not a whole number"
  negative:"Age is a negative value"
  range:"Age is not within range"

isAge = (range,value) ->


 age = parseFloat value
 
 if age === NaN

  return [false,debug.nan] 

 else

   if Math.abs (age - Math.round age) > 0.00001

    return [false,debug.whole]

   else

    if age < 0

     return [false,debug.negative]

    else

     if range.start < age < range.end

      return [true] 

     else

      return [false,debug.range]

# A lot cleaner
```




#### **Enhanced Validator Function**

You will notice that the return type for our `isAge` validator function has the following type signature `[Boolean,String]` - this is the *preferred* return type for `@partially-applied/inspector`.

A return type of `[Boolean,String]` allows our validator function to be more useful for message passing.

Most third party validator functions have a return type of `Boolean`.

`partially-applied/inspector` is written to make it easy to work with validator functions that only return `Boolean` value:

```livescript
lo = require 'lodash'


inspector = require 'partially-applied/inspector'

S = lo.isString # Third party validator functoin with return type of Boolean only

schema = 
 drink:S

inspectorDefault = inspector.default

console.log inspectorDefault schema,{drink:'hello world'} # true

# so far so good - since default accepts functions in schema that return bool
# however what happens when you want to mix validator functions with different
# types ? 

inspectorWithError = inspector.withError # ony accepts [Bool,String]


mS = (val) -> 
  
  res = S val

  [res,"Test Debug Message"]

# The process of converting a normal f ( in this case its S ) into one with 
# the correct return type is called lifting. Lifting is just exactly what we 
# did with S , but manually.

schema1 = 
 drink:mS

console.log inspectorWithError schema1,{drink:1} 
# [false,['drink'],"Test Debug Message"]

```

- When time permits its best to manually write your validator functions, but for convience we can use the helper function `inspector.lift` for **autolifting**.

- `inspector.lift` and `inspector.withError` are a *pair*.

```livescript

mS = inspector.lift lo.isString 
# mS has a return type of [Bool,String]

```

### **Using ```partially-applied/inspector```**

Schemas are just objects that provides struture to your input values. As your application becames larger, you will need to worry about *nested schemas*,
`inspector`  was speficially created for dealing with *deeply* nested schemas:

```livescript


lo = require "lodash"

S = (x) -> [(lo.isString x),'Not a String']

N = (x) -> [(lo.isNumber x),'Not a Number'] # validates numbers

schema =
 name:
  first:S
  last:S
 birth:
  day:N
  month:S
  year:N
 

# A nested schema with depth = 2
# Lets see how inspector can be useful .. 


# A test input value

smartyPants =
 name:
  first:"Leonhard"
  last:"Euler"
 birth: 
  day:15
  month:'April'
  year:1707


inspector = (require '@partially-applied/inspector').withError


inspector schema, smartyPants 
# > [true,[],""]

smartyPants.birth.day = "15" # now for an incorrect input type

inspector schema, smartyPants 
# > [false,['birth','day'],"Not a Number"]

# Notice how we constantly need to pass schema
# see below how we can partially apply to make our code easier to read

person = inspector schema

person smartyPants 
# > [false,['birth','day'],"Not a Number"]

# partial application in inspector does more than make things
# more succient, internally inspector builds a fast cached
# tree.

```


The return type for inspector is inspired from the specs that exists for the [writer monad](http://learnyouahaskell.com/for-a-few-monads-more), notice that we actually do **not** perform any IO like logging to the console, we leave it to the callie to contexulize and print something more descriptive for the application. 

The writer monad has one important disavantage when we use it in production. Use of `.concat` puts extra pressure on the garbage collector for no added benefit that comes with immutability. Its better to make sure our memory usage is constant.

This is why inspector builds a cached tree of your schema.

### How `inspector`'s caching works

```livescript
# Imagine if we had a schema that looked like this

S = (require 'lodash').isString

schema = 
 a:
   b:
     d:S
     e:S
  c:
     f:S
     g:S 

```


![](http://imgur.com/8wxsj91.jpg)


```livescript

inspector = (require 'partially-applied/inspector').default


enforcer = inspector schema # cache tree gets created here


enforcer testinput1

enforcer testinput2

enforcer testinput2
     .     .      
     .     .     
     .     .     
     .     .     
     .     .     
enforcer testinputN # for N input our memory complexity is O(1)

```




**Note on Composiblity**

An `inspector` function with a cached schema *itself* is a validator function !

Composbility should be easy, but we will not recieve all the input due to type mismatch, you would again need to write a glue function that figures out how to best flatten the error message.




**Conclusion**

This guide touches on a lot of interesting topics - types, error handling, validator. I find these topics extremely important and there is a lot that can be said on it but its mostly out of scope for this guide. `@partially-applied/inspector` is closer to a protocol then anything else.

I hope you enjoyed reading this article as much as I enjoyed writing it. If there are any questions/recommendations on improvments I would be keen to dicuss it, since `github` does not have a general comment section, raising an issue would be just fine. 






