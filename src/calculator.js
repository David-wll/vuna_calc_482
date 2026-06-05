'use strict';

// ─── Core arithmetic engine (no DOM, pure functions) ──────
function evaluateExpression(expr) {
  if (typeof expr !== 'string' || expr.trim() === '') {
    throw new Error('Invalid expression');
  }

  // Only allow digits, operators, dot, spaces
  if (/[^0-9+\-*/.() ]/.test(expr)) {
    throw new Error('Invalid characters in expression: ' + expr);
  }

  const tokens = tokenize(expr);
  const rpn    = shuntingYard(tokens);
  return evaluateRPN(rpn);
}

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === ' ') { i++; continue; }
    if (/[0-9.]/.test(expr[i])) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push({ type: 'number', value: parseFloat(num) });
    } else if (/[+\-*/]/.test(expr[i])) {
      tokens.push({ type: 'op', value: expr[i++] });
    } else {
      throw new Error('Unknown token: ' + expr[i]);
    }
  }
  return tokens;
}

function shuntingYard(tokens) {
  const output = [], ops = [];
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  for (const tok of tokens) {
    if (tok.type === 'number') {
      output.push(tok);
    } else {
      while (ops.length && prec[ops[ops.length - 1].value] >= prec[tok.value]) {
        output.push(ops.pop());
      }
      ops.push(tok);
    }
  }
  while (ops.length) output.push(ops.pop());
  return output;
}

function evaluateRPN(tokens) {
  const stack = [];
  for (const tok of tokens) {
    if (tok.type === 'number') {
      stack.push(tok.value);
    } else {
      const b = stack.pop(), a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Invalid expression');
      switch (tok.value) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/':
          if (b === 0) throw new Error('Division by zero');
          stack.push(a / b);
          break;
      }
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

// ─── Custom feature: Percentage calculation ───────────────
// percentOf(value, total) → what percentage is value of total?
// e.g. percentOf(25, 200) → 12.5  (25 is 12.5% of 200)
function percentOf(value, total) {
  if (typeof value !== 'number' || typeof total !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  if (total === 0) throw new Error('Total cannot be zero');
  return parseFloat(((value / total) * 100).toFixed(10));
}

// ─── Export for tests ─────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { evaluateExpression, percentOf };
}
