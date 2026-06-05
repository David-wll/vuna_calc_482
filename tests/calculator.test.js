'use strict';

const { evaluateExpression, percentOf } = require('../src/calculator');

describe('arithmetic', () => {
  it('adds two numbers', () => expect(evaluateExpression('2+3')).toBe(5));
  it('subtracts', () => expect(evaluateExpression('10-4')).toBe(6));
  it('multiplies', () => expect(evaluateExpression('3*4')).toBe(12));
  it('divides', () => expect(evaluateExpression('10/2')).toBe(5));
  it('respects operator precedence', () => expect(evaluateExpression('2+3*4')).toBe(14));
  it('handles decimals', () => expect(evaluateExpression('1.5+1.5')).toBe(3));
  it('throws on division by zero', () => expect(() => evaluateExpression('5/0')).toThrow('Division by zero'));
  it('throws on invalid characters', () => expect(() => evaluateExpression('2&3')).toThrow());
  it('throws on empty expression', () => expect(() => evaluateExpression('')).toThrow());
});

describe('percentOf (custom feature)', () => {
  it('calculates 25 is 12.5% of 200', () => expect(percentOf(25, 200)).toBe(12.5));
  it('calculates 50 is 50% of 100', () => expect(percentOf(50, 100)).toBe(50));
  it('calculates 1 is 100% of 1', () => expect(percentOf(1, 1)).toBe(100));
  it('throws when total is zero', () => expect(() => percentOf(10, 0)).toThrow('Total cannot be zero'));
  it('throws on non-number input', () => expect(() => percentOf('a', 100)).toThrow());
});
