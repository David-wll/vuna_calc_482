'use strict';

// ─── State ────────────────────────────────────────────────
const state = {
  current:      '0',   // what's on the display
  previous:     '',    // left operand
  operator:     null,  // pending operator
  justEvaluated: false // prevents appending after '='
};

let history = [];

// ─── DOM refs ─────────────────────────────────────────────
const resultEl     = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const historyList  = document.getElementById('historyList');
const clearHistBtn = document.getElementById('clearHistory');

// ─── Display helpers ──────────────────────────────────────
function formatNumber(str) {
  if (str === 'Error') return str;
  const num = parseFloat(str);
  if (isNaN(num)) return str;

  // Use toPrecision to cap huge floats, then strip trailing zeros
  let formatted = parseFloat(num.toPrecision(12)).toString();

  // Add thousand-separators to integer part only
  const [intPart, decPart] = formatted.split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}

function updateDisplay() {
  const text  = formatNumber(state.current);
  const isErr = state.current === 'Error';

  resultEl.classList.toggle('error', isErr);
  resultEl.textContent = text;

  // Shrink font for long numbers
  if (text.replace(/,/g, '').length > 10) {
    resultEl.style.fontSize = '26px';
  } else if (text.replace(/,/g, '').length > 7) {
    resultEl.style.fontSize = '32px';
  } else {
    resultEl.style.fontSize = '40px';
  }
}

function popAnimation() {
  resultEl.classList.remove('pop');
  void resultEl.offsetWidth; // reflow
  resultEl.classList.add('pop');
  setTimeout(() => resultEl.classList.remove('pop'), 150);
}

// ─── Core logic ───────────────────────────────────────────
function evaluate(a, op, b) {
  const fa = parseFloat(a);
  const fb = parseFloat(b);
  switch (op) {
    case '+': return fa + fb;
    case '-': return fa - fb;
    case '*': return fa * fb;
    case '/':
      if (fb === 0) return 'Error';
      return fa / fb;
    default: return fb;
  }
}

function opSymbol(op) {
  const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  return map[op] || op;
}

// ─── Button handlers ──────────────────────────────────────
function handleDigit(val) {
  if (state.justEvaluated) {
    state.current      = val === '.' ? '0.' : val;
    state.justEvaluated = false;
    return;
  }

  if (val === '.') {
    if (state.current.includes('.')) return;
    state.current += '.';
    return;
  }

  if (state.current === '0') {
    state.current = val;
  } else {
    if (state.current.replace('.', '').length >= 14) return; // cap input length
    state.current += val;
  }
}

function handleOperator(op) {
  if (state.current === 'Error') return;

  // If there's a pending operation and user typed a number after, evaluate chain
  if (state.operator && !state.justEvaluated) {
    const result = evaluate(state.previous, state.operator, state.current);
    state.current = result === 'Error' ? 'Error' : String(parseFloat(result.toPrecision(12)));
    popAnimation();
  }

  state.previous      = state.current;
  state.operator      = op;
  state.justEvaluated = true;

  expressionEl.textContent = `${formatNumber(state.previous)} ${opSymbol(op)}`;
  highlightOperator(op);
}

function handleEquals() {
  if (!state.operator || state.current === 'Error') return;

  const expr   = `${formatNumber(state.previous)} ${opSymbol(state.operator)} ${formatNumber(state.current)}`;
  const result = evaluate(state.previous, state.operator, state.current);
  const resultStr = result === 'Error' ? 'Error' : String(parseFloat(result.toPrecision(12)));

  expressionEl.textContent = `${expr} =`;
  state.current      = resultStr;
  state.operator     = null;
  state.previous     = '';
  state.justEvaluated = true;

  if (result !== 'Error') {
    addToHistory(expr, resultStr);
    popAnimation();
  }

  clearOperatorHighlight();
}

function handleAC() {
  state.current       = '0';
  state.previous      = '';
  state.operator      = null;
  state.justEvaluated = false;
  expressionEl.textContent = '';
  clearOperatorHighlight();
}

function handleCE() {
  if (state.justEvaluated) {
    handleAC();
    return;
  }
  state.current = '0';
}

function handleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
}

function handlePercent() {
  if (state.current === 'Error') return;
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  state.current = String(val / 100);
  state.justEvaluated = true;
}

// ─── Operator highlight ───────────────────────────────────
function highlightOperator(op) {
  clearOperatorHighlight();
  const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  document.querySelectorAll('.btn.operator').forEach(btn => {
    if (btn.dataset.value === op) btn.classList.add('active-op');
  });
}
function clearOperatorHighlight() {
  document.querySelectorAll('.btn.operator').forEach(b => b.classList.remove('active-op'));
}

// ─── History ──────────────────────────────────────────────
function addToHistory(expr, result) {
  history.unshift({ expr, result });
  if (history.length > 30) history.pop();
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<div class="h-expr">${item.expr}</div><div class="h-result">${formatNumber(item.result)}</div>`;
    li.addEventListener('click', () => {
      state.current       = item.result;
      state.justEvaluated = true;
      updateDisplay();
    });
    historyList.appendChild(li);
  });
}

clearHistBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

// ─── Event delegation ─────────────────────────────────────
document.querySelector('.buttons').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  if (action === 'ac')      handleAC();
  else if (action === 'ce') handleCE();
  else if (action === 'sign')    handleSign();
  else if (action === 'percent') handlePercent();
  else if (action === 'op')      handleOperator(value);
  else if (action === 'equals')  handleEquals();
  else if (btn.classList.contains('digit')) handleDigit(value);

  if (state.current !== 'Error') updateDisplay();
  else { updateDisplay(); }
});

// ─── Keyboard support ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
  else if (e.key === '.')  handleDigit('.');
  else if (e.key === '+')  handleOperator('+');
  else if (e.key === '-')  handleOperator('-');
  else if (e.key === '*')  handleOperator('*');
  else if (e.key === '/')  { e.preventDefault(); handleOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') handleEquals();
  else if (e.key === 'Escape')     handleAC();
  else if (e.key === 'Backspace')  handleCE();
  else if (e.key === '%')  handlePercent();
  else return;

  updateDisplay();
});

// ─── Init ─────────────────────────────────────────────────
updateDisplay();
