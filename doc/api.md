![](http://imgur.com/CWdlttG.jpg)

**Note**: This page is only for type signatures, for a detailed guide on how to use them refer [here](./guide.md). 

## API

- `default` `:: schema -> data -> Bool`

    
- `withError` `:: schema -> data -> [Bool,String]`

    

- `lift`

    `f    :: x -> Bool`

    `g    :: x -> [Bool,message]`

    `lift :: f -> message -> g`
    
    `lift` is a simple function that takes `f` and returns a lifted function `g`. Message is an optional paramater which is `String("")` if not specified.

- `off`

    - `default` `:: schema -> data -> Bool(true)`

      A constant function that always returns `true` for any input

    - `withError` `:: schema -> data -> [Bool(true),Array([]),String("")]` 

      A constant function that always returns `[true,[],""]` for any input
      
      **Note:** `[true,[],""]` is defined as unit












    
