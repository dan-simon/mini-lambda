// the initial strictness declaration
'use strict';

// the eight commands (now far more)
// used to just be
// 's', '$', '.', '`', '^', 'κ', 'ψ' plus 0
// we've added stuff that can be built on those
// plus either and tuple types

var commands = ['s', '$', '.', '`', '^', 'v', '+', '*', '-',
'<', '=', '>', '|', '&', '!', 'd', 'κ', 'ψ',
'min', 'max', 'bool', '<=', '>=', '**', 'while',
'<|', '|>', '<|>', '<&', '&>', '<&>', '*&*'];

// a helpful function

var as_string = function (tree) {
  if (typeof tree !== 'object') {
    return tree.toString();
  } else if (tree.type === 'pair') {
    return '(' + as_string(tree.left) + ' ' + as_string(tree.right) + ')';
  } else {
    throw 'Implementation error!';
  }
}

// catagorizations

var is_primitive = function (x) {
  return is_number(x);
}

var is_number = function (x) {
  return /^\d+$/.exec(x);
}

// dictionary utilities

var copy_d = function (d) {
  var r = {};
  for (var i in d) {
    r[i] = d[i];
  }
  return r;
}

// parsing code

var parse = function (input) {
  if (input.length === 0) {
    throw 'Parsing error!';
  }
  if (input.length === 1 && commands.indexOf(input) !== -1) {
    return input;
  } else if (is_number(input)) {
    return parseInt(input, 10);
  } else if (!(input.startsWith('(') && input.endsWith(')'))) {
    if (input.match(/[() ]/)) {
      throw 'Parsing error!';
    }
    return input;
  } else {
    var parts = break_up(input.slice(1, -1));
    var lambda_loc = parts.lastIndexOf('->');
    var lambda_bit;
    if (lambda_loc === -1) {
      lambda_bit = [];
    } else {
      if ((lambda_loc !== 0 && parts[lambda_loc - 1] !== ' ') ||
      (lambda_loc !== parts.length - 1 && parts[lambda_loc + 1] !== ' ')) {
        throw 'Parsing error!';
      }
      lambda_bit = parts.slice(0, Math.max(lambda_loc - 1, 0));
      parts = parts.slice(lambda_loc + 2);
    }
    if (parts.length % 2 === 0) {
      throw 'Parsing error!';
    }
    if (lambda_bit.length % 2 === 0 && lambda_bit.length > 0) {
      throw 'Parsing error!';
    }
    var result = parse_result_from(parts);
    var vars = get_vars_from(lambda_bit);
    return lambda_embed(vars, nest(result));
  }
}

var get_vars_from = function (parts) {
  if (parts.length === 0) {
    return [];
  }
  var result = [];
  for (var i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i] === ' ') {
        throw 'Parsing error!';
      }
      if (parts[i] !== '->') {
        if (parts[i][0] === '(') {
          var p = parse_result_from_no_nest(break_up(parts[i].slice(1, -1)));
          for (var j = 0; j < p.length; j++) {
            result.push(p[j]);
          }
        } else {
          result.push(parts[i]);
        }
      }
    } else {
      if (parts[i] !== ' ') {
        throw 'Parsing error!';
      }
    }
  }
  return result;
}

var lambda_embed = function (vars, body) {
  for (var i = vars.length - 1; i > -1; i--) {
    body = {'type': 'lambda', 'arg': vars[i], 'body': body};
  }
  return body;
}

var make_parse_result_f = function (f) {
  return function (parts) {
    var result = [];
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        result.push(f(parts[i]));
      } else {
        if (parts[i] !== ' ') {
          throw 'Parsing error!';
        }
      }
    }
    return result;
  }
}

var parse_result_from = make_parse_result_f(parse);

var parse_result_from_no_nest = make_parse_result_f(function (x) {return x});

var nest = function (l) {
  var r = l[0];
  for (var i = 1; i < l.length; i++) {
    r = {'type': 'pair', 'left': r, 'right': l[i]};
  }
  return r;
}

var break_up = function (s) {
  var depth = 0;
  var result = [];
  for (var i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      if (depth === 0) {
        result.push([]);
      }
      depth++;
      result[result.length - 1].push('(');
    } else if (s[i] === ')') {
      if (depth === 0){
        throw 'Parsing error!';
      }
      depth--;
      result[result.length - 1].push(')');
    } else if (s[i] === ' ') {
      if (depth === 0) {
        result.push([' ']);
      } else {
        result[result.length - 1].push(' ');
      }
    } else {
      var new_item = result.length === 0 ||
      result[result.length - 1][0] === ' ';
      if (depth == 0 && new_item) {
        result.push([s[i]]);
      } else {
        result[result.length - 1].push(s[i]);
      }
    }
  }
  if (depth !== 0){
    throw 'Parsing error!';
  }
  return result.map(function (x) {return x.join('')});
}

// variable-checking code

var commands_set = function () {
  var d = {};
  for (var i = 0; i < commands.length; i++) {
    d[commands[i]] = true;
  }
  return d;
}

var check_vars = function (tree, found, reserved) {
  if (typeof tree !== 'object') {
    if (typeof tree === 'string' && !(tree in found)) {
      throw 'Variable error (' + tree + ')!';
    }
  } else if (tree.type === 'pair') {
    check_vars(tree.left, found, reserved);
    check_vars(tree.right, found, reserved);
  } else if (tree.type === 'lambda') {
    if (tree.arg in found || tree.arg in reserved || is_primitive(tree.arg)) {
      throw 'Lambda variable error (' + tree.arg + ')!';
    }
    var d = copy_d(found);
    d[tree.arg] = true;
    check_vars(tree.body, d, copy_d(reserved))
  }
}

// removing lambdas (somewhat inefficiently)

var transpile_one_lambda = function (a, b) {
  if (a === b) {
    return '$';
  } else if (typeof b !== 'object') {
    return {'type': 'pair', 'left': 'κ', 'right': b};
  } else if (b.type !== 'pair') {
    throw 'Implementation error!';
  } else {
    return {
      'type': 'pair',
      'left': {
        'type': 'pair',
        'left': 'ψ',
        'right': transpile_one_lambda(a, b.left)
      },
      'right': transpile_one_lambda(a, b.right)
    };
  }
}

var transpile_lambdas = function (tree) {
  if (typeof tree !== 'object') {
    return tree;
  } else if (tree.type === 'pair') {
    return {
      'type': 'pair',
      'left': transpile_lambdas(tree.left),
      'right': transpile_lambdas(tree.right)
    };
  } else if (tree.type === 'lambda') {
    // first transpile the body to remove internal lambdas, then continue
    return transpile_one_lambda(tree.arg, transpile_lambdas(tree.body));
  }
}

// type-checking code

// getting the types

var get_type_tree = function (tree, s, vars) {
  if (typeof tree === 'string') {
    if (tree in types) {
      return {'type': 'value', 'value': add_each(types[tree], s)};
    } else if (tree in vars) {
      return {'type': 'value', 'value': vars[tree]};
    }
  } else if (typeof tree === 'number') {
    return {'type': 'value', 'value': '%'}
  } else if (tree.type === 'pair') {
    return {'type': 'pair', 'left': get_type_tree(tree.left, s + 'a', vars),
    'right': get_type_tree(tree.right, s + 'b', vars)};
  } else if (tree.type === 'lambda') {
    var v = copy_d(vars);
    v[tree.arg] = s + '&';
    return {'type': 'lambda', 'arg': s + '&',
    'body': get_type_tree(tree.body, s + 'c', v)};
  }
}

var add_each = function (t, s) {
  if (typeof t !== 'string') {
    if (t.length === 2) {
      return [add_each(t[0], s), add_each(t[1], s)];
    } else if (t.length === 3) {
      return [t[0], add_each(t[1], s), add_each(t[2], s)];
    }
  } else if (t === '%') {
    return '%';
  } else {
    return s + t;
  }
}

// checking the types

var types = {
  's': ['%', '%'],
  'v': ['%', '%'],
  '!': ['%', '%'],
  '$': ['a', 'a'],
  '.': [['a', 'b'], [['c', 'a'], ['c', 'b']]],
  '`': [['a', ['b', 'c']], ['b', ['a', 'c']]],
  '^': [['a', 'a'], ['%', ['a', 'a']]],
  'while': [['a', '%'], [['a', 'a'], ['%', ['a', 'a']]]],
  '+': ['%', ['%', '%']],
  '*': ['%', ['%', '%']],
  '**': ['%', ['%', '%']],
  '-': ['%', ['%', '%']],
  '<': ['%', ['%', '%']],
  '>': ['%', ['%', '%']],
  '=': ['%', ['%', '%']],
  '&': ['%', ['%', '%']],
  '|': ['%', ['%', '%']],
  'min': ['%', ['%', '%']],
  'max': ['%', ['%', '%']],
  '<=': ['%', ['%', '%']],
  '>=': ['%', ['%', '%']],
  'bool': ['%', '%'],
  'd': ['a', ['a', ['%', 'a']]],
  'κ': ['a', ['b', 'a']],
  'ψ': [['a', ['b', 'c']], [['a', 'b'], ['a', 'c']]],
  '<|': ['a', ['|', 'a', 'b']],
  '|>': ['b', ['|', 'a', 'b']],
  '<|>': [['a', 'c'], [['b', 'c'], [['|', 'a', 'b'], 'c']]],
  '<&': [['&', 'a', 'b'], 'a'],
  '&>': [['&', 'a', 'b'], 'b'],
  '<&>': [['c', 'a'], [['c', 'b'], ['c', ['&', 'a', 'b']]]],
  '*&*': ['a', ['b', ['&', 'a', 'b']]]
}

var unify = function (a, b, defns) {
  if (typeof a !== 'string') {
    if (typeof b !== 'string') {
      if (a.length !== b.length) {
        throw 'Typechecking error!';
      }
      if (a.length === 2) {
        unify(a[0], b[0], defns);
        unify(replace_in(a[1], defns), replace_in(b[1], defns), defns);
      } else if (a.length === 3) {
        if (a[0] !== b[0]) {
          throw 'Typechecking error!';
        }
        unify(a[1], b[1], defns);
        unify(replace_in(a[2], defns), replace_in(b[2], defns), defns);
      } else {
        throw 'Implementation error!';
      }
    } else if (b === '%') {
      throw 'Typechecking error!';
    } else {
      define(b, a, defns);
    }
  } else if (a === '%') {
    if (typeof b !== 'string') {
      throw 'Typechecking error!';
    } else if (b !== '%') {
      define(b, a, defns);
    }
  } else {
    define(a, b, defns);
  }
}

var define = function (a, b, defns) {
  b = replace_in(b, defns);
  if (is_in(a, b) && a !== b) {
    throw 'Recursive type!';
  }
  for (var i in defns) {
    if (is_in(a, defns[i])) {
      if (is_in(i, b) && i !== b) {
        throw 'Recursive type!';
      }
      var d = {};
      d[a] = b;
      defns[i] = replace_in(defns[i], d);
    }
  }
  defns[a] = b;
}

var is_in = function (a, b) {
  if (typeof b === 'string') {
    return a === b;
  } else if (b.length === 2) {
    return is_in(a, b[0]) || is_in(a, b[1]);
  } else if (b.length === 3) {
    return is_in(a, b[1]) || is_in(a, b[2]);
  } else {
    throw 'Implementation error!';
  }
}

var types_in = function (t) {
  if (typeof t !== 'string') {
    var d = types_in(t[0]);
    for (var i in types_in(t[1])) {
      d[i] = true;
    }
    return d;
  } else if (t === '%') {
    return {};
  } else {
    var d = {};
    d[t] = true;
    return d;
  }
}

var replace_in = function (t, d) {
  if (typeof t !== 'string') {
    if (t.length === 2) {
      return [replace_in(t[0], d), replace_in(t[1], d)];
    } else if (t.length === 3) {
      return [t[0], replace_in(t[1], d), replace_in(t[2], d)];
    } else {
      throw 'Implementation error!';
    }
  } else if (t in d) {
    return d[t];
  } else {
    return t;
  }
}

var rec_merge = function (tree) {
  if (typeof tree !== 'object') {
    throw 'Implementation error!';
  }
  if (tree.type === 'value') {
    return tree.value;
  } else if (tree.type === 'pair') {
    var r_l = rec_merge(tree.left);
    var r_r = rec_merge(tree.right);
    // If we have two type bindings, we actually want a mega-binding
    // that unifies them. We don't just want to take one.
    // We also want to do this in a smart way.
    if (typeof r_l !== 'object') {
      throw 'Typechecking error!';
    }
    var d = {};
    unify(r_l[0], r_r, d);
    return replace_in(r_l[1], d);
  }
}

// replace in code (strangely only needed in evaluation)

var replace_code = function (x, s, r) {
  if (typeof x === 'string') {
    if (x === s) {
      return r;
    } else {
      return x;
    }
  } else if (typeof x === 'number' || typeof x === 'function') {
    return x;
  } else if (x.type === 'pair') {
    return {'type': 'pair', 'left': replace_code(x.left, s, r),
    'right': replace_code(x.right, s, r)}
  } else if (x.type === 'lambda') {
    return {'type': 'lambda', 'arg': x.arg, 'body': replace_code(x.body, s, r)}
  } else {
    throw 'Implementation error!';
  }
}

// actual running-parse-tree code

var fns = {
  's': function (x) {
    return x + 1;
  },
  '$': function (x) {
    return x;
  },
  '.': function (x) {
    return function (y) {
      return function (z) {
        return x(y(z));
      }
    }
  },
  '`': function (x) {
    return function (y) {
      return function (z) {
        return x(z)(y);
      }
    }
  },
  '^': function (x) {
    return function (y) {
      return function (z) {
        for (var i = 0; i < y; i++) {
          z = x(z);
        }
        return z;
      }
    }
  },
  'v': function (x) {
    if (x === 0) {
      return 0;
    } else {
      return x - 1;
    }
  },
  '+': function (x) {
    return function (y) {
      return x + y;
    }
  },
  '*': function (x) {
    return function (y) {
      return x * y;
    }
  },
  '**': function (x) {
    return function (y) {
      return Math.pow(x, y);
    }
  },
  '-': function (x) {
    return function (y) {
      if (x > y) {
        return x - y;
      } else {
        return 0;
      }
    }
  },
  'd': function (x) {
    return function (y) {
      return function (z) {
        if (z === 0) {
          return x;
        } else {
          return y;
        }
      }
    }
  },
  'κ': function (x) {
    return function (y) {
      return x;
    }
  },
  'ψ': function (x) {
    return function (y) {
      return function (z) {
        return x(z)(y(z));
      }
    }
  },
  '&': function (x) {
    return function (y) {
      if (x === 0) {
        return 0;
      } else {
        return y;
      }
    }
  },
  '|': function (x) {
    return function (y) {
      if (x === 0) {
        return y;
      } else {
        return x;
      }
    }
  },
  '!': function (x) {
    if (x === 0) {
      return 1;
    } else {
      return 0;
    }
  },
  'bool': function (x) {
    if (x === 0) {
      return 0;
    } else {
      return 1;
    }
  },
  'min': function (x) {
    return function (y) {
      if (x < y) {
        return x;
      } else {
        return y;
      }
    }
  },
  'max': function (x) {
    return function (y) {
      if (x > y) {
        return x;
      } else {
        return y;
      }
    }
  },
  '<': function (x) {
    return function (y) {
      if (x < y) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  '>': function (x) {
    return function (y) {
      if (x > y) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  '=': function (x) {
    return function (y) {
      if (x === y) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  '<=': function (x) {
    return function (y) {
      if (x <= y) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  '>=': function (x) {
    return function (y) {
      if (x >= y) {
        return 1;
      } else {
        return 0;
      }
    }
  },
  'while': function (w) {
    return function (x) {
      return function (y) {
        return function (z) {
          for (var i = 0; i < y; i++) {
            if (w(z) === 0) {
              return z;
            }
            z = x(z);
          }
          return z;
        }
      }
    }
  },
  '<|': function (x) {
    return {'left': x};
  },
  '|>': function (x) {
    return {'right': x};
  },
  '<|>': function (f) {
    return function (g) {
      return function (x) {
        if ('left' in x) {
          return f(x.left);
        } else if ('right' in x) {
          return g(x.right);
        } else {
          throw 'Implementation error!';
        }
      }
    }
  },
  '<&': function (x) {
    return x[0];
  },
  '&>': function (x) {
    return x[1];
  },
  '<&>': function (f) {
    return function (g) {
      return function (x) {
        return [f(x), g(x)];
      }
    }
  },
  '*&*': function (x) {
    return function (y) {
      return [x, y];
    }
  }
}

var calculate = function (tree) {
  if (typeof tree === 'string') {
    if (tree in fns) {
      return fns[tree];
    } else {
      throw 'Implementation error!';
    }
  } else if (typeof tree === 'number') {
    return tree;
  } else if (tree.type === 'pair') {
    return calculate(tree.left)(calculate(tree.right));
  }
}

// the hack of type tree printing
var print_type_tree = (function () {
  var v = 0;
  var l_hash = {};
  return function (h) {
    if (h === 'reset') {
      v = 0;
      for (var i in l_hash) {
        delete l_hash[i];
      }
      return;
    }
    if (typeof h === 'string') {
      if (h === '%') {
        return h;
      } else if (h in l_hash) {
        return l_hash[h];
      } else {
        v++;
        l_hash[h] = v;
        return v;
      }
    } else if (h.length === 2) {
      return '(' + h.map(print_type_tree).join(' ') + ')';
    } else if (h.length === 3) {
      return '(' + h[0] + ' ' +
      h.slice(1).map(print_type_tree).join(' ') + ')';
    } else {
      throw 'Implementation error!';
    }
  }
})();

// value to string

var value_string = function (x) {
  if (Array.isArray(x)) {
    if (x.length !== 2) {
      throw 'Implementation error!';
    } else {
      return '(*&* ' + value_string(x[0]) + ' ' + value_string(x[1]) + ')';
    }
  } else if (typeof x === 'function') {
    return '[function]';
  } else if (typeof x === 'number') {
    return x.toString();
  } else if (typeof x !== 'object' || !x) {
    throw 'Implementation error!';
  } else if ('left' in x) {
    return '(<| ' + value_string(x.left) + ')'
  } else if ('right' in x) {
    return '(|> ' + value_string(x.right) + ')'
  } else {
    throw 'Implementation error!';
  }
}

// the glue function

var execute = function (x) {
  var tree = parse(x);
  check_vars(tree, commands_set(), {'->': true});
  tree = transpile_lambdas(tree);
  var g = get_type_tree(tree, '*', {});
  var h = rec_merge(g);
  // messy, called for side effects in a closure
  // you can change, but this line does do something
  // and does not print
  print_type_tree('reset');
  var c = calculate(tree);
  return [print_type_tree(h), value_string(c), c];
}

// what we allow outside access to

module.exports = execute;

// examples
// multiplication via lambda
// (x y -> . (` ^ x) (` ^ y) s 0)

// s combinator
// (x y z -> x z (y z))

// Now good.
// console.log(execute('(. ((` ^) 22) ((` ^) 33) s 0)'))

// Ackermann with 3 and 3. (Type checks!)
// console.log(execute('(` (^ (. (. (` $ 1) `) (. (. (` $ s) .) ^))) s 3 3)'));

// simpler ackermann (with 3 and 5)
// (` (^ (f n -> ^ f (s n) 1)) s 3 5)

// Fails!
// console.log(execute('(s s)'))

// Also fails.
// ($ 3 4)

// A recursive type now does fail.
// console.log(execute('(. (` $ $) (. (` ^ 2) (` $)))'))

// new Ackermanm
// (` (^ (. (` . s) (. (` ` 1) ^))) s 4 1)
