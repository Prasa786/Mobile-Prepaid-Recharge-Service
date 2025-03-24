
// Initialize Chart.js for Data Usage
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

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data from localStorage
        localStorage.removeItem('userPhone');
        localStorage.removeItem('userName');
        localStorage.removeItem('email');
        localStorage.removeItem('alternatePhone');
        localStorage.removeItem('address');

        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Update User Info on Page Load
document.addEventListener('DOMContentLoaded', function () {
    // Retrieve user data from localStorage (or set default values)
    const userName = localStorage.getItem('userName') || 'User';
    const userPhone = localStorage.getItem('userPhone') || '(Prepaid)';

    // Display user data in the navbar and welcome section
    document.getElementById('userName').textContent = userName;
    document.getElementById('userPhone').textContent = userPhone;
    document.getElementById('userNameDisplay').textContent = userName;
    document.getElementById('userPhoneDisplay').textContent = userPhone;
});

// Function to load user profile data into the modal
function loadUserProfile() {
    // Retrieve user data from localStorage (or set default values)
    const userProfile = {
        fullName: localStorage.getItem('fullName') || 'John Doe',
        email: localStorage.getItem('email') || 'prasanna786@gmail.com',
        alternatePhone: localStorage.getItem('alternatePhone') || '',
        address: localStorage.getItem('address') || ''
    };

    // Populate the modal fields with user data
    document.getElementById('fullName').value = userProfile.fullName;
    document.getElementById('email').value = userProfile.email;
    document.getElementById('alternatePhone').value = userProfile.alternatePhone;
    document.getElementById('address').value = userProfile.address;
}

// Function to save user profile data
function saveUserProfile() {
    // Get updated values from the modal
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const alternatePhone = document.getElementById('alternatePhone').value;
    const address = document.getElementById('address').value;

    // Save updated data to localStorage
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('email', email);
    localStorage.setItem('alternatePhone', alternatePhone);
    localStorage.setItem('address', address);

    // Update the displayed user info
    document.getElementById('userName').textContent = fullName;
    document.getElementById('userNameDisplay').textContent = fullName;

    // Close the modal
    const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
    profileModal.hide();

    // Notify the user
    alert('Profile updated successfully!');
}

// Load user profile data when the modal is shown
document.getElementById('profileModal').addEventListener('show.bs.modal', loadUserProfile);
// Sample transaction data (in a real application, this would come from a backend)
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

// Function to load recent transactions
function loadRecentTransactions() {
const transactionsTable = document.getElementById('transactionsTable');
let transactions = JSON.parse(localStorage.getItem('userTransactions')) || sampleTransactions;

// Limit to 3 most recent transactions
transactions = transactions.slice(0, 3);

transactionsTable.innerHTML = ''; // Clear existing rows

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

// Function to add a new transaction
function addTransaction(type, description, amount, status = "Completed") {
const newTransaction = {
date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
type,
description,
amount,
status
};

let transactions = JSON.parse(localStorage.getItem('userTransactions')) || sampleTransactions;
transactions.unshift(newTransaction); // Add to beginning of array
localStorage.setItem('userTransactions', JSON.stringify(transactions));
loadRecentTransactions(); // Refresh the display
}

// Load transactions when page loads
document.addEventListener('DOMContentLoaded', function() {
loadRecentTransactions();

// Example: Add a new transaction (you can call this when a recharge is made)
// addTransaction("Recharge", "Unlimited Calls + 2GB/day (28 days)", "₹245");
});
