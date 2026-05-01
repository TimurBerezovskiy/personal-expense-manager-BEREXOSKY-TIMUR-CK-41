// Data Models & State
const CATEGORIES = ["Їжа", "Транспорт", "Освіта", "Здоров'я", "Розваги", "Покупки", "Інше"];

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let limits = JSON.parse(localStorage.getItem('limits')) || {};

// DOM Elements
const totalAmountEl = document.getElementById('total-amount');
const expenseListEl = document.getElementById('expense-list');
const emptyStateEl = document.getElementById('empty-state');
const categorySummaryList = document.getElementById('category-summary-list');

// Filter Elements
const filterCategory = document.getElementById('filter-category');
const filterDateStart = document.getElementById('filter-date-start');
const filterDateEnd = document.getElementById('filter-date-end');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

// Expense Modal
const expenseModal = document.getElementById('expense-modal');
const expenseForm = document.getElementById('expense-form');
const expenseModalTitle = document.getElementById('expense-modal-title');
const expenseFormError = document.getElementById('expense-form-error');
const cancelExpenseBtn = document.getElementById('cancel-expense-btn');
const addExpenseBtn = document.getElementById('add-expense-btn');

// Limits Modal
const limitsModal = document.getElementById('limits-modal');
const limitsForm = document.getElementById('limits-form');
const limitsInputsContainer = document.getElementById('limits-inputs');
const limitsFormError = document.getElementById('limits-form-error');
const cancelLimitsBtn = document.getElementById('cancel-limits-btn');
const setLimitsBtn = document.getElementById('set-limits-btn');

const resetDemoBtn = document.getElementById('reset-demo-btn');
const clearDataBtn = document.getElementById('clear-data-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

let isLightMode = localStorage.getItem('theme') === 'light';
let expenseChart = null;

// Generate ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Format Currency
const formatCurrency = (amount) => Number(amount).toFixed(2) + ' грн';

// Save to LocalStorage
const saveState = () => {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('limits', JSON.stringify(limits));
  render();
};

function initTheme() {
  if (isLightMode) {
    document.body.classList.add('light-theme');
    themeToggleBtn.textContent = '🌙 Темна тема';
  } else {
    document.body.classList.remove('light-theme');
    themeToggleBtn.textContent = '🌞 Світла тема';
  }

  if (expenseChart) {
    expenseChart.options.plugins.legend.labels.color = isLightMode ? '#1a1a2e' : '#f8f9fa';
    expenseChart.update();
  }
}

function toggleTheme() {
  isLightMode = !isLightMode;
  localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  initTheme();
}

// Initial Render
function init() {
  initTheme();
  setupEventListeners();
  render();
}

function setupEventListeners() {
  addExpenseBtn.addEventListener('click', openAddExpenseModal);
  cancelExpenseBtn.addEventListener('click', closeExpenseModal);
  expenseForm.addEventListener('submit', handleExpenseSubmit);

  setLimitsBtn.addEventListener('click', openLimitsModal);
  cancelLimitsBtn.addEventListener('click', closeLimitsModal);
  limitsForm.addEventListener('submit', handleLimitsSubmit);

  filterCategory.addEventListener('change', render);
  filterDateStart.addEventListener('change', render);
  filterDateEnd.addEventListener('change', render);
  clearFiltersBtn.addEventListener('click', clearFilters);

  resetDemoBtn.addEventListener('click', resetDemoData);
  clearDataBtn.addEventListener('click', clearAllData);
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// Rendering
function render() {
  const filtered = getFilteredExpenses();
  renderExpenses(filtered);
  renderSummary(filtered);
  
  // Create a list filtered only by date so the chart doesn't collapse to one color when a category is clicked
  const start = document.getElementById('filter-date-start').value;
  const end = document.getElementById('filter-date-end').value;
  const dateFiltered = expenses.filter(exp => {
    const matchStart = !start || exp.date >= start;
    const matchEnd = !end || exp.date <= end;
    return matchStart && matchEnd;
  });
  updateChart(dateFiltered);
}

function getFilteredExpenses() {
  let res = [...expenses];
  const cat = filterCategory.value;
  const start = filterDateStart.value;
  const end = filterDateEnd.value;

  if (cat !== 'All') {
    res = res.filter(e => e.category === cat);
  }
  if (start) {
    res = res.filter(e => new Date(e.date) >= new Date(start));
  }
  if (end) {
    res = res.filter(e => new Date(e.date) <= new Date(end));
  }
  
  // Sort by date descending
  res.sort((a, b) => new Date(b.date) - new Date(a.date));
  return res;
}

function renderExpenses(filteredExpenses) {
  expenseListEl.innerHTML = '';
  if (filteredExpenses.length === 0) {
    emptyStateEl.classList.remove('hidden');
    expenseListEl.classList.add('hidden');
  } else {
    emptyStateEl.classList.add('hidden');
    expenseListEl.classList.remove('hidden');
    
    filteredExpenses.forEach(exp => {
      const card = document.createElement('div');
      card.className = 'expense-card';
      card.innerHTML = `
        <div class="exp-info">
          <div class="exp-title">${escapeHTML(exp.title)}</div>
          <div class="exp-meta">
            <span>${exp.category}</span>
            <span>${exp.date}</span>
          </div>
          ${exp.description ? `<div class="exp-desc">${escapeHTML(exp.description)}</div>` : ''}
        </div>
        <div class="exp-actions">
          <div class="exp-amount">${formatCurrency(exp.amount)}</div>
          <div class="exp-btns">
            <button class="btn edit" onclick="window.editExpense('${exp.id}')">Редагувати</button>
            <button class="btn danger" onclick="window.deleteExpense('${exp.id}')">Видалити</button>
          </div>
        </div>
      `;
      expenseListEl.appendChild(card);
    });
  }
}

function renderSummary(filteredExpenses) {
  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  totalAmountEl.textContent = formatCurrency(total);

  // Category totals
  const categoryTotals = {};
  CATEGORIES.forEach(c => categoryTotals[c] = 0);
  
  filteredExpenses.forEach(e => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += Number(e.amount);
    }
  });

  categorySummaryList.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const totalCat = categoryTotals[cat];
    const limit = limits[cat];
    const exceeded = limit && totalCat > limit;

    const el = document.createElement('div');
    el.className = `category-item ${exceeded ? 'limit-exceeded' : ''}`;
    
    let warningHtml = '';
    if (exceeded) {
       warningHtml = `<div class="cat-warning">Перевищення ліміту на ${formatCurrency(totalCat - limit)}</div>`;
    }

    let limitHtml = limit ? ` / Ліміт: ${formatCurrency(limit)}` : '';

    el.innerHTML = `
      <div class="cat-head">
        <span>${cat}</span>
        <span>${formatCurrency(totalCat)}</span>
      </div>
      ${limitHtml ? `<div class="cat-details">${limitHtml}</div>` : ''}
      ${warningHtml}
    `;
    categorySummaryList.appendChild(el);
  });
}

function updateChart(filteredExpenses) {
  if (typeof Chart === 'undefined') return;

  const ctx = document.getElementById('expense-chart');
  if (!ctx) return;

  const categoryTotals = {};
  CATEGORIES.forEach(c => categoryTotals[c] = 0);
  filteredExpenses.forEach(exp => {
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += exp.amount;
    }
  });

  const data = CATEGORIES.map(c => categoryTotals[c]);
  const bgColors = [
    'rgba(108, 99, 255, 0.8)', 
    'rgba(0, 210, 255, 0.8)',  
    'rgba(255, 20, 147, 0.8)', 
    'rgba(0, 176, 155, 0.8)',  
    'rgba(255, 75, 75, 0.8)',  
    'rgba(255, 165, 0, 0.8)',  
    'rgba(160, 170, 191, 0.8)' 
  ];

  if (expenseChart) {
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
  } else {
    expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: CATEGORIES,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        layout: {
          padding: 15
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              color: isLightMode ? '#1a1a2e' : '#f8f9fa',
              font: { family: 'Montserrat', size: 13 },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { family: 'Montserrat', size: 14 },
            bodyFont: { family: 'Montserrat', size: 14 },
            padding: 12,
            cornerRadius: 12
          }
        },
        onHover: (event, chartElement) => {
          event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        },
        onClick: (event, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0].index;
            const clickedCategory = CATEGORIES[index];
            document.getElementById('filter-category').value = clickedCategory;
            render();
          }
        }
      }
    });
  }
}

// Expense Management
function openAddExpenseModal() {
  expenseForm.reset();
  document.getElementById('expense-id').value = '';
  expenseModalTitle.textContent = 'Додати витрату';
  expenseFormError.classList.add('hidden');
  expenseModal.classList.remove('hidden');
}

window.editExpense = function(id) {
  const exp = expenses.find(e => e.id === id);
  if (!exp) return;
  
  document.getElementById('expense-id').value = exp.id;
  document.getElementById('expense-name').value = exp.title;
  document.getElementById('expense-amount').value = exp.amount;
  document.getElementById('expense-category').value = exp.category;
  document.getElementById('expense-date').value = exp.date;
  document.getElementById('expense-desc').value = exp.description;
  
  expenseModalTitle.textContent = 'Редагувати витрату';
  expenseFormError.classList.add('hidden');
  expenseModal.classList.remove('hidden');
}

function closeExpenseModal() {
  expenseModal.classList.add('hidden');
}

function handleExpenseSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('expense-id').value;
  const title = document.getElementById('expense-name').value.trim();
  const amount = Number(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  const date = document.getElementById('expense-date').value;
  const description = document.getElementById('expense-desc').value.trim();

  // Validations
  if (title.length < 3 || title.length > 100) {
    showExpenseError('Назва витрати повинна містити від 3 до 100 символів'); return;
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    showExpenseError('Сума повинна бути числом більше 0'); return;
  }
  if (amount > 1000000) {
    showExpenseError('Сума не може перевищувати 1 000 000 грн'); return;
  }
  if (!CATEGORIES.includes(category)) {
    showExpenseError('Оберіть одну з доступних категорій'); return;
  }
  if (!date || new Date(date) > new Date()) {
    showExpenseError('Дата витрати є обов’язковою і не може бути в майбутньому'); return;
  }
  if (description.length > 300) {
    showExpenseError('Опис не повинен перевищувати 300 символів'); return;
  }

  const expenseData = {
    title, amount, category, date, description,
    updatedAt: new Date().toISOString()
  };

  if (id) {
    const idx = expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      expenses[idx] = { ...expenses[idx], ...expenseData };
    }
  } else {
    expenseData.id = generateId();
    expenseData.createdAt = new Date().toISOString();
    expenses.push(expenseData);
  }

  saveState();
  closeExpenseModal();
}

function showExpenseError(msg) {
  expenseFormError.textContent = msg;
  expenseFormError.classList.remove('hidden');
}

window.deleteExpense = function(id) {
  if (confirm('Ви впевнені, що хочете видалити цю витрату?')) {
    expenses = expenses.filter(e => e.id !== id);
    saveState();
  }
}

// Limits Management
function openLimitsModal() {
  limitsInputsContainer.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const val = limits[cat] || '';
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
      <label>${cat} (Ліміт, грн)</label>
      <input type="number" min="0" max="10000000" step="0.01" data-cat="${cat}" value="${val}">
    `;
    limitsInputsContainer.appendChild(div);
  });
  limitsFormError.classList.add('hidden');
  limitsModal.classList.remove('hidden');
}

function closeLimitsModal() {
  limitsModal.classList.add('hidden');
}

function handleLimitsSubmit(e) {
  e.preventDefault();
  const inputs = limitsInputsContainer.querySelectorAll('input');
  
  let newLimits = {};
  let hasError = false;

  inputs.forEach(input => {
    const cat = input.getAttribute('data-cat');
    const val = input.value;
    if (val) {
      const num = Number(val);
      if (isNaN(num) || num <= 0) {
        showLimitsError('Ліміт повинен бути числом більше 0');
        hasError = true;
      } else if (num > 10000000) {
        showLimitsError('Ліміт не може перевищувати 10 000 000 грн');
        hasError = true;
      }
      newLimits[cat] = num;
    }
  });

  if (hasError) return;

  limits = newLimits;
  saveState();
  closeLimitsModal();
}

function showLimitsError(msg) {
  limitsFormError.textContent = msg;
  limitsFormError.classList.remove('hidden');
}

// Filters
function clearFilters() {
  filterCategory.value = 'All';
  filterDateStart.value = '';
  filterDateEnd.value = '';
  render();
}

// Demo Data Reset
async function resetDemoData() {
  if (confirm('Це видалить ваші поточні дані і завантажить демонстраційні. Продовжити?')) {
    try {
      const response = await fetch('./data/seed.json');
      if (!response.ok) throw new Error('Failed to fetch seed data');
      const seed = await response.json();

      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const dStr = (d) => d.toISOString().split('T')[0];

      expenses = seed.expenses.map((e, index) => ({
        id: generateId(),
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: index % 2 === 0 ? dStr(today) : dStr(yesterday),
        description: e.description,
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      }));

      limits = seed.limits;
      saveState();
      clearFilters();
    } catch (err) {
      console.log("Локальний запуск (без сервера). Використовуємо вбудовані демо-дані.");
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const dStr = (d) => d.toISOString().split('T')[0];

      expenses = [
        { id: generateId(), title: 'Продукти', amount: 850.50, category: 'Їжа', date: dStr(today), description: 'Сільпо', createdAt: today.toISOString(), updatedAt: today.toISOString() },
        { id: generateId(), title: 'Проїзний', amount: 300, category: 'Транспорт', date: dStr(yesterday), description: 'Місячний проїзний', createdAt: today.toISOString(), updatedAt: today.toISOString() },
        { id: generateId(), title: 'Онлайн курс', amount: 1500, category: 'Освіта', date: dStr(today), description: 'Курс по React', createdAt: today.toISOString(), updatedAt: today.toISOString() },
        { id: generateId(), title: 'Аптека', amount: 450.25, category: "Здоров'я", date: dStr(yesterday), description: 'Вітаміни', createdAt: today.toISOString(), updatedAt: today.toISOString() },
        { id: generateId(), title: 'Кіно', amount: 600, category: 'Розваги', date: dStr(today), description: 'Кіно і попкорн', createdAt: today.toISOString(), updatedAt: today.toISOString() }
      ];

      limits = {
        "Їжа": 5000,
        "Розваги": 500
      };

      saveState();
      clearFilters();
    }
  }
}

// Clear All Data
function clearAllData() {
  if (confirm('Ви впевнені, що хочете видалити всі свої дані та ліміти? Це неможливо скасувати.')) {
    expenses = [];
    limits = {};
    saveState();
    clearFilters();
  }
}

// Utils
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

init();
