// https://github.com/iyegoroff/spectypes

function boolean(val) {
  return typeof val === 'boolean'
    ? {
        tag: 'success',
        success: val,
      }
    : {
        tag: 'failure',
        failure: {
          value: val,
          errors: [
            {
              issue: 'not a boolean',
              path: [],
            },
          ],
        },
      };
}

function literal(val) {
  function l(arg) {
    return arg === val
      ? {
          tag: 'success',
          success: val,
        }
      : {
          tag: 'failure',
          failure: {
            value: arg,
            errors: [
              {
                issue: 'not equal to '.concat(val),
                path: [],
              },
            ],
          },
        };
  }
  l._template = literal._template(val);
  return l;
}

function nullish(val) {
  return val == null
    ? {
        tag: 'success',
        success: val,
      }
    : {
        tag: 'failure',
        failure: {
          value: val,
          errors: [
            {
              issue: 'not nullish',
              path: [],
            },
          ],
        },
      };
}

function number(val) {
  return typeof val === 'number'
    ? {
        tag: 'success',
        success: val,
      }
    : {
        tag: 'failure',
        failure: {
          value: val,
          errors: [
            {
              issue: 'not a number',
              path: [],
            },
          ],
        },
      };
}

function string(val) {
  return typeof val === 'string'
    ? {
        tag: 'success',
        success: val,
      }
    : {
        tag: 'failure',
        failure: {
          value: val,
          errors: [
            {
              issue: 'not a string',
              path: [],
            },
          ],
        },
      };
}

function unknown(val) {
  return {
    tag: 'success',
    success: val,
  };
}

function array(check) {
  function checkArray(val) {
    if (Array.isArray(val)) {
      const errors = [];
      const resultArray = [];

      for (let i = 0; i < val.length; i++) {
        const result = check(val[i]);
        if (!result) continue;

        if (result.tag === 'failure') {
          errors.push({
            issue: result.failure.errors[0].issue,
            // TODO check it
            path: [i].concat(result.failure.errors[0].path),
          });
        } else {
          resultArray.push(result.success);
        }
      }

      if (errors.length === 0) {
        return {
          tag: 'success',
          success: resultArray,
        };
      }
      return {
        tag: 'failure',
        failure: {
          value: val,
          errors,
        },
      };
    }
    return {
      tag: 'failure',
      failure: {
        value: val,
        errors: [
          {
            issue: 'not an array',
            path: [],
          },
        ],
      },
    };
  }
  checkArray._template = array._template;
  return checkArray;
}

const SymbolFilter = Symbol('filter');

function filter(check, additionalCondition) {
  function checkFilter(val) {
    const result = check(val);
    if (!result) return result;

    if (result.tag === 'failure') {
      return result;
    }
    return additionalCondition(result.success) ? result : null;
  }
  checkFilter._template = filter._template;
  checkFilter[SymbolFilter] = true;
  return checkFilter;
}

function limit(check, additionalCondition) {
  function checkLimit(val) {
    const result = check(val);

    if (result.tag === 'failure') {
      return result;
    }
    return additionalCondition(result.success)
      ? result
      : {
          tag: 'failure',
          failure: {
            value: val,
            errors: [
              {
                issue: 'does not fit the limit',
                path: [],
              },
            ],
          },
        };
  }
  checkLimit._template = limit._template;
  return checkLimit;
}

function map(check, transform) {
  function checkMap(val) {
    const result = check(val);
    if (!result) return result;

    if (result.tag === 'failure') {
      return result;
    }
    return {
      tag: 'success',
      success: transform(result.success),
    };
  }
  checkMap._template = map._template;
  return checkMap;
}

const SymbolOptional = Symbol('optional');
function optional(check) {
  function checkOptional(val) {
    return val === undefined
      ? {
          tag: 'success',
          success: val,
        }
      : check(val);
  }
  checkOptional._template = optional._template;
  checkOptional[SymbolOptional] = true;
  return checkOptional;
}

const typeLoseAssertion = Symbol('looseAssertion');
const typeSkip = Symbol('skip');
const typeStrict = Symbol('strict');
function object(checks, type = typeSkip) {
  if ([typeLoseAssertion, typeSkip, typeStrict].indexOf(type) === -1) {
    throw new Error('Invalid type');
  }
  function checkObject(val) {
    if (val == null || typeof val !== 'object' || Array.isArray(val)) {
      return {
        tag: 'failure',
        failure: {
          value: val,
          errors: [
            {
              issue: 'not an object',
              path: [],
            },
          ],
        },
      };
    }

    const errors = [];
    const resultObject = {};

    const keys = Object.keys(checks);
    if (type === typeStrict) {
      for (let key in val) {
        if (keys.indexOf(key) === -1) {
          errors.push({
            issue: `excess key - ${key}`,
            path: [],
          });
        }
      }
    }
    for (const key of keys) {
      const result = checks[key](val[key]);

      if (result.tag === 'failure') {
        errors.push({
          issue: result.failure.errors[0].issue,
          // TODO check it
          path: [key].concat(result.failure.errors[0].path),
        });
      } else {
        if (key in val) {
          resultObject[key] = result.success;
        }
      }
    }

    if (Object.keys(errors).length === 0) {
      return {
        tag: 'success',
        success: type === typeLoseAssertion ? Object.assign({}, val, resultObject) : resultObject,
      };
    }
    return {
      tag: 'failure',
      failure: {
        value: val,
        errors,
      },
    };
  }
  checkObject._template = object._template;
  return checkObject;
}
object.loose = typeLoseAssertion;
object.safe = typeSkip;
object.strict = typeStrict;

function record(check) {
  function checkRecord(val) {
    if (val == null || typeof val !== 'object' || Array.isArray(val)) {
      return {
        tag: 'failure',
        failure: {
          value: val,
          errors: [
            {
              issue: 'not an object',
              path: [],
            },
          ],
        },
      };
    }

    const errors = [];
    const resultObject = {};

    for (let key in val) {
      const result = check(val[key]);

      if (result.tag === 'failure') {
        errors.push({
          issue: result.failure.errors[0].issue,
          // TODO check it
          path: [key].concat(result.failure.errors[0].path),
        });
      } else {
        resultObject[key] = result.success;
      }
    }

    if (Object.keys(errors).length === 0) {
      return {
        tag: 'success',
        success: resultObject,
      };
    }
    return {
      tag: 'failure',
      failure: {
        value: val,
        errors,
      },
    };
  }
  checkRecord._template = record._template;
  return checkRecord;
}

function tuple(...checks) {
  for (const check of checks) {
    if (!check) throw new Error('Unsupported check');
    if (check[SymbolOptional]) throw new Error('Optional is not supported');
    if (check[SymbolFilter]) throw new Error('Filter is not supported');
    if (typeof check !== 'function') throw new Error('Unsupported check');
  }
  function checkTuple(val) {
    if (!Array.isArray(val)) {
      return {
        tag: 'failure',
        failure: {
          value: val,
          errors: [
            {
              issue: 'not an array',
              path: [],
            },
          ],
        },
      };
    }
    const errors = [];

    for (let i = 0; i < val.length; i++) {
      const result = checks[i](val[i]);

      if (result.tag === 'failure') {
        errors.push({
          issue: result.failure.errors[0].issue,
          // TODO check it
          path: [i].concat(result.failure.errors[0].path),
        });
      }
    }

    if (errors.length === 0) {
      return {
        tag: 'success',
        success: val,
      };
    }
    return {
      tag: 'failure',
      failure: {
        value: val,
        errors,
      },
    };
  }
  checkTuple._template = tuple._template;
  return checkTuple;
}

function union(...checks) {
  for (const check of checks) {
    if (!check) throw new Error('Unsupported check');
    if (check[SymbolOptional]) throw new Error('Optional is not supported');
    if (check[SymbolFilter]) throw new Error('Filter is not supported');
    if (typeof check !== 'function') throw new Error('Unsupported check');
  }
  function checkUnion(val) {
    const errors = [];

    for (const check of checks) {
      const result = check(val);

      if (result.tag === 'success') {
        return result;
      }
      errors.push(...result.failure.errors);
    }

    return {
      tag: 'failure',
      failure: {
        value: val,
        errors,
      },
    };
  }

  const templateError = checks.find((check) => check._template instanceof Error);
  checkUnion._template = templateError || `(${checks.map((check) => check._template).join('|')})`;
  return checkUnion;
}

// TODO merge

boolean._template = '(?:true|false)';
nullish._template = 'null';
number._template = '(?:(?:[+-]?(?:\\d*\\.\\d+|\\d+\\.\\d*|\\d+)(?:[Ee][+-]?\\d+)?)|(?:0[Bb][01]+)|(?:0[Oo][0-7]+)|(?:0[Xx][0-9A-Fa-f]+))';
string._template = '.*';
unknown._template = '.*';
array._template = new Error('Array is not supported');
filter._template = new Error('Filter is not supported');
limit._template = new Error('Limit is not supported');
map._template = new Error('Map is not supported');
object._template = new Error('Object is not supported');
optional._template = new Error('Optional is not supported');
record._template = new Error('Record is not supported');
tuple._template = new Error('Tuple is not supported');
// source: https://github.com/sindresorhus/escape-string-regexp/blob/v4.0.0/index.js
literal._template = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');

function template(...checks) {
  const _template = checks
    .map((check) => {
      const _regEx = check?._template;
      if (_regEx instanceof Error) throw _regEx;
      if (!_regEx) throw new Error('Unsupported check');
      return _regEx;
    })
    .join('');
  const regEx = new RegExp(`^${_template}$`);
  function checkTemplate(val) {
    return regEx.test(val)
      ? {
          tag: 'success',
          success: val,
        }
      : {
          tag: 'failure',
          failure: {
            value: val,
            errors: [
              {
                issue: 'template literal mismatch',
                path: [],
              },
            ],
          },
        };
  }
  checkTemplate._template = _template;
  return checkTemplate;
}

module.exports.boolean = boolean;
module.exports.literal = literal;
module.exports.nullish = nullish;
module.exports.number = number;
module.exports.string = string;
module.exports.unknown = unknown;
module.exports.array = array;
module.exports.filter = filter;
module.exports.limit = limit;
module.exports.map = map;
module.exports.object = object;
module.exports.optional = optional;
module.exports.record = record;
module.exports.template = template;
module.exports.tuple = tuple;
module.exports.union = union;
