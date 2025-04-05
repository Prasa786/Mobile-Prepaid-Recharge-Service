
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

try {
const response = await fetch(url, { 
    ...options, 
    headers,
    method: options.method || 'GET'
});

const responseClone = response.clone();

if (response.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
    throw new Error('Unauthorized - Session expired');
}

if (!response.ok) {
    try {
        const errorData = await responseClone.json();
        throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
    } catch (e) {
        const errorText = await responseClone.text();
        throw new Error(errorText || `Server error: ${response.status} ${response.statusText}`);
    }
}

const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
    return null;
}

return await response.json();
} catch (error) {
console.error('Fetch error:', {
    url,
    error: error.message,
    stack: error.stack
});
showToast(error.message, 'error');
throw error;
}
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
            const tabContent = document.getElementById(item.dataset.tab);
            if (tabContent) {
                tabContent.classList.add('active');
                loadTabData(item.dataset.tab);
            }
        });
    });
}

let currentPlanPage = 1;
let totalPlanPages = 1;
let currentCategoryPage = 1;
let totalCategoryPages = 1;

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuthentication()) {
        setupNavigation();
        loadTabData('users');
        
        document.getElementById('planForm').addEventListener('submit', handlePlanSubmit);
        document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    }
});

async function loadTabData(tab) {
    showLoading(tab);
    try {
        switch(tab) {
            case 'users': await loadUsers(); break;
            case 'transactions': await loadTransactions(); break;
            case 'recharge-plans': await loadRechargePlans(); break;
            case 'categories': await loadCategories(); break;
            case 'kyc': await loadKYCRequests(); break;
            case 'payments': await loadPayments(); break;
            case 'user-plans': await loadUserPlans(); break;
            case 'user-usage': await loadUserUsage(); break;
            case 'analytics': await loadAnalytics(); break;
        }
    } catch (error) {
        console.error(`Error loading ${tab}:`, error);
        showToast(`Failed to load ${tab} data: ${error.message}`, 'error');
    } finally {
        hideLoading(tab);
    }
}

function showLoading(tab) {
    const tabContent = document.getElementById(tab);
    if (tabContent) {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.id = `${tab}-loader`;
        tabContent.appendChild(loader);
    }
}

function hideLoading(tab) {
    const loader = document.getElementById(`${tab}-loader`);
    if (loader) loader.remove();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    toastIcon.className = type === 'success' ? 'fas fa-check-circle' :
                         type === 'error' ? 'fas fa-exclamation-circle' :
                         'fas fa-exclamation-triangle';
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
}

async function loadUsers() {
    const users = await secureFetch(`${API_BASE_URL}/users`);
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.userId}</td>
            <td>${user.mobile}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="viewUser(${user.userId})">View</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.userId})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        await secureFetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        showToast('User deleted successfully');
        loadUsers();
    }
}

async function viewUser(id) {
    const user = await secureFetch(`${API_BASE_URL}/users/${id}`);
    document.getElementById('detailsModalTitle').textContent = 'User Details';
    document.getElementById('detailsModalBody').innerHTML = `
        <div class="form-group">
            <label>User ID</label><p>${user.userId}</p>
        </div>
        <div class="form-group">
            <label>Mobile</label><p>${user.mobile}</p>
        </div>
        <div class="form-group">
            <label>Email</label><p>${user.email || 'N/A'}</p>
        </div>
        <div class="form-group">
            <label>Join Date</label><p>${new Date(user.createdAt).toLocaleString()}</p>
        </div>
    `;
    document.getElementById('detailsModal').style.display = 'block';
}

async function loadTransactions() {
    try {
        const transactions = await secureFetch(`${API_BASE_URL}/transactions`);
        if (transactions) {
            renderTransactions(transactions);
        }
    } catch (error) {
        console.error("Error loading transactions:", error);
        showToast("Failed to load transactions", 'error');
    }
}

function renderTransactions(transactions) {
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = transactions.map(t => {
        const amount = t.amount ? `₹${parseFloat(t.amount).toFixed(2)}` : 'N/A';
        const userId = t.user?.userId || t.userId || 'N/A';
        const transactionDate = t.transactionDate ? 
            new Date(t.transactionDate).toLocaleString() : 'N/A';
        
        return `
            <tr>
                <td>${t.transactionId || 'N/A'}</td>
                <td>${userId}</td>
                <td>${amount}</td>
                <td>${transactionDate}</td>
                <td><span class="badge ${getStatusBadgeClass(t.status)}">${t.status || 'UNKNOWN'}</span></td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="showEmailModal(${t.transactionId}, ${userId})">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="softDeleteTransaction(${t.transactionId})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusBadgeClass(status) {
    return {
        'COMPLETED': 'bg-success',
        'SUCCESS': 'bg-success',
        'FAILED': 'bg-danger',
        'PENDING': 'bg-warning',
        'REFUNDED': 'bg-info'
    }[status] || 'bg-secondary';
}

async function softDeleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            await secureFetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' });
            showToast('Transaction deleted successfully');
            loadTransactions();
        } catch (error) {
            showToast(`Failed to delete transaction: ${error.message}`, 'error');
        }
    }
}

async function filterTransactions() {
    try {
        const date = document.getElementById('date-filter').value;
        const minAmount = document.getElementById('min-amount').value;
        const maxAmount = document.getElementById('max-amount').value;
        const status = document.getElementById('status-filter').value;

        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (minAmount) params.append('minAmount', minAmount);
        if (maxAmount) params.append('maxAmount', maxAmount);
        if (status) params.append('status', status);

        const url = `${API_BASE_URL}/transactions/filter?${params.toString()}`;
        const transactions = await secureFetch(url);

        renderTransactions(transactions);
    } catch (error) {
        console.error("Error filtering transactions:", error);
        showToast("Failed to filter transactions", 'error');
    }
}
async function loadRechargePlans(page = currentPlanPage) {
try {
const [plans, categories] = await Promise.all([
    secureFetch(`${API_BASE_URL}/recharge-plans/admin/all`),
    secureFetch(`${API_BASE_URL}/categories`)
]);

const categoryMap = {};
categories.forEach(cat => {
    categoryMap[cat.categoryId] = cat.categoryName;
});

totalPlanPages = Math.ceil(plans.length / ITEMS_PER_PAGE);
currentPlanPage = page;
const start = (page - 1) * ITEMS_PER_PAGE;
const paginatedPlans = plans.slice(start, start + ITEMS_PER_PAGE);

const tbody = document.querySelector('#plans-table tbody');
tbody.innerHTML = paginatedPlans.map(plan => {
    const categoryName = plan.categoryName ? 
        (categoryMap[plan.categoryName] || 'Unknown Category') : 
        'No Category';
    
    return `
        <tr>
            <td>${plan.planId}</td>
            <td>${plan.name}</td>
            <td>₹${plan.price.toFixed(2)}</td>
            <td>${plan.validityDays} days</td>
            <td>${plan.dataLimit || plan.dataLimits || 'Unlimited'} GB</td>
            <td>${categoryName}</td>
            <td><span class="badge ${plan.active ? 'bg-success' : 'bg-secondary'}">${plan.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editPlan(${plan.planId})">Edit</button>
                <button class="btn btn-${plan.active ? 'danger' : 'success'} btn-sm" 
                    onclick="togglePlanStatus(${plan.planId}, ${!plan.active})">${plan.active ? 'Deactivate' : 'Activate'}</button>
                <button class="btn btn-danger btn-sm" onclick="softDeletePlan(${plan.planId})">Delete</button>
            </td>
        </tr>
    `;
}).join('');
updatePaginationControls('plans');
} catch (error) {
console.error("Error loading plans:", error);
showToast(`Failed to load plans: ${error.message}`, 'error');
}
}
async function editPlan(id) {
    const [plan, categories] = await Promise.all([
        secureFetch(`${API_BASE_URL}/recharge-plans/${id}`),
        secureFetch(`${API_BASE_URL}/categories`)
    ]);
    
    document.getElementById('planId').value = plan.id;
    document.getElementById('planName').value = plan.name;
    document.getElementById('planPrice').value = plan.price;
    document.getElementById('planValidityDays').value = plan.validityDays;
    document.getElementById('planData').value = plan.data || '';
    document.getElementById('planDescription').value = plan.description || '';
    document.getElementById('planActive').value = plan.active.toString();
    
    const categorySelect = document.getElementById('planCategory');
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.categoryId}" ${plan.category?.categoryId === cat.categoryId ? 'selected' : ''}>
            ${cat.categoryName}
        </option>`
    ).join('');
    
    document.getElementById('planModalTitle').textContent = 'Edit Plan';
    document.getElementById('planModal').style.display = 'block';
}

async function togglePlanStatus(id, active) {
if (!id || isNaN(id)) {
showToast('Invalid plan ID', 'error');
console.error('togglePlanStatus: Invalid ID', id);
return;
}
try {
await secureFetch(`${API_BASE_URL}/recharge-plans/${id}/status?active=${active}`, { method: 'PATCH' });
showToast(`Plan ${active ? 'activated' : 'deactivated'} successfully`);
loadRechargePlans();
} catch (error) {
showToast(`Failed to update plan status: ${error.message}`, 'error');
}
}


async function handlePlanSubmit(e) {
e.preventDefault();

try {
const price = parseFloat(document.getElementById('planPrice').value);
if (isNaN(price)) throw new Error('Invalid price');

const validity = parseInt(document.getElementById('planValidity').value);
if (isNaN(validity)) throw new Error('Invalid validity days');

const dataLimit = parseFloat(document.getElementById('planData').value);
if (isNaN(dataLimit)) throw new Error('Invalid data limit');

const categoryId = parseInt(document.getElementById('planCategory').value);
if (isNaN(categoryId)) throw new Error('Invalid category');

const planData = {
    name: document.getElementById('planName').value,
    price: price,
    validityDays: validity,
    dataLimit: dataLimit,
    description: document.getElementById('planDescription').value || null,
    active: document.getElementById('planActive').value === 'true',
    category: { categoryId: categoryId },
    smsCount: 0,
    callMinutes: 0,
    benefits: "Standard benefits",
    planType: "DEFAULT"
};

const planId = document.getElementById('planId').value;
const url = planId ? `${API_BASE_URL}/recharge-plans/${planId}` : `${API_BASE_URL}/recharge-plans`;
const method = planId ? 'PUT' : 'POST';

console.log("Sending:", { url, method, planData });

const response = await secureFetch(url, {
    method,
    body: JSON.stringify(planData)
});

showToast(`Plan ${planId ? 'updated' : 'created'} successfully`);
closeModal('planModal');
loadRechargePlans();
} catch (error) {
console.error("Plan submission error:", error);
showToast(`Error: ${error.message}`, 'error');
}
}

async function loadCategories(page = currentCategoryPage) {
    const categories = await secureFetch(`${API_BASE_URL}/categories`);
    totalCategoryPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    currentCategoryPage = page;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginatedCategories = categories.slice(start, start + ITEMS_PER_PAGE);

    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = paginatedCategories.map(cat => `
        <tr>
            <td>${cat.categoryId}</td>
            <td>${cat.categoryName}</td>
            <td><span class="badge ${cat.active ? 'bg-success' : 'bg-secondary'}">${cat.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editCategory(${cat.categoryId})">Edit</button>
                <button class="btn btn-${cat.active ? 'danger' : 'success'} btn-sm" 
                    onclick="toggleCategoryStatus(${cat.categoryId}, ${!cat.active})">${cat.active ? 'Deactivate' : 'Activate'}</button>
                <button class="btn btn-danger btn-sm" onclick="softDeleteCategory(${cat.categoryId})">Delete</button>
            </td>
        </tr>
    `).join('');
    updatePaginationControls('categories');
}

async function softDeleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        await secureFetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
        showToast('Category deleted successfully');
        loadCategories();
    }
}

async function editCategory(id) {
    const category = await secureFetch(`${API_BASE_URL}/categories/${id}`);
    document.getElementById('categoryId').value = category.categoryId;
    document.getElementById('categoryName').value = category.categoryName;
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('categoryActive').value = category.active.toString();
    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('categoryModal').style.display = 'block';
}

async function toggleCategoryStatus(id, active) {
try {
const response = await secureFetch(
    `${API_BASE_URL}/categories/${id}/status?active=${active}`, 
    { method: 'PATCH' }
);
showToast(`Category ${active ? 'activated' : 'deactivated'} successfully`);
loadCategories();
} catch (error) {
console.error("Error toggling category status:", error);
showToast(`Failed to update category status: ${error.message}`, 'error');
}
}

async function handleCategorySubmit(e) {
e.preventDefault();

try {
const category = {
    categoryId: document.getElementById('categoryId').value || undefined,
    categoryName: document.getElementById('categoryName').value,
    description: document.getElementById('categoryDescription').value || null,
    active: document.getElementById('categoryActive').value === 'true'
};

const url = category.categoryId 
    ? `${API_BASE_URL}/categories/${category.categoryId}`
    : `${API_BASE_URL}/categories`;
    
const method = category.categoryId ? 'PUT' : 'POST';

console.log("Submitting category:", category);

const response = await secureFetch(url, {
    method,
    body: JSON.stringify(category)
});

showToast(`Category ${category.categoryId ? 'updated' : 'created'} successfully`);
closeModal('categoryModal');
loadCategories();
} catch (error) {
console.error("Category submission error:", error);
showToast(`Failed to save category: ${error.message}`, 'error');
}
}
async function loadKYCRequests() {
    const kycRequests = await secureFetch(`${API_BASE_URL}/kyc-requests`);
    const tbody = document.querySelector('#kyc-table tbody');
    tbody.innerHTML = kycRequests.map(kyc => `
        <tr>
            <td>${kyc.kycId}</td>
            <td>${kyc.user?.userId || 'N/A'}</td>
            <td><span class="badge ${getKYCStatusBadgeClass(kyc.status)}">${kyc.status}</span></td>
            <td>${new Date(kyc.submittedAt).toLocaleDateString()}</td>
            <td>
                ${kyc.status === 'PENDING' ? `
                <button class="btn btn-success btn-sm" onclick="approveKYC(${kyc.kycId}, true)">Approve</button>
                <button class="btn btn-danger btn-sm" onclick="approveKYC(${kyc.kycId}, false)">Reject</button>
                ` : ''}
                <button class="btn btn-info btn-sm" onclick="viewKYCDetails(${kyc.kycId})">Details</button>
            </td>
        </tr>
    `).join('');
}

function getKYCStatusBadgeClass(status) {
    return {
        'VERIFIED': 'bg-success',
        'REJECTED': 'bg-danger',
        'PENDING': 'bg-warning'
    }[status] || 'bg-secondary';
}

async function approveKYC(id, approve) {
    await secureFetch(`${API_BASE_URL}/kyc/approve/${id}?approved=${approve}`, { method: 'PUT' });
    showToast(`KYC request ${approve ? 'approved' : 'rejected'} successfully`);
    loadKYCRequests();
}

async function viewKYCDetails(id) {
    const kyc = await secureFetch(`${API_BASE_URL}/kyc-requests`).then(requests => requests.find(r => r.kycId === id));
    document.getElementById('detailsModalTitle').textContent = 'KYC Details';
    document.getElementById('detailsModalBody').innerHTML = `
        <div class="form-group">
            <label>KYC ID</label><p>${kyc.kycId}</p>
        </div>
        <div class="form-group">
            <label>User ID</label><p>${kyc.user?.userId || 'N/A'}</p>
        </div>
        <div class="form-group">
            <label>Status</label><p><span class="badge ${getKYCStatusBadgeClass(kyc.status)}">${kyc.status}</span></p>
        </div>
        <div class="form-group">
            <label>Submitted At</label><p>${new Date(kyc.submittedAt).toLocaleString()}</p>
        </div>
    `;
    document.getElementById('detailsModal').style.display = 'block';
}

async function loadPayments() {
    const payments = await secureFetch(`${API_BASE_URL}/payments`);
    const tbody = document.querySelector('#payments-table tbody');
    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.paymentId}</td>
            <td>${payment.user?.userId || 'N/A'}</td>
            <td>₹${payment.amount.toFixed(2)}</td>
            <td>${new Date(payment.paymentDate).toLocaleString()}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewPaymentDetails(${payment.paymentId})">Details</button>
            </td>
        </tr>
    `).join('');
}

async function viewPaymentDetails(id) {
    const payment = await secureFetch(`${API_BASE_URL}/payments/${id}`);
    document.getElementById('detailsModalTitle').textContent = 'Payment Details';
    document.getElementById('detailsModalBody').innerHTML = `
        <div class="form-group">
            <label>Payment ID</label><p>${payment.paymentId}</p>
        </div>
        <div class="form-group">
            <label>User ID</label><p>${payment.user?.userId || 'N/A'}</p>
        </div>
        <div class="form-group">
            <label>Amount</label><p>₹${payment.amount.toFixed(2)}</p>
        </div>
        <div class="form-group">
            <label>Date</label><p>${new Date(payment.paymentDate).toLocaleString()}</p>
        </div>
    `;
    document.getElementById('detailsModal').style.display = 'block';
}

async function loadUserPlans() {
    const userPlans = await secureFetch(`${API_BASE_URL}/user-plans/all`);
    const tbody = document.querySelector('#user-plans-table tbody');
    tbody.innerHTML = userPlans.map(plan => `
        <tr>
            <td>${plan.userPlanId}</td>
            <td>${plan.user?.userId || 'N/A'}</td>
            <td>${plan.rechargePlan?.name || 'N/A'}</td>
            <td>${new Date(plan.startDate).toLocaleDateString()}</td>
            <td>${new Date(plan.endDate).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

async function loadUserUsage() {
    const usage = await secureFetch(`${API_BASE_URL}/user-usage/all`);
    const tbody = document.querySelector('#user-usage-table tbody');
    tbody.innerHTML = usage.map(u => `
        <tr>
            <td>${u.usageId}</td>
            <td>${u.user?.userId || 'N/A'}</td>
            <td>${u.dataUsed} GB</td>
            <td>${new Date(u.usageDate).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

async function loadAnalytics() {
    try {
        showLoading('analytics');
        
        // Fetch all necessary data in parallel
        const [categoriesResponse, plansResponse, transactionsResponse, usersResponse] = await Promise.all([
            secureFetch(`${API_BASE_URL}/categories/analytics/stats`),
            secureFetch(`${API_BASE_URL}/recharge-plans/analytics/stats`),
            secureFetch(`${API_BASE_URL}/transactions`),
            secureFetch(`${API_BASE_URL}/users`)
        ]);

        // Process responses safely
        const categories = categoriesResponse || {};
        const plans = plansResponse || {};
        const transactions = transactionsResponse || [];
        const users = usersResponse || [];

        // Calculate summary values with fallbacks
        const totalRevenue = plans.totalRevenue ? parseFloat(plans.totalRevenue) : 0;
        const monthlyRevenue = plans.monthlyRevenue ? parseFloat(plans.monthlyRevenue) : 0;
        const activePlans = plans.activePlans || 0;
        const totalPlans = plans.totalPlans || 0;

        // Update summary cards safely
        document.getElementById('total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('monthly-revenue').textContent = `₹${monthlyRevenue.toFixed(2)}`;
        document.getElementById('total-users').textContent = users.length;
        document.getElementById('active-plans').textContent = `${activePlans}/${totalPlans}`;

        // Render charts with proper data validation
        if (categories.planCountByCategory) {
            renderCategoryDistributionChart(categories);
        } else {
            console.warn('No category distribution data available');
        }

        if (plans.popularPlans) {
            renderPlanPopularityChart(plans.popularPlans);
        } else {
            console.warn('No popular plans data available');
        }

        if (plans.revenueTrend) {
            renderRevenueTrendChart(plans.revenueTrend);
        } else {
            console.warn('No revenue trend data available');
        }

        if (transactions.length > 0) {
            renderTransactionStatusChart(transactions);
        } else {
            console.warn('No transactions data available');
        }

        if (users.length > 0) {
            renderUserGrowthChart(users);
        } else {
            console.warn('No users data available');
        }

    } catch (error) {
        console.error("Error loading analytics:", error);
        showToast(`Failed to load analytics: ${error.message}`, 'error');
        
        // Set default values when error occurs
        document.getElementById('total-revenue').textContent = '₹0.00';
        document.getElementById('monthly-revenue').textContent = '₹0.00';
        document.getElementById('total-users').textContent = '0';
        document.getElementById('active-plans').textContent = '0/0';
        
    } finally {
        hideLoading('analytics');
    }
}

function renderCategoryDistributionChart(categories) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (window.categoryChart) window.categoryChart.destroy();
    window.categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories.map(c => c.categoryName),
            datasets: [{
                data: categories.map(c => c.active ? 1 : 0.5),
                backgroundColor: categories.map(() => `hsl(${Math.random() * 360}, 70%, 50%)`)
            }]
        },
        options: { responsive: true }
    });
}

function renderTransactionStatusChart(transactions) {
    const ctx = document.getElementById('rechargeChart').getContext('2d');
    if (window.rechargeChart) window.rechargeChart.destroy();
    window.rechargeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Success', 'Failed', 'Pending'],
            datasets: [{
                data: [
                    transactions.filter(t => t.status === 'SUCCESS').length,
                    transactions.filter(t => t.status === 'FAILED').length,
                    transactions.filter(t => t.status === 'PENDING').length
                ],
                backgroundColor: ['#28a745', '#dc3545', '#ffc107']
            }]
        },
        options: { responsive: true }
    });
}

async function filterTransactions() {
try {
const date = document.getElementById('date-filter').value;
const minAmount = document.getElementById('min-amount').value;
const maxAmount = document.getElementById('max-amount').value;
const status = document.getElementById('status-filter').value;

const params = new URLSearchParams();
if (date) params.append('date', date);
if (minAmount) params.append('minAmount', minAmount);
if (maxAmount) params.append('maxAmount', maxAmount);
if (status) params.append('status', status);

const url = `${API_BASE_URL}/transactions/filter?${params.toString()}`;
const transactions = await secureFetch(url);

renderTransactions(transactions);
} catch (error) {
console.error("Error filtering transactions:", error);
showToast("Failed to filter transactions", 'error');
}
}



async function showEmailModal(transactionId, userId) {
    document.getElementById('emailForm').reset();
    
    try {
        const user = await secureFetch(`${API_BASE_URL}/users/${userId}`);
        
        document.getElementById('emailRecipient').value = user.email || '';
        document.getElementById('emailMobile').value = user.mobile || '';
        
        document.getElementById('emailSubject').value = 'Your Transaction Details';
        
        document.getElementById('emailModal').style.display = 'block';
        
    } catch (error) {
        console.error("Error loading user details:", error);
        showToast("Failed to load user details", 'error');
        document.getElementById('emailModal').style.display = 'block';
    }
}

async function sendEmail() {
    const recipient = document.getElementById('emailRecipient').value;
    const mobile = document.getElementById('emailMobile').value;
    const subject = document.getElementById('emailSubject').value;
    const message = document.getElementById('emailMessage').value;

    if (!recipient || !mobile) {
        showToast('Recipient email and mobile are required', 'error');
        return;
    }

    try {
        const response = await secureFetch(`${API_BASE_URL}/transactions/send-remainder`, {
            method: 'POST',
            body: JSON.stringify({
                toEmail: recipient,
                mobileNumber: mobile,
                subject: subject,
                message: message
            })
        });

        showToast('Email sent successfully');
        closeModal('emailModal');
    } catch (error) {
        showToast(`Failed to send email: ${error.message}`, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {

document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    sendEmail();
});
});


window.showEmailModal = showEmailModal;
function renderUserGrowthChart(users) {
    const usersByMonth = users.reduce((acc, user) => {
        const month = new Date(user.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('userGrowthChart').getContext('2d');
    if (window.userGrowthChart) window.userGrowthChart.destroy();
    window.userGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(usersByMonth),
            datasets: [{
                label: 'New Users',
                data: Object.values(usersByMonth),
                borderColor: '#17a2b8',
                fill: true
            }]
        },
        options: { responsive: true }
    });
}

function updatePaginationControls(type) {
    const paginationDiv = document.getElementById(`${type}-pagination`);
    const currentPage = type === 'plans' ? currentPlanPage : currentCategoryPage;
    const totalPages = type === 'plans' ? totalPlanPages : totalCategoryPages;
    const loadFunction = type === 'plans' ? 'loadRechargePlans' : 'loadCategories';

    paginationDiv.innerHTML = `
        <button class="btn btn-sm ${currentPage <= 1 ? 'btn-secondary disabled' : 'btn-primary'}" 
            onclick="${loadFunction}(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>Previous</button>
        <span class="mx-2">Page ${currentPage} of ${totalPages}</span>
        <button class="btn btn-sm ${currentPage >= totalPages ? 'btn-secondary disabled' : 'btn-primary'}" 
            onclick="${loadFunction}(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
    `;
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showAddPlanModal() {
document.getElementById('planForm').reset();
document.getElementById('planId').value = '';
document.getElementById('planModalTitle').textContent = 'Add New Plan';

secureFetch(`${API_BASE_URL}/categories`)
.then(categories => {
    const categorySelect = document.getElementById('planCategory');
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.categoryId}">${cat.categoryName}</option>`
    ).join('');
    document.getElementById('planModal').style.display = 'block';
})
.catch(error => {
    showToast(`Failed to load categories: ${error.message}`, 'error');
});
}

function showAddCategoryModal() {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    document.getElementById('categoryModal').style.display = 'block';
}

async function loadRechargePlans(page = currentPlanPage) {
try {
const plans = await secureFetch(`${API_BASE_URL}/recharge-plans/admin/all`);
totalPlanPages = Math.ceil(plans.length / ITEMS_PER_PAGE);
currentPlanPage = page;
const start = (page - 1) * ITEMS_PER_PAGE;
const paginatedPlans = plans.slice(start, start + ITEMS_PER_PAGE);

const tbody = document.querySelector('#plans-table tbody');
tbody.innerHTML = paginatedPlans.map(plan => {
    const categoryName = plan.category ? 
        (plan.category.categoryName || 'No Category') : 
        'No Category';
    
    return `
        <tr>
            <td>${plan.planId}</td>
            <td>${plan.name}</td>
            <td>₹${plan.price.toFixed(2)}</td>
            <td>${plan.validityDays} days</td>
            <td>${plan.dataLimit} GB</td>
            <td>${categoryName}</td>
            <td><span class="badge ${plan.active ? 'bg-success' : 'bg-secondary'}">${plan.active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editPlan(${plan.planId})">Edit</button>
                <button class="btn btn-${plan.active ? 'danger' : 'success'} btn-sm" 
                    onclick="togglePlanStatus(${plan.planId}, ${!plan.active})">${plan.active ? 'Deactivate' : 'Activate'}</button>
                <button class="btn btn-danger btn-sm" onclick="softDeletePlan(${plan.planId})">Delete</button>
            </td>
        </tr>
    `;
}).join('');
updatePaginationControls('plans');
} catch (error) {
showToast(`Failed to load plans: ${error.message}`, 'error');
}
}
async function softDeletePlan(id) {
if (!id || id === 'null' || isNaN(id)) {
showToast('Invalid plan ID', 'error');
console.error('softDeletePlan: Invalid ID', id);
return;
}
if (confirm('Are you sure you want to delete this plan?')) {
try {
    await secureFetch(`${API_BASE_URL}/recharge-plans/${id}`, { method: 'DELETE' });
    showToast('Plan deleted successfully');
    loadRechargePlans();
} catch (error) {
    showToast(`Failed to delete plan: ${error.message}`, 'error');
}
}
}
async function editPlan(id) {
try {
const [plan, categories] = await Promise.all([
    secureFetch(`${API_BASE_URL}/recharge-plans/${id}`),
    secureFetch(`${API_BASE_URL}/categories`)
]);

document.getElementById('planId').value = plan.planId;
document.getElementById('planName').value = plan.name;
document.getElementById('planPrice').value = plan.price;
document.getElementById('planValidity').value = plan.validityDays;
document.getElementById('planData').value = plan.dataLimit;
document.getElementById('planDescription').value = plan.description || '';
document.getElementById('planActive').value = plan.active.toString();

const categorySelect = document.getElementById('planCategory');
categorySelect.innerHTML = categories.map(cat => 
    `<option value="${cat.categoryId}" ${plan.category?.categoryId === cat.categoryId ? 'selected' : ''}>
        ${cat.categoryName}
    </option>`
).join('');

document.getElementById('planModalTitle').textContent = 'Edit Plan';
document.getElementById('planModal').style.display = 'block';
} catch (error) {
showToast(`Failed to load plan details: ${error.message}`, 'error');
}
}

async function togglePlanStatus(id, active) {
if (!id || id === 'null' || isNaN(id)) {
showToast('Invalid plan ID', 'error');
console.error('togglePlanStatus: Invalid ID', id);
return;
}
try {
await secureFetch(`${API_BASE_URL}/recharge-plans/${id}/status?active=${active}`, { method: 'PATCH' });
showToast(`Plan ${active ? 'activated' : 'deactivated'} successfully`);
loadRechargePlans();
} catch (error) {
showToast(`Failed to update plan status: ${error.message}`, 'error');
}
}

async function loadAnalytics() {
    try {
        // Fetch all necessary data in parallel
        const [categories, plans, transactions, users] = await Promise.all([
            secureFetch(`${API_BASE_URL}/categories/analytics/stats`),
            secureFetch(`${API_BASE_URL}/recharge-plans/analytics/stats`),
            secureFetch(`${API_BASE_URL}/transactions`),
            secureFetch(`${API_BASE_URL}/users`)
        ]);

        // Update summary cards
        document.getElementById('total-revenue').textContent = `₹${plans.totalRevenue.toFixed(2)}`;
        document.getElementById('monthly-revenue').textContent = `₹${plans.monthlyRevenue.toFixed(2)}`;
        document.getElementById('total-users').textContent = users.length;
        document.getElementById('active-plans').textContent = `${plans.activePlans}/${plans.totalPlans}`;

        // Render charts
        renderCategoryDistributionChart(categories);
        renderPlanPopularityChart(plans.popularPlans);
        renderRevenueTrendChart(plans.revenueTrend);
        renderTransactionStatusChart(transactions);
        renderUserGrowthChart(users);
    } catch (error) {
        console.error("Error loading analytics:", error);
        showToast(`Failed to load analytics: ${error.message}`, 'error');
    }
}

function renderCategoryDistributionChart(categories) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (window.categoryChart) window.categoryChart.destroy();
    
    const labels = Object.keys(categories.planCountByCategory);
    const data = Object.values(categories.planCountByCategory);
    
    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#8AC24A', '#607D8B'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Plans by Category'
                }
            }
        }
    });
}

function renderPlanPopularityChart(popularPlans) {
    const ctx = document.getElementById('planPopularityChart').getContext('2d');
    if (window.planPopularityChart) window.planPopularityChart.destroy();
    
    const labels = popularPlans.map(plan => plan.name);
    const data = popularPlans.map(plan => plan.purchaseCount);
    
    window.planPopularityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Purchases',
                data: data,
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Most Popular Plans'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderRevenueTrendChart(revenueTrend) {
    const ctx = document.getElementById('revenueTrendChart').getContext('2d');
    if (window.revenueTrendChart) window.revenueTrendChart.destroy();
    
    const labels = revenueTrend.map(item => item.date);
    const data = revenueTrend.map(item => item.revenue);
    
    window.revenueTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (₹)',
                data: data,
                borderColor: '#4BC0C0',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderTransactionStatusChart(transactions) {
    const ctx = document.getElementById('transactionStatusChart').getContext('2d');
    if (window.transactionStatusChart) window.transactionStatusChart.destroy();
    
    const successCount = transactions.filter(t => t.status === 'SUCCESS').length;
    const failedCount = transactions.filter(t => t.status === 'FAILED').length;
    const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
    
    window.transactionStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Success', 'Failed', 'Pending'],
            datasets: [{
                data: [successCount, failedCount, pendingCount],
                backgroundColor: [
                    '#28a745', '#dc3545', '#ffc107'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Transaction Status'
                }
            }
        }
    });
}

function applyDateFilter() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
    }
    
    loadAnalyticsWithDateRange(startDate, endDate);
}

async function loadAnalyticsWithDateRange(startDate, endDate) {
    try {
        const [categories, plans] = await Promise.all([
            secureFetch(`${API_BASE_URL}/categories/analytics/revenue-trend?startDate=${startDate}&endDate=${endDate}`),
            secureFetch(`${API_BASE_URL}/recharge-plans/analytics/revenue-trend?startDate=${startDate}&endDate=${endDate}`)
        ]);
        
        renderRevenueTrendChart(plans);
        // Update other charts as needed
    } catch (error) {
        console.error("Error loading filtered analytics:", error);
        showToast(`Failed to load filtered analytics: ${error.message}`, 'error');
    }
}

function resetDateFilter() {
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    loadAnalytics();
}

async function downloadReport(format) {
    try {
        const startDate = document.getElementById('start-date').value || '';
        const endDate = document.getElementById('end-date').value || '';
        
        let url = `${API_BASE_URL}/analytics/report?format=${format}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        
        // For PDF download
        if (format === 'pdf') {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate report');
            }
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
            
            showToast('PDF report downloaded successfully');
        } else {
            // For CSV download
            window.open(url, '_blank');
        }
    } catch (error) {
        console.error("Error downloading report:", error);
        showToast(`Failed to download report: ${error.message}`, 'error');
    }
}

window.showEmailModal = showEmailModal;
window.sendEmail = sendEmail;
window.loadTabData = loadTabData;
window.showAddPlanModal = showAddPlanModal;
window.editPlan = editPlan;
window.togglePlanStatus = togglePlanStatus;
window.softDeletePlan = softDeletePlan;
window.showAddCategoryModal = showAddCategoryModal;
window.editCategory = editCategory;
window.toggleCategoryStatus = toggleCategoryStatus;
window.softDeleteCategory = softDeleteCategory;
window.approveKYC = approveKYC;
window.viewKYCDetails = viewKYCDetails;
window.softDeleteTransaction = softDeleteTransaction;
window.deleteUser = deleteUser;
window.viewUser = viewUser;
window.closeModal = closeModal;
window.logout = logout;
window.filterTransactions = filterTransactions;
window.viewPaymentDetails = viewPaymentDetails;

// Add these to the window object at the bottom of the file
window.applyDateFilter = applyDateFilter;
window.resetDateFilter = resetDateFilter;
window.downloadReport = downloadReport;