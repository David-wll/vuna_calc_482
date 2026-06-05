'use strict';

// ─── UI State ─────────────────────────────────────────────
const state = {
  current:       '0',
  previous:      '',
  operator:      null,
  justEvaluated: false
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
  let formatted = parseFloat(num.toPrecision(12)).toString();
  const [intPart, decPart] = formatted.split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
}

function updateDisplay() {
  const text  = formatNumber(state.current);
  const isErr = state.current === 'Error';
  resultEl.classList.toggle('error', isErr);
  resultEl.textContent = text;
  if (text.replace(/,/g, '').length > 10) resultEl.style.fontSize = '26px';
  else if (text.replace(/,/g, '').length > 7) resultEl.style.fontSize = '32px';
  else resultEl.style.fontSize = '40px';
}

function popAnimation() {
  resultEl.classList.remove('pop');
  void resultEl.offsetWidth;
  resultEl.classList.add('pop');
  setTimeout(() => resultEl.classList.remove('pop'), 150);
}

function opSymbol(op) {
  return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
}

// ─── Button handlers ──────────────────────────────────────
function handleDigit(val) {
  if (state.justEvaluated) {
    state.current = val === '.' ? '0.' : val;
    state.justEvaluated = false;
    return;
  }
  if (val === '.') { if (state.current.includes('.')) return; state.current += '.'; return; }
  if (state.current === '0') state.current = val;
  else { if (state.current.replace('.', '').length >= 14) return; state.current += val; }
}

function handleOperator(op) {
  if (state.current === 'Error') return;
  if (state.operator && !state.justEvaluated) {
    try {
      const result = evaluateExpression(`${state.previous}${state.operator}${state.current}`);
      state.current = String(parseFloat(result.toPrecision(12)));
      popAnimation();
    } catch (e) { state.current = 'Error'; }
  }
  state.previous = state.current;
  state.operator = op;
  state.justEvaluated = true;
  expressionEl.textContent = `${formatNumber(state.previous)} ${opSymbol(op)}`;
  highlightOperator(op);
}

function handleEquals() {
  if (!state.operator || state.current === 'Error') return;
  const expr = `${state.previous}${state.operator}${state.current}`;
  const displayExpr = `${formatNumber(state.previous)} ${opSymbol(state.operator)} ${formatNumber(state.current)}`;
  try {
    const result = evaluateExpression(expr);
    const resultStr = String(parseFloat(result.toPrecision(12)));
    expressionEl.textContent = `${displayExpr} =`;
    state.current = resultStr;
    state.operator = null;
    state.previous = '';
    state.justEvaluated = true;
    addToHistory(displayExpr, resultStr);
    popAnimation();
  } catch (e) {
    state.current = 'Error';
  }
  clearOperatorHighlight();
}

function handleAC() {
  state.current = '0'; state.previous = ''; state.operator = null; state.justEvaluated = false;
  expressionEl.textContent = '';
  clearOperatorHighlight();
}

function handleCE() {
  if (state.justEvaluated) { handleAC(); return; }
  state.current = '0';
}

function handleSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
}

function handlePercent() {
  if (state.current === 'Error') return;
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  // Use percentOf engine: what % of previous value, or just /100
  if (state.previous && state.operator) {
    try {
      const result = percentOf(val, parseFloat(state.previous));
      expressionEl.textContent = `${formatNumber(state.previous)} % ${formatNumber(state.current)} =`;
      state.current = String(parseFloat(result.toPrecision(12)));
      state.justEvaluated = true;
      popAnimation();
    } catch (e) { state.current = 'Error'; }
  } else {
    state.current = String(val / 100);
    state.justEvaluated = true;
  }
}

// ─── Operator highlight ───────────────────────────────────
function highlightOperator(op) {
  clearOperatorHighlight();
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
    li.addEventListener('click', () => { state.current = item.result; state.justEvaluated = true; updateDisplay(); });
    historyList.appendChild(li);
  });
}
clearHistBtn.addEventListener('click', () => { history = []; renderHistory(); });

// ─── Event delegation ─────────────────────────────────────
document.querySelector('.buttons').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const action = btn.dataset.action, value = btn.dataset.value;
  if (action === 'ac') handleAC();
  else if (action === 'ce') handleCE();
  else if (action === 'sign') handleSign();
  else if (action === 'percent') handlePercent();
  else if (action === 'op') handleOperator(value);
  else if (action === 'equals') handleEquals();
  else if (btn.classList.contains('digit')) handleDigit(value);
  updateDisplay();
});

// ─── Keyboard support ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
  else if (e.key === '.') handleDigit('.');
  else if (e.key === '+') handleOperator('+');
  else if (e.key === '-') handleOperator('-');
  else if (e.key === '*') handleOperator('*');
  else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') handleEquals();
  else if (e.key === 'Escape') handleAC();
  else if (e.key === 'Backspace') handleCE();
  else if (e.key === '%') handlePercent();
  else return;
  updateDisplay();
});

// ─── Init ─────────────────────────────────────────────────
updateDisplay();
