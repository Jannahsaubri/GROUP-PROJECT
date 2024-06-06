$(document).ready(function() {
    const expenseList = $('#expense-list');
    const totalExpenses = $('#total-expenses');
    const expenseForm = $('#expense-form');
    const expenseIdField = $('#expense-id');
    const expenseAmountField = $('#expense-amount');
    const expenseDateField = $('#expense-date');
    const expenseDescriptionField = $('#expense-description');
    const sortOrder = $('#sort-order');

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let currentView = localStorage.getItem('currentView') || 'daily';
    let currentDate = localStorage.getItem('currentDate') || '';

    updateExpenseList(currentView, currentDate);

    expenseForm.on('submit', function(e) {
        e.preventDefault();

        const id = expenseIdField.val();
        const amount = parseFloat(expenseAmountField.val()).toFixed(2);
        const date = formatDate(expenseDateField.val());
        const description = expenseDescriptionField.val();

        const expense = { amount, date, description };

        if (id) {
            expenses[id] = expense;
        } else {
            expenses.push(expense);
        }

        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateExpenseList(currentView, currentDate);
        expenseForm[0].reset();
        expenseIdField.val('');
    });

    expenseList.on('click', '.edit-expense', function() {
        const index = $(this).data('index');
        const expense = expenses[index];

        expenseIdField.val(index);
        expenseAmountField.val(expense.amount);
        expenseDateField.val(reverseFormatDate(expense.date));
        expenseDescriptionField.val(expense.description);
    });

    expenseList.on('click', '.delete-expense', function() {
        const index = $(this).data('index');
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateExpenseList(currentView, currentDate);
    });

    $('#view-daily').click(function() {
        $('#datePickerModal').modal('show');
    });
    $('#view-monthly').click(function() {
        $('#monthPickerModal').modal('show');
    });
    $('#view-yearly').click(function() {
        $('#yearPickerModal').modal('show');
    });

    $('#select-date-btn').click(function() {
        const selectedDate = $('#selected-date').val();
        if (selectedDate) {
            currentView = 'daily';
            currentDate = selectedDate;
            localStorage.setItem('currentView', currentView);
            localStorage.setItem('currentDate', currentDate);
            $('#datePickerModal').modal('hide');
            updateExpenseList(currentView, currentDate);
        }
    });

    $('#select-month-btn').click(function() {
        const selectedMonth = $('#selected-month').val();
        if (selectedMonth) {
            currentView = 'monthly';
            currentDate = selectedMonth;
            localStorage.setItem('currentView', currentView);
            localStorage.setItem('currentDate', currentDate);
            $('#monthPickerModal').modal('hide');
            updateExpenseList(currentView, currentDate);
        }
    });

    $('#select-year-btn').click(function() {
        const selectedYear = $('#selected-year').val();
        if (selectedYear) {
            currentView = 'yearly';
            currentDate = selectedYear;
            localStorage.setItem('currentView', currentView);
            localStorage.setItem('currentDate', currentDate);
            $('#yearPickerModal').modal('hide');
            updateExpenseList(currentView, currentDate);
        }
    });

    sortOrder.change(function() {
        updateExpenseList(currentView, currentDate);
    });

    function updateExpenseList(view, selectedDate) {
        expenseList.empty();
        let total = 0;

        let groupedExpenses = groupExpenses(view, selectedDate);

        for (let group in groupedExpenses) {
            let groupTotal = 0;
            expenseList.append(`<li class="list-group-item active">${formatGroupHeader(view, group)}</li>`);

            let sortedExpenses = groupedExpenses[group].sort((a, b) => {
                return sortOrder.val() === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            });

            sortedExpenses.forEach((expense, index) => {
                groupTotal += parseFloat(expense.amount);
                expenseList.append(
                    `<li class="list-group-item d-flex justify-content-between align-items-center">
                        ${expense.description} - RM${expense.amount} <small>${expense.date}</small>
                        <div>
                            <button class="btn btn-secondary btn-sm edit-expense" data-index="${index}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-expense" data-index="${index}">Delete</button>
                        </div>
                    </li>`
                );
            });
            expenseList.append(`<li class="list-group-item">Total: RM${groupTotal.toFixed(2)}</li>`);
            total += groupTotal;
        }

        totalExpenses.text(total.toFixed(2));
    }

    function groupExpenses(view, selectedDate) {
        let grouped = {};
        expenses.forEach(expense => {
            let date = new Date(reverseFormatDate(expense.date));
            let key;
            switch (view) {
                case 'daily':
                    key = formatDateToISO(date);
                    break;
                case 'monthly':
                    key = formatMonthYearToISO(date);
                    break;
                case 'yearly':
                    key = date.getFullYear().toString();
                    break;
            }
            if (key.startsWith(selectedDate)) {
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(expense);
            }
        });
        return grouped;
    }

    function formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    function reverseFormatDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }

    function formatDateToISO(date) {
        return date.toISOString().split('T')[0];
    }

    function formatMonthYearToISO(date) {
        return date.toISOString().split('T')[0].substring(0, 7);
    }

    function formatGroupHeader(view, dateStr) {
        const date = new Date(dateStr);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        if (view === 'daily') {
            return `Expenses on ${date.toLocaleDateString('en-GB', options)}`;
        } else if (view === 'monthly') {
            const [year, month] = dateStr.split('-');
            const monthName = new Date(year, month - 1).toLocaleString('en-GB', { month: 'long' });
            return `Expenses for ${monthName} ${year}`;
        } else if (view === 'yearly') {
            return `Expenses for ${dateStr}`;
        }
    }
});
