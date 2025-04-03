
const dataUsageCtx = document.getElementById('dataUsageChart').getContext('2d');
const dataUsageChart = new Chart(dataUsageCtx, {
    type: 'line',
    data: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        datasets: [{
            label: 'Data Usage (GB)',
            data: [0.5, 1.2, 1.8, 1.5, 1.9, 2.0, 1.7],
            borderColor: '#0d6efd',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(13, 110, 253, 0.1)'
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 2.5
            }
        }
    }
});

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userPhone');
        localStorage.removeItem('userName');
        localStorage.removeItem('email');
        localStorage.removeItem('alternatePhone');
        localStorage.removeItem('address');

        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const userName = localStorage.getItem('userName') || 'User';
    const userPhone = localStorage.getItem('userPhone') || '(Prepaid)';

    document.getElementById('userName').textContent = userName;
    document.getElementById('userPhone').textContent = userPhone;
    document.getElementById('userNameDisplay').textContent = userName;
    document.getElementById('userPhoneDisplay').textContent = userPhone;
});

function loadUserProfile() {
    const userProfile = {
        fullName: localStorage.getItem('fullName') || 'John Doe',
        email: localStorage.getItem('email') || 'prasanna786@gmail.com',
        alternatePhone: localStorage.getItem('alternatePhone') || '',
        address: localStorage.getItem('address') || ''
    };

    document.getElementById('fullName').value = userProfile.fullName;
    document.getElementById('email').value = userProfile.email;
    document.getElementById('alternatePhone').value = userProfile.alternatePhone;
    document.getElementById('address').value = userProfile.address;
}

function saveUserProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const alternatePhone = document.getElementById('alternatePhone').value;
    const address = document.getElementById('address').value;

    localStorage.setItem('fullName', fullName);
    localStorage.setItem('email', email);
    localStorage.setItem('alternatePhone', alternatePhone);
    localStorage.setItem('address', address);

    document.getElementById('userName').textContent = fullName;
    document.getElementById('userNameDisplay').textContent = fullName;

    const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
    profileModal.hide();

    alert('Profile updated successfully!');
}

document.getElementById('profileModal').addEventListener('show.bs.modal', loadUserProfile);
const sampleTransactions = [
{
date: "2025-02-25",
type: "Recharge",
description: "Unlimited Calls + 2GB/day (28 days)",
amount: "₹245",
status: "Completed"
},
{
date: "2025-02-20",
type: "Add-on",
description: "Weekend Data Pack (10GB)",
amount: "₹99",
status: "Completed"
},
{
date: "2025-02-15",
type: "Recharge",
description: "OTT Add-on (30 days)",
amount: "₹199",
status: "Completed"
}
];

function loadRecentTransactions() {
const transactionsTable = document.getElementById('transactionsTable');
let transactions = JSON.parse(localStorage.getItem('userTransactions')) || sampleTransactions;

transactions = transactions.slice(0, 3);

transactionsTable.innerHTML = '';

transactions.forEach(transaction => {
const row = document.createElement('tr');
row.innerHTML = `
    <td>${transaction.date}</td>
    <td>${transaction.type}</td>
    <td>${transaction.description}</td>
    <td>${transaction.amount}</td>
    <td><span class="badge bg-${transaction.status === 'Completed' ? 'success' : 'warning'}">${transaction.status}</span></td>
`;
transactionsTable.appendChild(row);
});
}

function addTransaction(type, description, amount, status = "Completed") {
const newTransaction = {
date: new Date().toISOString().split('T')[0],
type,
description,
amount,
status
};

let transactions = JSON.parse(localStorage.getItem('userTransactions')) || sampleTransactions;
transactions.unshift(newTransaction);
localStorage.setItem('userTransactions', JSON.stringify(transactions));
loadRecentTransactions();
}

document.addEventListener('DOMContentLoaded', function() {
loadRecentTransactions();

});
const API_BASE_URL = 'http://localhost:8083/api';
const CURRENT_USER_ID = 1;

async function fetchUserPlans() {
    try {
        const response = await fetch(`${API_BASE_URL}/user-plans/user/${CURRENT_USER_ID}`);
        if (!response.ok) throw new Error('Failed to fetch plans');
        const plans = await response.json();
        updateActivePlansUI(plans);
    } catch (error) {
        console.error('Error fetching user plans:', error);
    }
}

async function fetchUserUsage() {
    try {
        const response = await fetch(`${API_BASE_URL}/user-usage/user/${CURRENT_USER_ID}`);
        if (!response.ok) throw new Error('Failed to fetch usage');
        const usage = await response.json();
        updateUsageUI(usage);
    } catch (error) {
        console.error('Error fetching user usage:', error);
    }
}

function updateActivePlansUI(plans) {
    const activePlansContainer = document.querySelector('#activePlansRow');
    if (!activePlansContainer) return;

    const activePlans = plans.filter(plan => plan.isActive);
    activePlansContainer.innerHTML = '';

    activePlans.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = 'col-md-4';
        planCard.innerHTML = `
            <div class="card p-3">
                <h6>${plan.plan?.planName || 'Plan'}</h6>
                <p>Validity: ${plan.plan?.validityDays || 'N/A'} Days</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-success">Active</span>
                    <small>Expires: ${new Date(plan.endDate).toLocaleDateString()}</small>
                </div>
            </div>
        `;
        activePlansContainer.appendChild(planCard);
    });
}

function updateUsageUI(usageData) {
    const dataUsage = usageData.filter(u => u.usageType === 'data').reduce((sum, u) => sum + u.usageValue, 0);
    const dataPercentage = Math.min(100, (dataUsage/2048)*100);
    
    document.querySelector('.data-usage-progress').style.width = `${dataPercentage}%`;
    document.querySelector('.data-usage-progress').textContent = `${Math.round(dataPercentage)}%`;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('userName').textContent = "Prasanna";
    document.getElementById('userPhone').textContent = "+918608737228";
    document.getElementById('userNameDisplay').textContent = "Prasanna";
    document.getElementById('userPhoneDisplay').textContent = "+918608737228";

    fetchUserPlans();
    fetchUserUsage();
    
    loadRecentTransactions();
});