const expect = require('expect.js');

const {
  boolean,
  literal,
  nullish,
  number,
  string,
  unknown,
  array,
  filter,
  limit,
  map,
  object,
  optional,
  record,
  template,
  tuple,
  union,
} = require('../dist/index.js');

const deepEqual = (() => {
  if ('Bun' in global) {
    const assert = require('node:assert');
    return (a, b) => assert.deepEqual(a, b);
  }
  return (a, b) => expect(a).to.eql(b);
})();

const describe = global.describe;
const it = global.it;

describe('boolean', function () {
  const check = boolean;

  it('should return success when given a boolean', function () {
    deepEqual(check(true), {
      tag: 'success',
      success: true,
    });
  });

  it('should return failure when given a non-boolean', function () {
    deepEqual(check('false'), {
      tag: 'failure',
      failure: {
        value: 'false',
        errors: [{ issue: 'not a boolean', path: [] }],
      },
    });
  });
});

describe('literal', function () {
  const check = literal('foo');

  it('should return success when given a boolean', function () {
    deepEqual(check('foo'), {
      tag: 'success',
      success: 'foo',
    });
  });

  it('should return failure when given a non-boolean', function () {
    deepEqual(check('bar'), {
      tag: 'failure',
      failure: {
        value: 'bar',
        errors: [{ issue: 'not equal to foo', path: [] }],
      },
    });
  });
});

describe('nullish', function () {
  const check = nullish;

  it('should return success when given a null or undefined', function () {
    deepEqual(check(null), {
      tag: 'success',
      success: null,
    });
    deepEqual(check(undefined), {
      tag: 'success',
      success: undefined,
    });
  });

  it('should return failure when given a non-nullish', function () {
    deepEqual(check('bar'), {
      tag: 'failure',
      failure: {
        value: 'bar',
        errors: [{ issue: 'not nullish', path: [] }],
      },
    });
  });
});

describe('number', function () {
  const check = number;

  it('should return success when given a number', function () {
    deepEqual(check(1), {
      tag: 'success',
      success: 1,
    });
  });

  it('should return failure when given a non-number', function () {
    deepEqual(check('1'), {
      tag: 'failure',
      failure: {
        value: '1',
        errors: [{ issue: 'not a number', path: [] }],
      },
    });
  });
});

describe('string', function () {
  const check = string;

  it('should return success when given a string', function () {
    deepEqual(check('foo'), {
      tag: 'success',
      success: 'foo',
    });
  });

  it('should return failure when given a non-string', function () {
    deepEqual(check(1), {
      tag: 'failure',
      failure: {
        value: 1,
        errors: [{ issue: 'not a string', path: [] }],
      },
    });
  });
});

describe('unknown', function () {
  const check = unknown;

  it('should return success when given any value', function () {
    deepEqual(check(1), {
      tag: 'success',
      success: 1,
    });
    deepEqual(check('foo'), {
      tag: 'success',
      success: 'foo',
    });
    deepEqual(check(null), {
      tag: 'success',
      success: null,
    });
    deepEqual(check(undefined), {
      tag: 'success',
      success: undefined,
    });
  });
});

describe('array', function () {
  const check = array(string);

  it('should return success when given an array of strings', function () {
    deepEqual(check(['foo', 'bar']), {
      tag: 'success',
      success: ['foo', 'bar'],
    });
  });

  it('should return failure when given a non-array', function () {
    deepEqual(check('foo'), {
      tag: 'failure',
      failure: {
        value: 'foo',
        errors: [{ issue: 'not an array', path: [] }],
      },
    });
  });

  it('should return failure when given an array with non-strings', function () {
    deepEqual(check(['foo', 1]), {
      tag: 'failure',
      failure: {
        value: ['foo', 1],
        errors: [{ issue: 'not a string', path: [1] }],
      },
    });
  });
});

describe('filter', function () {
  const check = array(
    filter(
      filter(number, (x) => x < 10),
      (x) => x > 1,
    ),
  );

  it('should return success when given an array of numbers', function () {
    deepEqual(check([1, 2, 3, 11]), {
      tag: 'success',
      success: [2, 3],
    });
  });

  it('should return failure when given a non-array', function () {
    deepEqual(check('foo'), {
      tag: 'failure',
      failure: {
        value: 'foo',
        errors: [{ issue: 'not an array', path: [] }],
      },
    });
  });

  it('should return failure when given an array with non-numbers', function () {
    deepEqual(check(['foo', 1]), {
      tag: 'failure',
      failure: {
        value: ['foo', 1],
        errors: [{ issue: 'not a number', path: [0] }],
      },
    });
  });
});

describe('limit', function () {
  const check = limit(number, (x) => x > 1);

  it('should return success when given a number within the range', function () {
    deepEqual(check(2), {
      tag: 'success',
      success: 2,
    });
  });

  it('should return failure when given a number outside the range', function () {
    deepEqual(check(1), {
      tag: 'failure',
      failure: {
        value: 1,
        errors: [{ issue: 'does not fit the limit', path: [] }],
      },
    });
  });

  it('should return failure when given a non-number', function () {
    deepEqual(check('foo'), {
      tag: 'failure',
      failure: {
        value: 'foo',
        errors: [{ issue: 'not a number', path: [] }],
      },
    });
  });
});

describe('map', function () {
  const check = map(
    filter(string, (x) => x.startsWith('f')),
    (x) => x.toUpperCase(),
  );

  it('should return success when given a string', function () {
    deepEqual(check('foo'), {
      tag: 'success',
      success: 'FOO',
    });
  });

  it('should return failure when given a non-string', function () {
    deepEqual(check(1), {
      tag: 'failure',
      failure: {
        value: 1,
        errors: [{ issue: 'not a string', path: [] }],
      },
    });
  });

  it('should return failure when given a string that does not start with "t"', function () {
    deepEqual(check('tar'), null);
  });
});

describe('object', function () {
  describe('strict', function () {
    const check = object(
      {
        foo: string,
        bar: number,
      },
      object.strict,
    );

    it('should return success when given an object with the correct properties', function () {
      deepEqual(check({ foo: 'foo', bar: 1 }), {
        tag: 'success',
        success: { foo: 'foo', bar: 1 },
      });
    });

    it('should return failure when given an object with incorrect properties', function () {
      deepEqual(check({ foo: 'foo', bar: 'bar' }), {
        tag: 'failure',
        failure: {
          value: { foo: 'foo', bar: 'bar' },
          errors: [{ issue: 'not a number', path: ['bar'] }],
        },
      });
    });

    it('should return failure when given an object with missing properties', function () {
      deepEqual(check({ foo: 'foo' }), {
        tag: 'failure',
        failure: {
          value: { foo: 'foo' },
          errors: [{ issue: 'not a number', path: ['bar'] }],
        },
      });
    });

    it('should return failure when given a non-object', function () {
      deepEqual(check('foo'), {
        tag: 'failure',
        failure: {
          value: 'foo',
          errors: [{ issue: 'not an object', path: [] }],
        },
      });
    });

    it('should return failure when given excess key', function () {
      deepEqual(check({ foo: 'foo', bar: 1, baz: 'baz' }), {
        tag: 'failure',
        failure: {
          value: { foo: 'foo', bar: 1, baz: 'baz' },
          errors: [{ issue: 'excess key - baz', path: [] }],
        },
      });
    });
  });

  describe('loose', function () {
    const check = object(
      {
        foo: string,
        bar: number,
      },
      object.loose,
    );

    it('should return success when given an object with the correct properties', function () {
      deepEqual(check({ foo: 'foo', bar: 1 }), {
        tag: 'success',
        success: { foo: 'foo', bar: 1 },
      });
    });

    it('should return failure when given an object with incorrect properties', function () {
      deepEqual(check({ foo: 'foo', bar: 'bar' }), {
        tag: 'failure',
        failure: {
          value: { foo: 'foo', bar: 'bar' },
          errors: [{ issue: 'not a number', path: ['bar'] }],
        },
      });
    });

    it('should return failure when given an object with missing properties', function () {
      deepEqual(check({ foo: 'foo' }), {
        tag: 'failure',
        failure: {
          value: { foo: 'foo' },
          errors: [{ issue: 'not a number', path: ['bar'] }],
        },
      });
    });

    it('should return failure when given a non-object', function () {
      deepEqual(check('foo'), {
        tag: 'failure',
        failure: {
          value: 'foo',
          errors: [{ issue: 'not an object', path: [] }],
        },
      });
    });

    it('should return success when given excess key', function () {
      deepEqual(check({ foo: 'foo', bar: 1, baz: 'baz' }), {
        tag: 'success',
        success: { foo: 'foo', bar: 1, baz: 'baz' },
      });
    });
  });

  describe('safe', function () {
    const check = object(
      {
        foo: string,
        bar: number,
      },
      object.safe,
    );

    it('should return success when given an object with the correct properties', function () {
      deepEqual(check({ foo: 'foo', bar: 1 }), {
        tag: 'success',
        success: { foo: 'foo', bar: 1 },
      });
    });

    it('should return failure when given an object with incorrect properties', function () {
      deepEqual(check({ foo: 'foo', bar: 'bar' }), {
        tag: 'failure',
        failure: {
          value: { foo: 'foo', bar: 'bar' },
          errors: [{ issue: 'not a number', path: ['bar'] }],
        },
      });
    });

    it('should return failed when given an object with missing properties', function () {
      deepEqual(check({ foo: 'foo' }), {
        tag: 'failure',
        failure: {
          value: { foo: 'foo' },
          errors: [{ issue: 'not a number', path: ['bar'] }],
        },
      });
    });

    it('should return failure when given a non-object', function () {
      deepEqual(check('foo'), {
        tag: 'failure',
        failure: {
          value: 'foo',
          errors: [{ issue: 'not an object', path: [] }],
        },
      });
    });

    it('should return success when given excess key', function () {
      deepEqual(check({ foo: 'foo', bar: 1, baz: 'baz' }), {
        tag: 'success',
        success: { foo: 'foo', bar: 1 },
      });
    });
  });

  it('should return error when given wrong strictness', function () {
    expect(() => object({}, Symbol(12))).to.throwError(/Invalid type/);
  });
});

describe('optional', function () {
  const check = object({ x: optional(number) });

  it('should return success when given an object with the correct properties', function () {
    deepEqual(check({ x: 1 }), {
      tag: 'success',
      success: { x: 1 },
    });
  });

  it('should return success when given an object with missing properties', function () {
    deepEqual(check({}), {
      tag: 'success',
      success: {},
    });
  });

  it('should return success when given an object with missing properties', function () {
    deepEqual(check({ x: undefined }), {
      tag: 'success',
      success: { x: undefined },
    });
  });

  it('should return failure when given an object with incorrect properties', function () {
    deepEqual(check({ x: 'foo' }), {
      tag: 'failure',
      failure: {
        value: { x: 'foo' },
        errors: [{ issue: 'not a number', path: ['x'] }],
      },
    });
  });

  it('should return failure when given a non-object', function () {
    deepEqual(check('foo'), {
      tag: 'failure',
      failure: {
        value: 'foo',
        errors: [{ issue: 'not an object', path: [] }],
      },
    });
  });

  it('should return success when given excess key', function () {
    deepEqual(check({ x: 1, y: 2 }), {
      tag: 'success',
      success: { x: 1 },
    });
  });
});

describe('record', function () {
  const check = record(string);

  it('should return success when given an object with the correct properties', function () {
    deepEqual(check({ foo: 'foo', bar: 'bar' }), {
      tag: 'success',
      success: { foo: 'foo', bar: 'bar' },
    });
  });

  it('should return failure when given an object with incorrect properties', function () {
    deepEqual(check({ foo: 'foo', bar: 1 }), {
      tag: 'failure',
      failure: {
        value: { foo: 'foo', bar: 1 },
        errors: [{ issue: 'not a string', path: ['bar'] }],
      },
    });
  });

  it('should return failure when given a non-object', function () {
    deepEqual(check('foo'), {
      tag: 'failure',
      failure: {
        value: 'foo',
        errors: [{ issue: 'not an object', path: [] }],
      },
    });
  });
});

describe('template', function () {
  const check = template(literal('test'), string, number, boolean);

  it('should return success when given a string', function () {
    deepEqual(check('test___123false'), {
      tag: 'success',
      success: 'test___123false',
    });
  });

  it('should return failure when given a string', function () {
    deepEqual(check('test___false'), {
      tag: 'failure',
      failure: {
        value: 'test___false',
        errors: [{ issue: 'template literal mismatch', path: [] }],
      },
    });
  });

  it('wrong basic type', function () {
    expect(() => template(array(number))).to.throwError(/is not supported/);
  });

  it('wrong unexpected type', function () {
    expect(() => template('qwe')).to.throwError(/Unsupported check/);
  });

  it('wrong null type', function () {
    expect(() => template(null)).to.throwError(/Unsupported check/);
  });
});

describe('tuple', function () {
  const check = tuple(string, number, boolean);

  it('should return success when given a string', function () {
    deepEqual(check(['test', 123, false]), {
      tag: 'success',
      success: ['test', 123, false],
    });
  });

  it('should return failure when given a string', function () {
    deepEqual(check(['test', 123, 'false']), {
      tag: 'failure',
      failure: {
        value: ['test', 123, 'false'],
        errors: [{ issue: 'not a boolean', path: [2] }],
      },
    });
  });

  it('should return failure when given a string', function () {
    deepEqual(check('qwe'), {
      tag: 'failure',
      failure: {
        value: 'qwe',
        errors: [{ issue: 'not an array', path: [] }],
      },
    });
  });

  it('wrong basic type', function () {
    expect(() => tuple(optional(number))).to.throwError(/is not supported/);
    expect(() => tuple(filter(number, () => {}))).to.throwError(/is not supported/);
  });

  it('wrong unexpected type', function () {
    expect(() => tuple('qwe')).to.throwError(/Unsupported check/);
  });

  it('wrong null type', function () {
    expect(() => tuple(null)).to.throwError(/Unsupported check/);
  });
});

describe('union', function () {
  const check = union(string, number, boolean);

  it('should return success when given a string', function () {
    deepEqual(check('test'), {
      tag: 'success',
      success: 'test',
    });
  });

  it('should return success when given a number', function () {
    deepEqual(check(123), {
      tag: 'success',
      success: 123,
    });
  });

  it('should return success when given a boolean', function () {
    deepEqual(check(false), {
      tag: 'success',
      success: false,
    });
  });

  it('should return failure when given a object', function () {
    deepEqual(check({}), {
      tag: 'failure',
      failure: {
        value: {},
        errors: [
          { issue: 'not a string', path: [] },
          { issue: 'not a number', path: [] },
          { issue: 'not a boolean', path: [] },
        ],
      },
    });
  });

  it('wrong basic type', function () {
    expect(() => union(optional(number))).to.throwError(/is not supported/);
    expect(() => union(filter(number, () => {}))).to.throwError(/is not supported/);
  });

  it('wrong unexpected type', function () {
    expect(() => union('qwe')).to.throwError(/Unsupported check/);
  });

  it('wrong null type', function () {
    expect(() => union(null)).to.throwError(/Unsupported check/);
  });
});
