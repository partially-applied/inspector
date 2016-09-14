


unit = Object.freeze [true,[],""] # read only value

o = 'object'

objectError = "Not an Object" 



main = (schema,user,option) ->

	switch option # Just do not run
	| 2 => return unit
	| 3 => return true


	output = undefined

	for key of schema

		val-schema = schema[key]

		val-user = user[key]

		if val-schema.object

			if (typeof val-user) is o

				inner-check = main val-schema.next,val-user,option

				if not inner-check[0]

					output = inner-check # !E

					break
 
			else

				output = [false,val-schema.key,objectError] # !E

				break

		else

			evalVal = val-schema.next val-user,val-schema.key


			switch option
			| 1 => 
				if evalVal[0] then {/* true means that we can continue loop ^ */}
				else
					output = [false,val-schema.key,evalVal[1]] # E!

					break
			| 0 =>
				if evalVal then {/* true means that we can continue loop ^ */}
				else

					output = [false,val-schema.key] # E!
					break
			
			if output
				break



	if output
		return output
	else
		return unit
		





create-cache = (schema,path = []) ->

	tree = {}

	for key of schema

		o = false

		current-path = path.concat key

		if (typeof schema[key]) is 'object'

			tree[key] = 
				key:current-path
				object:true
				next:(create-cache schema[key],current-path)

		else

			tree[key] =
				key:(Object.freeze current-path) # immutable value
				object:false
				next:schema[key]


	tree



start = (option) -> (schema) -> 

	cached-schema = create-cache schema

	switch arguments.length 
	| 1 =>

		(user) -> 

			output = main cached-schema,user,option

			return output

	| 2 =>

		output = main cached-schema,arguments[1],option

		
		return output

lift = (f,message = "") -> (value) ->  [(f value),message]



module.exports = 
	default:start 0
	withError:start 1
	off:
		default:start 3
		withError:start 2
	lift:lift
	__esModule:true
