var unit, o, objectError, switchedOff, main, createCache, start, lift;
unit = Object.freeze([true, [], ""]);
o = 'object';
objectError = "Not an Object";
switchedOff = function(schema, user, option){
  switch (option) {
  case 2:
    return unit;
  case 3:
    return true;
  }
};
main = function(schema, user, option){
  var output, key, valSchema, valUser, innerCheck, evalVal;
  output = undefined;
  for (key in schema) {
    valSchema = schema[key];
    valUser = user[key];
    if (valSchema.object) {
      if (typeof valUser === o) {
        innerCheck = main(valSchema.next, valUser, option);
        if (!innerCheck[0]) {
          output = innerCheck;
          break;
        }
      } else {
        output = [false, valSchema.key, objectError];
        break;
      }
    } else {
      evalVal = valSchema.next(valUser, valSchema.key);
      switch (option) {
      case 1:
        if (evalVal[0]) {
          ({});
        } else {
          output = [false, valSchema.key, evalVal[1]];
          break;
        }
        break;
      case 0:
        if (evalVal) {
          ({});
        } else {
          output = [false, valSchema.key];
          break;
        }
      }
      if (output) {
        break;
      }
    }
  }
  if (output) {
    return output;
  } else {
    return unit;
  }
};
createCache = function(schema, path){
  var tree, key, o, currentPath;
  path == null && (path = []);
  tree = {};
  for (key in schema) {
    o = false;
    currentPath = path.concat(key);
    if (typeof schema[key] === 'object') {
      tree[key] = {
        key: currentPath,
        object: true,
        next: createCache(schema[key], currentPath)
      };
    } else {
      tree[key] = {
        key: Object.freeze(currentPath),
        object: false,
        next: schema[key]
      };
    }
  }
  return tree;
};
start = function(option){
  return function(schema){
    var cachedSchema, output;
    cachedSchema = createCache(schema);
    switch (arguments.length) {
    case 1:
      return function(user){
        var output;
        output = main(cachedSchema, user, option);
        return output;
      };
    case 2:
      output = main(cachedSchema, arguments[1], option);
      return output;
    }
  };
};
lift = function(f, message){
  message == null && (message = "");
  return function(value){
    return [f(value), message];
  };
};
module.exports = {
  'default': start(0),
  withError: start(1),
  off: {
    'default': start(3),
    withError: start(2)
  },
  lift: lift,
  __esModule: true
};