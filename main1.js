class ExpenseTracker {
    constructor(StorageKey) {
        this.StorageKey = StorageKey;
        this.expenses = this.loadFromStorage();
    }
 
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.StorageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
 
    saveToStorage() {
        localStorage.setItem(this.StorageKey, JSON.stringify(this.expenses));
    }
 
    addExpense({ name, amount, category, date }) {
        const newExpense = {
            id: Date.now(),
            name,
            amount: Number(amount),
            category,
            date
        };
        this.expenses.push(newExpense);
        this.saveToStorage();
    }
 
    removeExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        this.saveToStorage();
    }
 
    getFiltered(category) {
        return category == "all" ? this.expenses : this.expenses.filter(expense => expense.category === category);
    }
 
    getTotal(category) {
        return this.getFiltered(category).reduce((sum, { amount }) => sum + amount, 0);
    }
 
    getCategories() {
        const base = ["Еда", "Транспорт", "Развлечения", "Комунальные", "Прочее"];
        const fromData = this.expenses.map(({ category }) => category);
        return [...new Set([...base, ...fromData])];
    }
}
 
const tracker = new ExpenseTracker("expenses");
let currentFilter = "all";
 
function formatDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
}
 
function renderCategories() {
    const select = document.getElementById("categoryFilter");
    const selected = select.value || "all";
    select.innerHTML = '<option value="all">Все категории</option>';
    tracker.getCategories().forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
    select.value = selected;
}
 
function render() {
    renderCategories();
 
    const list = document.getElementById("expenseList");
    const emptyMsg = document.getElementById("emptyMsg");
    const filtered = tracker.getFiltered(currentFilter);
    list.innerHTML = "";
    emptyMsg.style.display = filtered.length ? "none" : "block";
    filtered.forEach((expense) => {
        const { id, name, amount, category, date } = expense;
 
        const li = document.createElement("li");
        li.className = "item";
 
        const main = document.createElement("div");
        main.className = "item-main";
        main.innerHTML = `
      <div class="item-name">${name}</div>
      <div class="item-meta">${category} · ${formatDate(date)}</div>
    `;
 
        const amountSpan = document.createElement("span");
        amountSpan.className = "item-amount";
        amountSpan.textContent = amount.toFixed(2);
 
        const delBtn = document.createElement("button");
        delBtn.className = "icon-btn";
        delBtn.textContent = "✕";
        delBtn.title = "Удалить";
        delBtn.addEventListener("click", () => {
            tracker.removeExpense(id);
            render();
        });
        li.append(main, amountSpan, delBtn);
        list.appendChild(li);
    });
    document.getElementById("totalAmount").textContent = `Вместе: ${tracker.getTotal(currentFilter).toFixed(2)}`;
}
 
document.getElementById("expenseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { name, amount, category, date } = Object.fromEntries(formData);
 
    if (!name || !amount || !category || !date) return;
 
    tracker.addExpense({ name, amount, category, date });
    event.target.reset();
    render();
});
 
document.getElementById("categoryFilter").addEventListener("change", (event) => {
    currentFilter = event.target.value;
    render();
});
 
document.querySelector('input[name="date"]').valueAsDate = new Date();
 
render();
