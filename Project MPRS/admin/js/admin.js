const API_BASE_URL = 'http://localhost:8083/api';
const ITEMS_PER_PAGE = 5;

function checkAuthentication() {
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

async function secureFetch(url, options = {}) {
    if (!checkAuthentication()) return;

    const token = localStorage.getItem('adminToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
        throw new Error('Session expired');
    }
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

function setupNavigation() {
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.addEventListener('click', () => {
            if (item.textContent.trim() === 'Logout') {
                logout();
                return;
            }
            document.querySelector('.sidebar li.active')?.classList.remove('active');
            item.classList.add('active');
            document.querySelector('.tab-content.active')?.classList.remove('active');
            document.getElementById(item.dataset.tab).classList.add('active');
            loadTabData(item.dataset.tab);
        });
    });
}

let paginationState = {
    users: { page: 1, total: 1 },
    transactions: { page: 1, total: 1 },
    plans: { page: 1, total: 1 },
    categories: { page: 1, total: 1 },
    kyc: { page: 1, total: 1 },
    payments: { page: 1, total: 1 },
    usage: { page: 1, total: 1 }
};

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuthentication()) {
        setupNavigation();
        loadDashboardData();
        document.getElementById('planForm').addEventListener('submit', handlePlanSubmit);
        document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
        document.getElementById('emailForm').addEventListener('submit', sendEmail);
    }
});




async function loadTabData(tab) {
    showLoading(tab);
    try {
        switch(tab) {
            case 'dashboard': await loadDashboardData(); break;
            case 'users': await loadUsers(); break;
            case 'transactions': await loadTransactions(); break;
            case 'recharge-plans': await loadRechargePlans(); break;
            case 'categories': await loadCategories(); break;
            case 'kyc': await loadKYCRequests(); break;
            case 'payments': await loadPayments(); break;
            case 'user-usage': await loadUserUsage(); break;
            case 'analytics': await loadAnalytics(); break;
        }
    } catch (error) {
        showToast(`Failed to load ${tab} data: ${error.message}`, 'error');
    } finally {
        hideLoading(tab);
    }
}

async function loadDashboardData() {
    const [users, plans, transactions] = await Promise.all([
        secureFetch(`${API_BASE_URL}/users`),
        secureFetch(`${API_BASE_URL}/recharge-plans/admin/all`),
        secureFetch(`${API_BASE_URL}/admin/transactions/soon-to-expire`)
    ]);

    document.getElementById('total-users').textContent = users.length;
    document.getElementById('active-plans').textContent = plans.filter(p => p.active).length;
    document.getElementById('total-revenue').textContent = `₹${transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}`;
    document.getElementById('expiring-soon').textContent = transactions.length;

    const tbody = document.querySelector('#expiring-table tbody');
    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td>${t.user?.mobileNumber || 'N/A'}</td>
            <td>${t.planName || 'N/A'}</td>
            <td>${new Date(t.expiryDate).toLocaleDateString()}</td>
            <td>₹${t.amount?.toFixed(2) || 'N/A'}</td>
            <td><button class="btn btn-info" onclick="showEmailModal('${t.user?.email}', '${t.user?.mobileNumber}', '${t.planName}', '${t.expiryDate}')">Notify</button></td>
        </tr>
    `).join('');
}

async function loadUsers(page = paginationState.users.page) {
    const users = await secureFetch(`${API_BASE_URL}/users`);
    paginationState.users.total = Math.ceil(users.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = users.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = paginated.map(user => `
        <tr>
            <td>${user.userId}</td>
            <td>${user.mobile}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-warning" onclick="viewUser(${user.userId})">View</button>
                <button class="btn btn-danger" onclick="deleteUser(${user.userId})">Delete</button>
            </td>
        </tr>
    `).join('');
    updatePagination('users');
}

async function loadTransactions(page = paginationState.transactions.page) {
    const transactions = await secureFetch(`${API_BASE_URL}/admin/transactions`);
    paginationState.transactions.total = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = transactions.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = paginated.map(t => `
        <tr>
            <td>${t.transactionId || 'N/A'}</td>
            <td>${t.user?.userId || 'N/A'}</td>
            <td>₹${t.amount?.toFixed(2) || 'N/A'}</td>
            <td>${t.transactionDate ? new Date(t.transactionDate).toLocaleDateString() : 'N/A'}</td>
            <td><span class="badge ${getStatusClass(t.status)}">${t.status || 'UNKNOWN'}</span></td>
            <td>
                <button class="btn btn-info" onclick="showEmailModal('${t.user?.email}', '${t.user?.mobileNumber}', '${t.planName}', '${t.expiryDate}')">Notify</button>
                <button class="btn btn-danger" onclick="softDeleteTransaction(${t.transactionId})">Delete</button>
            </td>
        </tr>
    `).join('');
    updatePagination('transactions');
}

async function loadRechargePlans(page = paginationState.plans.page) {
    const [plans, categories] = await Promise.all([
        secureFetch(`${API_BASE_URL}/recharge-plans/admin/all`),
        secureFetch(`${API_BASE_URL}/categories`)
    ]);
    const categoryMap = Object.fromEntries(categories.map(c => [c.categoryId, c.categoryName]));
    paginationState.plans.total = Math.ceil(plans.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = plans.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#plans-table tbody');
    tbody.innerHTML = paginated.map(plan => `
        <tr>
            <td>${plan.planId}</td>
            <td>${plan.name}</td>
            <td>₹${plan.price.toFixed(2)}</td>
            <td>${plan.validityDays} days</td>
            <td>${plan.dataLimit || 'Unlimited'} GB</td>
            <td>${categoryMap[plan.category?.categoryId] || 'N/A'}</td>
            <td><span class="badge ${plan.active ? 'bg-success' : 'bg-danger'}">${plan.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn btn-warning" onclick="editPlan(${plan.planId})">Edit</button>
                <button class="btn btn-${plan.active ? 'danger' : 'success'}" onclick="togglePlanStatus(${plan.planId}, ${!plan.active})">${plan.active ? 'Deactivate' : 'Activate'}</button>
                <button class="btn btn-danger" onclick="softDeletePlan(${plan.planId})">Delete</button>
            </td>
        </tr>
    `).join('');
    updatePagination('plans');
}

async function loadCategories(page = paginationState.categories.page) {
    const categories = await secureFetch(`${API_BASE_URL}/categories`);
    paginationState.categories.total = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = categories.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = paginated.map(cat => `
        <tr>
            <td>${cat.categoryId}</td>
            <td>${cat.categoryName}</td>
            <td><span class="badge ${cat.active ? 'bg-success' : 'bg-danger'}">${cat.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn btn-warning" onclick="editCategory(${cat.categoryId})">Edit</button>
                <button class="btn btn-${cat.active ? 'danger' : 'success'}" onclick="toggleCategoryStatus(${cat.categoryId}, ${!cat.active})">${cat.active ? 'Deactivate' : 'Activate'}</button>
                <button class="btn btn-danger" onclick="softDeleteCategory(${cat.categoryId})">Delete</button>
            </td>
        </tr>
    `).join('');
    updatePagination('categories');
}

async function loadKYCRequests(page = paginationState.kyc.page) {
    const kyc = await secureFetch(`${API_BASE_URL}/kyc-requests`);
    paginationState.kyc.total = Math.ceil(kyc.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = kyc.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#kyc-table tbody');
    tbody.innerHTML = paginated.map(k => `
        <tr>
            <td>${k.kycId}</td>
            <td>${k.user?.userId || 'N/A'}</td>
            <td><span class="badge ${getKYCStatusClass(k.status)}">${k.status}</span></td>
            <td>${new Date(k.submittedAt).toLocaleDateString()}</td>
            <td>
                ${k.status === 'PENDING' ? `
                    <button class="btn btn-success" onclick="approveKYC(${k.kycId}, true)">Approve</button>
                    <button class="btn btn-danger" onclick="approveKYC(${k.kycId}, false)">Reject</button>
                ` : ''}
                <button class="btn btn-info" onclick="viewKYCDetails(${k.kycId})">Details</button>
            </td>
        </tr>
    `).join('');
    updatePagination('kyc');
}

async function loadPayments(page = paginationState.payments.page) {
    const payments = await secureFetch(`${API_BASE_URL}/payments`);
    paginationState.payments.total = Math.ceil(payments.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = payments.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#payments-table tbody');
    tbody.innerHTML = paginated.map(p => `
        <tr>
            <td>${p.paymentId}</td>
            <td>${p.user?.userId || 'N/A'}</td>
            <td>₹${p.amount.toFixed(2)}</td>
            <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
            <td><button class="btn btn-info" onclick="viewPaymentDetails(${p.paymentId})">Details</button></td>
        </tr>
    `).join('');
    updatePagination('payments');
}

async function loadUserUsage(page = paginationState.usage.page) {
    const usage = await secureFetch(`${API_BASE_URL}/user-usage/all`);
    paginationState.usage.total = Math.ceil(usage.length / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = usage.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#usage-table tbody');
    tbody.innerHTML = paginated.map(u => `
        <tr>
            <td>${u.usageId}</td>
            <td>${u.user?.userId || 'N/A'}</td>
            <td>${u.dataUsed} GB</td>
            <td>${new Date(u.usageDate).toLocaleDateString()}</td>
        </tr>
    `).join('');
    updatePagination('usage');
}

// In script.js, replace the loadAnalytics function with this
async function loadAnalytics() {
    // Static data for demonstration
    const staticCategories = [
        { categoryName: "Unlimited", active: true },
        { categoryName: "Popular", active: true },
        { categoryName: "Topup", active: true },
        { categoryName: "calls", active: false }
    ];

    const staticPlans = {
        popularPlans: [
            { name: "Basic 199", purchases: 150 },
            { name: "Premium 499", purchases: 100 },
            { name: "Unlimited 999", purchases: 75 },
            { name: "Data 299", purchases: 50 }
        ],
        revenueTrend: [
            { date: "2025-03-01", revenue: 15000 },
            { date: "2025-03-02", revenue: 18000 },
            { date: "2025-03-03", revenue: 22000 },
            { date: "2025-03-04", revenue: 19000 },
            { date: "2025-03-05", revenue: 25000 }
        ]
    };

    const staticTransactions = [
        { status: "SUCCESS" }, { status: "SUCCESS" }, { status: "FAILED" },
        { status: "PENDING" }, { status: "SUCCESS" }, { status: "PENDING" }
    ];

    // Render charts with static data
    renderChart('categoryChart', 'doughnut', {
        labels: staticCategories.map(c => c.categoryName),
        data: staticCategories.map(c => c.active ? 1 : 0.5),
        title: 'Category Distribution'
    });

    renderChart('planPopularityChart', 'bar', {
        labels: staticPlans.popularPlans.map(p => p.name),
        data: staticPlans.popularPlans.map(p => p.purchases),
        title: 'Plan Popularity'
    });

    renderChart('revenueTrendChart', 'line', {
        labels: staticPlans.revenueTrend.map(t => t.date),
        data: staticPlans.revenueTrend.map(t => t.revenue),
        title: 'Revenue Trend'
    });

    renderChart('transactionStatusChart', 'pie', {
        labels: ['Success', 'Failed', 'Pending'],
        data: [
            staticTransactions.filter(t => t.status === 'SUCCESS').length,
            staticTransactions.filter(t => t.status === 'FAILED').length,
            staticTransactions.filter(t => t.status === 'PENDING').length
        ],
        title: 'Transaction Status'
    });
}

function renderChart(id, type, { labels, data, title }) {
    const ctx = document.getElementById(id).getContext('2d');
    new Chart(ctx, {
        type,
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#3498DB', '#E74C3C', '#27AE60', '#F1C40F', '#9B59B6'],
                borderColor: type === 'line' ? '#3498DB' : undefined,
                fill: type === 'line'
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: title } },
            scales: type === 'bar' || type === 'line' ? { y: { beginAtZero: true } } : undefined
        }
    });
}

async function handlePlanSubmit(e) {
    e.preventDefault();
    const planId = document.getElementById('planId').value;
    const data = {
        name: document.getElementById('planName').value,
        price: parseFloat(document.getElementById('planPrice').value),
        validityDays: parseInt(document.getElementById('planValidity').value),
        dataLimit: parseFloat(document.getElementById('planData').value),
        category: { categoryId: parseInt(document.getElementById('planCategory').value) },
        active: document.getElementById('planActive').value === 'true'
    };

    await secureFetch(`${API_BASE_URL}/recharge-plans${planId ? `/${planId}` : ''}`, {
        method: planId ? 'PUT' : 'POST',
        body: JSON.stringify(data)
    });
    showToast(`Plan ${planId ? 'updated' : 'created'} successfully`);
    closeModal('planModal');
    loadRechargePlans();
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const categoryId = document.getElementById('categoryId').value;
    const data = {
        categoryName: document.getElementById('categoryName').value,
        active: document.getElementById('categoryActive').value === 'true'
    };

    await secureFetch(`${API_BASE_URL}/categories${categoryId ? `/${categoryId}` : ''}`, {
        method: categoryId ? 'PUT' : 'POST',
        body: JSON.stringify(data)
    });
    showToast(`Category ${categoryId ? 'updated' : 'created'} successfully`);
    closeModal('categoryModal');
    loadCategories();
}

async function togglePlanStatus(id, active) {
    await secureFetch(`${API_BASE_URL}/recharge-plans/${id}/status?active=${active}`, { method: 'PATCH' });
    showToast(`Plan ${active ? 'activated' : 'deactivated'} successfully`);
    loadRechargePlans();
}

async function toggleCategoryStatus(id, active) {
    await secureFetch(`${API_BASE_URL}/categories/${id}/status?active=${active}`, { method: 'PATCH' });
    showToast(`Category ${active ? 'activated' : 'deactivated'} successfully`);
    loadCategories();
}

async function softDeletePlan(id) {
    if (confirm('Are you sure?')) {
        await secureFetch(`${API_BASE_URL}/recharge-plans/${id}`, { method: 'DELETE' });
        showToast('Plan deleted successfully');
        loadRechargePlans();
    }
}

async function softDeleteCategory(id) {
    if (confirm('Are you sure?')) {
        await secureFetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
        showToast('Category deleted successfully');
        loadCategories();
    }
}

async function softDeleteTransaction(id) {
    if (confirm('Are you sure?')) {
        await secureFetch(`${API_BASE_URL}/admin/transactions/${id}`, { method: 'DELETE' });
        showToast('Transaction deleted successfully');
        loadTransactions();
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure?')) {
        await secureFetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        showToast('User deleted successfully');
        loadUsers();
    }
}

async function approveKYC(id, approved) {
    await secureFetch(`${API_BASE_URL}/kyc/approve/${id}?approved=${approved}`, { method: 'PUT' });
    showToast(`KYC ${approved ? 'approved' : 'rejected'} successfully`);
    loadKYCRequests();
}

function showAddPlanModal() {
    document.getElementById('planForm').reset();
    document.getElementById('planModalTitle').textContent = 'Add Plan';
    secureFetch(`${API_BASE_URL}/categories`).then(categories => {
        document.getElementById('planCategory').innerHTML = categories.map(c => 
            `<option value="${c.categoryId}">${c.categoryName}</option>`
        ).join('');
        document.getElementById('planModal').style.display = 'block';
    });
}

function showAddCategoryModal() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModalTitle').textContent = 'Add Category';
    document.getElementById('categoryModal').style.display = 'block';
}

async function editPlan(id) {
    const [plan, categories] = await Promise.all([
        secureFetch(`${API_BASE_URL}/recharge-plans/${id}`),
        secureFetch(`${API_BASE_URL}/categories`)
    ]);
    document.getElementById('planId').value = plan.planId;
    document.getElementById('planName').value = plan.name;
    document.getElementById('planPrice').value = plan.price;
    document.getElementById('planValidity').value = plan.validityDays;
    document.getElementById('planData').value = plan.dataLimit;
    document.getElementById('planActive').value = plan.active.toString();
    document.getElementById('planCategory').innerHTML = categories.map(c => 
        `<option value="${c.categoryId}" ${c.categoryId === plan.category?.categoryId ? 'selected' : ''}>${c.categoryName}</option>`
    ).join('');
    document.getElementById('planModalTitle').textContent = 'Edit Plan';
    document.getElementById('planModal').style.display = 'block';
}

async function editCategory(id) {
    const category = await secureFetch(`${API_BASE_URL}/categories/${id}`);
    document.getElementById('categoryId').value = category.categoryId;
    document.getElementById('categoryName').value = category.categoryName;
    document.getElementById('categoryActive').value = category.active.toString();
    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('categoryModal').style.display = 'block';
}

function showEmailModal(email, mobile, planName, expiryDate) {
    document.getElementById('emailRecipient').value = email || '';
    document.getElementById('emailMobile').value = mobile || '';
    document.getElementById('emailSubject').value = `Plan ${planName} Expiry Reminder`;
    document.getElementById('emailMessage').value = `Your ${planName} plan is expiring on ${new Date(expiryDate).toLocaleDateString()}. Please recharge soon!`;
    document.getElementById('emailModal').style.display = 'block';
}

async function sendEmail(e) {
    e.preventDefault();
    const data = {
        toEmail: document.getElementById('emailRecipient').value,
        mobileNumber: document.getElementById('emailMobile').value,
        subject: document.getElementById('emailSubject').value,
        message: document.getElementById('emailMessage').value
    };
    await secureFetch(`${API_BASE_URL}/admin/transactions/send-reminder`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    showToast('Email sent successfully');
    closeModal('emailModal');
}

async function viewUser(id) {
    const user = await secureFetch(`${API_BASE_URL}/users/${id}`);
    alert(`User Details:\nID: ${user.userId}\nMobile: ${user.mobile}\nUsername: ${user.username || 'N/A'}\nJoined: ${new Date(user.createdAt).toLocaleString()}`);
}

async function viewKYCDetails(id) {
    const kyc = await secureFetch(`${API_BASE_URL}/kyc-requests/${id}`);
    alert(`KYC Details:\nID: ${kyc.kycId}\nUser ID: ${kyc.user?.userId || 'N/A'}\nStatus: ${kyc.status}\nSubmitted: ${new Date(kyc.submittedAt).toLocaleString()}`);
}

async function viewPaymentDetails(id) {
    const payment = await secureFetch(`${API_BASE_URL}/payments/${id}`);
    alert(`Payment Details:\nID: ${payment.paymentId}\nUser ID: ${payment.user?.userId || 'N/A'}\nAmount: ₹${payment.amount.toFixed(2)}\nDate: ${new Date(payment.paymentDate).toLocaleString()}`);
}

function getStatusClass(status) {
    return {
        'SUCCESS': 'bg-success',
        'FAILED': 'bg-danger',
        'PENDING': 'bg-warning'
    }[status] || 'bg-secondary';
}

function getKYCStatusClass(status) {
    return {
        'VERIFIED': 'bg-success',
        'REJECTED': 'bg-danger',
        'PENDING': 'bg-warning'
    }[status] || 'bg-secondary';
}

function updatePagination(type) {
    const { page, total } = paginationState[type];
    document.getElementById(`${type}-pagination`).innerHTML = `
        <button class="btn btn-primary" onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${page - 1})" ${page <= 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${page} of ${total}</span>
        <button class="btn btn-primary" onclick="load${type.charAt(0).toUpperCase() + type.slice(1)}(${page + 1})" ${page >= total ? 'disabled' : ''}>Next</button>
    `;
}

async function filterTransactions() {
    const date = document.getElementById('trans-date-filter').value;
    const minAmount = document.getElementById('trans-min-amount').value;
    const maxAmount = document.getElementById('trans-max-amount').value;
    const status = document.getElementById('trans-status-filter').value;

    const params = new URLSearchParams();
    if (date) params.append('fromDate', date);
    if (minAmount) params.append('minAmount', minAmount);
    if (maxAmount) params.append('maxAmount', maxAmount);
    if (status) params.append('status', status);

    const transactions = await secureFetch(`${API_BASE_URL}/admin/transactions?${params.toString()}`);
    loadTransactions(1); // Reset to first page
}

async function applyDateFilter() {
    const start = document.getElementById('start-date').value;
    const end = document.getElementById('end-date').value;
    if (start && end) {
        const plans = await secureFetch(`${API_BASE_URL}/recharge-plans/analytics/revenue-trend?startDate=${start}&endDate=${end}`);
        renderChart('revenueTrendChart', 'line', {
            labels: plans.map(t => t.date),
            data: plans.map(t => t.revenue),
            title: 'Revenue Trend (Filtered)'
        });
    }
}
async function downloadReport(format) {
    const start = document.getElementById('start-date').value;
    const end = document.getElementById('end-date').value;
    let url = `${API_BASE_URL}/recharge-plans/stats?format=${format}`;
    if (start && end) url += `&startDate=${start}&endDate=${end}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get('Content-Type');
        if (contentType !== 'application/pdf' && format === 'pdf') {
            throw new Error(`Unexpected content type: ${contentType}`);
        }

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showToast(`Report downloaded successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
        showToast(`Failed to download report: ${error.message}`, 'error');
        console.error('Download error:', error);
    }
}

function showLoading(tab) {
    document.getElementById(tab).insertAdjacentHTML('beforeend', '<div class="loader"></div>');
}

function hideLoading(tab) {
    document.querySelector(`#${tab} .loader`)?.remove();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.querySelector('#toast-message').textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}

// Expose functions to global scope
window.loadUsers = loadUsers;
window.loadTransactions = loadTransactions;
window.loadRechargePlans = loadRechargePlans;
window.loadCategories = loadCategories;
window.loadKYCRequests = loadKYCRequests;
window.loadPayments = loadPayments;
window.loadUserUsage = loadUserUsage;
window.showAddPlanModal = showAddPlanModal;
window.showAddCategoryModal = showAddCategoryModal;
window.editPlan = editPlan;
window.editCategory = editCategory;
window.togglePlanStatus = togglePlanStatus;
window.toggleCategoryStatus = toggleCategoryStatus;
window.softDeletePlan = softDeletePlan;
window.softDeleteCategory = softDeleteCategory;
window.softDeleteTransaction = softDeleteTransaction;
window.deleteUser = deleteUser;
window.approveKYC = approveKYC;
window.viewUser = viewUser;
window.viewKYCDetails = viewKYCDetails;
window.viewPaymentDetails = viewPaymentDetails;
window.showEmailModal = showEmailModal;
window.filterTransactions = filterTransactions;
window.applyDateFilter = applyDateFilter;
window.downloadReport = downloadReport;

async function sendEmail(e) {
    e.preventDefault();
    try {
        const data = {
            toEmail: document.getElementById('emailRecipient').value,
            mobileNumber: document.getElementById('emailMobile').value,
            subject: document.getElementById('emailSubject').value,
            message: document.getElementById('emailMessage').value
        };
        await secureFetch(`${API_BASE_URL}/admin/transactions/send-reminder`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        showToast('Email sent successfully');
        closeModal('emailModal');
    } catch (error) {
        showToast(`Failed to send email: ${error.message}`, 'error');
    }
}

async function togglePlanStatus(id, active) {
    try {
        await secureFetch(`${API_BASE_URL}/recharge-plans/${id}/status?active=${active}`, { method: 'PATCH' });
        showToast(`Plan ${active ? 'activated' : 'deactivated'} successfully`);
        loadRechargePlans();
    } catch (error) {
        showToast(`Failed to toggle plan status: ${error.message}`, 'error');
    }
}
