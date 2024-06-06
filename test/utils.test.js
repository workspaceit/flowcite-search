const assert = require('assert');
const sanitize = require('../utils/sanitize');
const tokenize = require('../utils/tokenize');

describe('utils', () => {
  describe('#sanitize()', () => {
    const cases = [
      { in: 'hello "world"', out: 'hello world' },
      { in: 'to be "or not to be"', out: 'to be or not to be' },
      { in: 'single quote"', out: 'single quote' },
      { in: '"quote" "combination', out: 'quote combination' },
      { in: 'hello (world)', out: 'hello world' },
      { in: 'to be (or not to be)', out: 'to be or not to be' },
      { in: 'single brace)', out: 'single brace' },
      { in: '(braces) (combination', out: 'braces combination' },
      { in: 'cats and dogs', out: 'cats and dogs' },
      { in: 'and cats', out: 'and cats' },
      { in: 'cats AND', out: 'cats' },
      { in: 'cats OR dogs', out: 'cats dogs' },
      { in: 'or cats', out: 'or cats' },
      { in: 'cats OR', out: 'cats' },
      { in: 'cats +dogs', out: 'cats dogs' },
      { in: 'cat+s dogs', out: 'cat s dogs' },
      { in: 'cats -dogs', out: 'cats dogs' },
      { in: 'cat-s dogs', out: 'cat s dogs' },
      { in: 'cats *dogs', out: 'cats dogs' },
      { in: 'cat*s dogs', out: 'cat s dogs' },
    ];

    cases.forEach((c) => {
      it(`should return "${c.out}" when the input is "${c.in}"`, () => {
        assert.strictEqual(c.out, sanitize(c.in));
      });
    });
  });
  
  describe('#tokenize', () => {
    const cases = [
      { in: '', out: [] },
      { in: ' ', out: [] },
      { in: '  ', out: [] },
      { in: '"exact value"', out: ['exact value'] },
      { in: '"one two" -three  four', out: ['one two', '-three', 'four'] },
      { in: 'hello   world   "quoted string"', out: ['hello', 'world', 'quoted string'] },
    ];

    cases.forEach((c) => {
      it(`should return [${c.out}] when the input is "${c.in}"`, () => {
        tokenize(c.in)
          .then((res) => {
            assert.strictEqual(JSON.stringify(c.out), JSON.stringify(res));
          });
      });
    });
  });
});
