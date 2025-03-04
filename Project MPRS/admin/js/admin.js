// Enhanced admin.js with additional features
// Data Arrays with Indian Recharge Plans
let expiringPlans = [
    { mobile: "9876543210", plan: "₹239 Plan", expiry: "01/03/2025", amount: "₹239" },
    { mobile: "9876543211", plan: "₹299 Plan", expiry: "02/03/2025", amount: "₹299" },
    { mobile: "8790765416", plan: "₹479 Plan", expiry: "03/03/2025", amount: "₹479" }
];

let rechargePlans = [
    { name: "₹239 Plan", price: "₹239", validity: "28 Days", data: "1.5GB/Day" },
    { name: "₹299 Plan", price: "₹299", validity: "28 Days", data: "2GB/Day" },
    { name: "₹479 Plan", price: "₹479", validity: "56 Days", data: "1.5GB/Day" }
];

let transactions = [
    { id: "TRX-2851", user: "Prasanna", plan: "₹239 Plan", date: "25/02/2025", amount: "₹239", method: "UPI", status: "Success" },
    { id: "TRX-2850", user: "Partha ", plan: "₹299 Plan", date: "24/02/2025", amount: "₹299", method: "Credit Card", status: "Failed" },
    { id: "TRX-2849", user: "Robert downey jr", plan: "₹479 Plan", date: "23/02/2025", amount: "₹479", method: "Debit Card", status: "Pending" }
];

const supportTickets = [
    { id: "T123", user: "Prasanna", issue: "Recharge Failed", status: "Open" },
    { id: "T124", user: "Parthiban", issue: "Plan Not Activated", status: "Resolved" }
];

const feedbackReports = [
    { user: "Billa Pandi", feedback: "Great service!", date: "25/02/2025", rating: "5" },
    { user: "Paramasivan", feedback: "Need more plans.", date: "24/02/2025", rating: "3" },
    { user: "Ramasamy", feedback: "Need more plans.", date: "01/01/2025", rating: "3" }
];

const inactiveNumbersData = [
    { number: '9876543210', lastRecharge: '25/11/2024', days: 92, name: 'Praveen R V' },
    { number: '8765432109', lastRecharge: '20/11/2024', days: 97, name: 'Panjavan Parivendhan' }
];

// SPA Routes
const routes = {
    'analytics': `
        <section id="analytics" class="admin-section active">
            <h2>Analytics</h2>
            <div class="analytics-cards">
                <div class="card">
                    <h3>Total Subscribers</h3>
                    <p id="totalSubscribers">1,234</p>
                </div>
                <div class="card">
                    <h3>Active Plans</h3>
                    <p id="activePlans">789</p>
                </div>
                <div class="card">
                    <h3>Revenue (This Month)</h3>
                    <p id="monthlyRevenue">₹1,23,456</p>
                </div>
                <div class="card">
                    <h3>Inactive Numbers</h3>
                    <p id="inactiveNumbers">${inactiveNumbersData.length}</p>
                </div>
            </div>
            <div class="action-buttons mt-3">
                <button class="btn-primary" onclick="downloadInvoice()"><i class="fas fa-file-pdf"></i> Download Invoice (PDF)</button>
                <button class="btn-secondary" onclick="downloadAnalyticsReport()"><i class="fas fa-chart-line"></i> Analytics Report</button>
            </div>
        </section>
    `,
    'expiring-plans': `
        <section id="expiring-plans" class="admin-section active">
            <h2>Subscribers with Expiring Plans (Next 3 Days)</h2>
            <div class="section-controls mb-3">
                <button class="btn-primary" onclick="sendReminderToAll()"><i class="fas fa-bell"></i> Notify All</button>
                <button class="btn-secondary" onclick="exportExpiringPlans()"><i class="fas fa-file-export"></i> Export</button>
            </div>
            <div class="table-responsive">
                <table id="expiringPlansTable">
                    <thead>
                        <tr>
                            <th>Mobile Number</th>
                            <th>Current Plan</th>
                            <th>Expiry Date</th>
                            <th>Last Recharge Amount</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'inactive-numbers': `
        <section id="inactive-numbers" class="admin-section active">
            <h2>Inactive Numbers (No Recharge for 3+ Months)</h2>
            <div class="section-controls">
                <button id="deactivateAllBtn" class="btn-danger"><i class="fas fa-ban"></i> Deactivate All Selected</button>
                <button id="notifyAllBtn" class="btn-warning"><i class="fas fa-bell"></i> Notify All Selected</button>
                <button class="btn-secondary" onclick="exportInactiveNumbers()"><i class="fas fa-file-export"></i> Export List</button>
            </div>
            <div class="table-responsive">
                <table id="inactiveNumbersTable">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="selectAll"></th>
                            <th>Mobile Number</th>
                            <th>Last Recharge Date</th>
                            <th>Inactive Days</th>
                            <th>Customer Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'recharge-plans': `
        <section id="recharge-plans" class="admin-section active">
            <h2>Manage Recharge Plans</h2>
            <div class="section-controls mb-3">
                <button id="addPlanBtn" class="btn-primary" onclick="showAddPlanModal()"><i class="fas fa-plus"></i> Add New Plan</button>
                <button class="btn-secondary" onclick="exportPlans()"><i class="fas fa-file-export"></i> Export Plans</button>
            </div>
            <div class="table-responsive">
                <table id="rechargePlansTable">
                    <thead>
                        <tr>
                            <th>Plan Name</th>
                            <th>Price</th>
                            <th>Validity</th>
                            <th>Data</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'transaction-history': `
        <section id="transaction-history" class="admin-section active">
            <h2>Transaction History</h2>
            <div class="filters">
                <input type="date" id="filterDate" placeholder="Filter by Date">
                <input type="number" id="filterAmount" placeholder="Filter by Amount">
                <select id="filterPaymentMethod">
                    <option value="">All Payment Methods</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                </select>
                <button id="applyFiltersBtn" class="btn-primary" onclick="applyTransactionHistoryFilters()">Apply Filters</button>
                <button id="exportTransactionsBtn" class="btn-secondary" onclick="exportTransactions()"><i class="fas fa-file-export"></i> Export</button>
            </div>
            <div class="table-responsive">
                <table id="transactionHistoryTable">
                    <thead>
                        <tr>
                            <th>Plan Name</th>
                            <th>Recharge Date</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'notifications': `
        <section id="notifications" class="admin-section active">
            <h2>Send Notifications</h2>
            <div class="notification-options">
                <select id="notificationType">
                    <option value="all">All Users</option>
                    <option value="expiring">Users with Expiring Plans</option>
                    <option value="inactive">Inactive Users</option>
                    <option value="custom">Custom User Group</option>
                </select>
                <div id="customUserGroup" style="display: none;">
                    <input type="text" id="customUserInput" placeholder="Enter mobile numbers separated by commas">
                </div>
            </div>
            <form id="notificationForm" onsubmit="sendNotification(event)">
                <div class="mb-3">
                    <label for="notificationTitle" class="form-label">Notification Title</label>
                    <input type="text" id="notificationTitle" class="form-control" placeholder="Enter notification title" required>
                </div>
                <div class="mb-3">
                    <label for="notificationMessage" class="form-label">Message</label>
                    <textarea id="notificationMessage" class="form-control" placeholder="Enter your message..." rows="4" required></textarea>
                </div>
                <div class="notification-controls">
                    <select id="notificationPriority">
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <button type="submit" class="btn-primary"><i class="fas fa-paper-plane"></i> Send Notification</button>
                    <button type="button" class="btn-secondary" onclick="saveNotificationTemplate()"><i class="fas fa-save"></i> Save as Template</button>
                </div>
            </form>
            <div class="notification-templates mt-4">
                <h3>Saved Templates</h3>
                <div class="template-list" id="templateList">
                    <div class="template-item">
                        <h4>Recharge Reminder</h4>
                        <p>Your plan is expiring soon. Recharge now to continue enjoying our services!</p>
                        <button class="btn-sm btn-primary" onclick="loadTemplate('Recharge Reminder', 'Your plan is expiring soon. Recharge now to continue enjoying our services!')"><i class="fas fa-edit"></i> Use</button>
                    </div>
                </div>
            </div>
        </section>
    `,
    'support-tickets': `
        <section id="support-tickets" class="admin-section active">
            <h2>Customer Support Tickets</h2>
            <div class="section-controls mb-3">
                <select id="ticketStatusFilter" class="form-select" onchange="filterTickets()">
                    <option value="all">All Tickets</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <button class="btn-secondary" onclick="exportTickets()"><i class="fas fa-file-export"></i> Export Tickets</button>
            </div>
            <div class="table-responsive">
                <table id="supportTicketsTable">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>User Name</th>
                            <th>Issue</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'feedback-reports': `
        <section id="feedback-reports" class="admin-section active">
            <h2>User Feedback Reports</h2>
            <div class="section-controls mb-3">
                <button class="btn-secondary" onclick="exportFeedback()"><i class="fas fa-file-export"></i> Export Feedback</button>
                <button class="btn-primary" onclick="generateFeedbackAnalysis()"><i class="fas fa-chart-pie"></i> Generate Analysis</button>
            </div>
            <div class="table-responsive">
                <table id="feedbackReportsTable">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Feedback</th>
                            <th>Date</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'admin-settings': `
        <section id="admin-settings" class="admin-section active">
            <h2>Admin Settings</h2>
            <div class="settings-container">
                <div class="settings-card">
                    <h3>Profile Settings</h3>
                    <form id="profileSettingsForm" onsubmit="saveProfileSettings(event)">
                        <div class="form-group">
                            <label for="adminUsername">Username</label>
                            <input type="text" id="adminUsername" value="admin" required>
                        </div>
                        <div class="form-group">
                            <label for="adminEmail">Email</label>
                            <input type="email" id="adminEmail" value="admin@voltmobi.com" required>
                        </div>
                        <div class="form-group">
                            <label for="adminPhone">Phone</label>
                            <input type="tel" id="adminPhone" value="+919876543210">
                        </div>
                        <button type="submit" class="btn-primary">Save Changes</button>
                    </form>
                </div>
                <div class="settings-card">
                    <h3>Security Settings</h3>
                    <form id="securitySettingsForm" onsubmit="changePassword(event)">
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <input type="password" id="newPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                        <button type="submit" class="btn-primary">Change Password</button>
                    </form>
                </div>
                <div class="settings-card">
                    <h3>Notification Settings</h3>
                    <form id="notificationSettingsForm" onsubmit="saveNotificationSettings(event)">
                        <div class="form-check">
                            <input type="checkbox" id="emailNotifications" class="form-check-input" checked>
                            <label for="emailNotifications" class="form-check-label">Email Notifications</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" id="smsNotifications" class="form-check-input" checked>
                            <label for="smsNotifications" class="form-check-label">SMS Notifications</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" id="loginAlerts" class="form-check-input" checked>
                            <label for="loginAlerts" class="form-check-label">Login Alerts</label>
                        </div>
                        <button type="submit" class="btn-primary">Save Settings</button>
                    </form>
                </div>
            </div>
        </section>
    `,
    'plans': `
        <section id="plans" class="admin-section active">
            <h2>Subscription Plans</h2>
            <div class="section-controls mb-3">
                <button class="btn-primary" onclick="showAddPlanModal()"><i class="fas fa-plus"></i> Add New Plan</button>
                <button class="btn-secondary" onclick="exportPlans()"><i class="fas fa-file-export"></i> Export Plans</button>
                <button class="btn-info" onclick="showImportPlansModal()"><i class="fas fa-file-import"></i> Import Plans</button>
            </div>
            <div class="table-responsive">
                <table id="plansTable">
                    <thead>
                        <tr>
                            <th>Plan Name</th>
                            <th>Price</th>
                            <th>Validity</th>
                            <th>Data</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'transactions': `
        <section id="transactions" class="admin-section active">
            <h2>Transactions</h2>
            <div class="section-controls mb-3">
                <button class="btn-primary" onclick="showFilterTransactionsModal()"><i class="fas fa-filter"></i> Filter Transactions</button>
                <button class="btn-secondary" onclick="exportTransactions()"><i class="fas fa-file-export"></i> Export</button>
                <button class="btn-success" onclick="showInvoiceGenerationModal()"><i class="fas fa-file-invoice"></i> Generate Invoice</button>
            </div>
            <div class="table-responsive">
                <table id="transactionsTable">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>User</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    `,
    'reports': `
        <section id="reports" class="admin-section active">
            <h2>Reports</h2>
            <div class="section-controls mb-3">
                <button class="btn-primary" onclick="showGenerateReportModal()"><i class="fas fa-chart-bar"></i> Generate Report</button>
                <button class="btn-secondary" onclick="showScheduleReportModal()"><i class="fas fa-calendar-alt"></i> Schedule Report</button>
            </div>
            <div class="row mt-3">
                <div class="col-md-6 col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">User Growth</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="userGrowthChart" height="200"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Revenue Breakdown</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="revenueBreakdownChart" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="Analytical-Sections mt-4">
                <h2>Customer Trend Analytics Dashboard</h2>
                <canvas id="Analysis"></canvas>
            </div>
            <div class="saved-reports mt-4">
                <h3>Saved Reports</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Report Name</th>
                                <th>Type</th>
                                <th>Created Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>February 2025 Revenue</td>
                                <td>Revenue Report</td>
                                <td>01/03/2025</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="viewReport('February 2025 Revenue')">View</button>
                                    <button class="btn btn-sm btn-secondary" onclick="downloadSavedReport('February 2025 Revenue')">Download</button>
                                </td>
                            </tr>
                            <tr>
                                <td>Q1 2025 User Analysis</td>
                                <td>User Growth</td>
                                <td>01/03/2025</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="viewReport('Q1 2025 User Analysis')">View</button>
                                    <button class="btn btn-sm btn-secondary" onclick="downloadSavedReport('Q1 2025 User Analysis')">Download</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    `
};

// Router Function
function navigateTo(route) {
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <button class="hamburger" onclick="toggleSidebar()"><i class="fas fa-bars"></i></button>
        <header class="content-header">
            <h2>Admin Dashboard</h2>
            <div class="header-controls"  style="display: flex;background-color: #0C1D13; border-radius:10px;">
                <div class="admin-dropdown">
                    <img src="/Project MPRS/img/user_profile.png" alt="admin" >
                    <div class="dropdown-content">
                        <a onclick="navigateTo('admin-profile')">My Profile</a>
                        <a onclick="navigateTo('admin-settings')">Settings</a>
                        <a onclick="logout()">Logout</a>
                    </div>
                </div>
            </div>
        </header>
        ${routes[route] || routes['analytics']}
    `;
    window.location.hash = route;

    // Update active link
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-route') === route);
    });

    // Re-initialize content-specific logic
    initializeContent(route);

    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
        document.querySelector('.main-content').classList.remove('sidebar-open');
    }
}

// Populate Table Function
function populateTable(tableId, data, columns, actions = null) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    data.forEach((item, index) => {
        const row = document.createElement("tr");
        columns.forEach(col => {
            const cell = document.createElement("td");
            cell.textContent = item[col] || "";
            row.appendChild(cell);
        });
        if (actions) {
            const actionCell = document.createElement("td");
            actionCell.innerHTML = actions(index);
            row.appendChild(actionCell);
        }
        tbody.appendChild(row);
    });
}

// Add New Plan
function addNewPlan() {
    const name = document.getElementById("planName").value;
    const price = "₹" + document.getElementById("planPrice").value;
    const validity = document.getElementById("planValidity").value + " Days";
    const data = document.getElementById("planData").value;

    const newPlan = { name, price, validity, data };
    rechargePlans.push(newPlan);
    populateRechargePlansTable();

    document.getElementById("addPlanForm").reset();
    bootstrap.Modal.getInstance(document.getElementById("addPlanModal")).hide();
    showToast("Success", "Plan added successfully!");
}

// Edit Plan
function editPlan(index) {
    showEditPlanModal(index);
}

// Delete Plan
function deletePlan(index) {
    if (confirm("Are you sure you want to delete this plan?")) {
        rechargePlans.splice(index, 1);
        populateRechargePlansTable();
        showToast("Success", "Plan deleted successfully!");
    }
}

// Populate Recharge Plans Table
function populateRechargePlansTable() {
    populateTable("rechargePlansTable", rechargePlans, ["name", "price", "validity", "data"], 
        (index) => `
            <button class="btn btn-outline-primary btn-sm" onclick="editPlan(${index})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="deletePlan(${index})"><i class="fas fa-trash"></i></button>
            <button class="btn btn-outline-success btn-sm" onclick="viewPlanStats(${index})"><i class="fas fa-chart-line"></i></button>
        `
    );
    populateTable("plansTable", rechargePlans, ["name", "price", "validity", "data"], 
        (index) => `
            <button class="btn btn-outline-primary btn-sm" onclick="editPlan(${index})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-outline-danger btn-sm" onclick="deletePlan(${index})"><i class="fas fa-trash"></i></button>
            <button class="btn btn-outline-success btn-sm" onclick="viewPlanStats(${index})"><i class="fas fa-chart-line"></i></button>
        `
    );
}

// View Plan Statistics
function viewPlanStats(index) {
    const plan = rechargePlans[index];
    const template = `
        <div class="modal fade" id="planStatsModal" tabindex="-1" aria-labelledby="planStatsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="planStatsModalLabel">Plan Statistics: ${plan.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">Active Subscribers</div>
                                    <div class="card-body">
                                        <h3 class="text-center">384</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">Monthly Revenue</div>
                                    <div class="card-body">
                                        <h3 class="text-center">₹${parseInt(plan.price.replace('₹', '')) * 384}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <canvas id="planUsageChart" height="200"></canvas>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="downloadPlanReport('${plan.name}')">Download Report</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', template);
    const modal = new bootstrap.Modal(document.getElementById('planStatsModal'));
    modal.show();
    
    document.getElementById('planStatsModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('planStatsModal').remove();
    }, { once: true });
    
    // Initialize chart
    setTimeout(() => {
        const ctx = document.getElementById('planUsageChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Subscribers',
                    data: [250, 290, 320, 350, 370, 384],
                    backgroundColor: 'rgba(97, 122, 85, 0.2)',
                    borderColor: '#617A55',
                    borderWidth: 2,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Subscribers'
                        }
                    }
                }
            }
        });
    }, 300);
}

// Download Plan Report
function downloadPlanReport(planName) {
    const content = `
        VoltMobi - Plan Report
        
        Plan: ${planName}
        Date: ${new Date().toLocaleDateString('en-IN')}
        
        Statistics:
        - Active Subscribers: 384
        - Monthly Revenue: ₹${parseInt(rechargePlans.find(p => p.name === planName).price.replace('₹', '')) * 384}
        - Average Daily Data Usage: 1.2GB
        
        Monthly Growth:
        - Jan: 250 subscribers
        - Feb: 290 subscribers
        - Mar: 320 subscribers
        - Apr: 350 subscribers
        - May: 370 subscribers
        - Jun: 384 subscribers
        
        Generated on: ${new Date().toLocaleString('en-IN')}
    `;
    
    generatePDF(content, `${planName.replace(/\s+/g, '_')}_Report.pdf`);
    showToast("Success", "Report downloaded successfully!");
}

// Generate PDF function using jsPDF-like syntax
function generatePDF(content, filename) {
    const blob = new Blob([content], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Show Toast Notification
function showToast(title, message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${title}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    setTimeout(() => toast.remove(), 5000);
}

// Initialize Content-Specific Logic
function initializeContent(route) {
    switch (route) {
        case 'recharge-plans':
        case 'plans':
            populateRechargePlansTable();
            break;
        case 'expiring-plans':
            populateTable("expiringPlansTable", expiringPlans, ["mobile", "plan", "expiry", "amount"], 
                (index) => `<button class="btn btn-outline-primary btn-sm" onclick="sendReminder('${expiringPlans[index].mobile}')"><i class="fas fa-bell"></i> Notify</button>`
            );
            break;
        case 'inactive-numbers':
            populateTable("inactiveNumbersTable", inactiveNumbersData, ["number", "lastRecharge", "days", "name"], 
                (index) => `
                    <button class="btn btn-outline-warning btn-sm" onclick="notifyInactiveUser('${inactiveNumbersData[index].number}')"><i class="fas fa-bell"></i> Notify</button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deactivateNumber('${inactiveNumbersData[index].number}')"><i class="fas fa-ban"></i> Deactivate</button>
                `
            );
            break;
        case 'transaction-history':
        case 'transactions':
            populateTable("transactionHistoryTable", transactions, ["id", "user", "plan", "date", "amount", "method", "status"], 
                (index) => `<button class="btn btn-outline-info btn-sm" onclick="viewTransactionDetails('${transactions[index].id}')"><i class="fas fa-eye"></i> View</button>`
            );
            break;
        case 'support-tickets':
            populateTable("supportTicketsTable", supportTickets, ["id", "user", "issue", "status"], 
                (index) => `<button class="btn btn-outline-primary btn-sm" onclick="viewTicketDetails('${supportTickets[index].id}')"><i class="fas fa-eye"></i> View</button>`
            );
            break;
        case 'feedback-reports':
            populateTable("feedbackReportsTable", feedbackReports, ["user", "feedback", "date", "rating"], 
                (index) => `<button class="btn btn-outline-info btn-sm" onclick="viewFeedbackDetails('${feedbackReports[index].user}')"><i class="fas fa-eye"></i> View</button>`
            );
            break;
        case 'reports':
            initializeCharts();
            break;
    }
}

// Initialize Charts for Reports
function initializeCharts() {
    const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
    new Chart(userGrowthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'User Growth',
                data: [1000, 1200, 1500, 1700, 2000, 2300],
                backgroundColor: 'rgba(97, 122, 85, 0.2)',
                borderColor: '#617A55',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Users'
                    }
                }
            }
        }
    });

    const revenueBreakdownCtx = document.getElementById('revenueBreakdownChart').getContext('2d');
    new Chart(revenueBreakdownCtx, {
        type: 'pie',
        data: {
            labels: ['₹239 Plan', '₹299 Plan', '₹479 Plan'],
            datasets: [{
                label: 'Revenue Breakdown',
                data: [50000, 70000, 90000],
                backgroundColor: ['#617A55', '#8AA67A', '#B3D2A5']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Send Reminder to User
function sendReminder(mobile) {
    showToast("Success", `Reminder sent to ${mobile}`);
}

// Notify Inactive User
function notifyInactiveUser(mobile) {
    showToast("Success", `Notification sent to inactive user ${mobile}`);
}

// Deactivate Number
function deactivateNumber(mobile) {
    if (confirm(`Are you sure you want to deactivate ${mobile}?`)) {
        showToast("Success", `Number ${mobile} deactivated`);
    }
}

// View Transaction Details
function viewTransactionDetails(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        alert(`Transaction Details:\nID: ${transaction.id}\nUser: ${transaction.user}\nPlan: ${transaction.plan}\nDate: ${transaction.date}\nAmount: ${transaction.amount}\nMethod: ${transaction.method}\nStatus: ${transaction.status}`);
    }
}

// View Ticket Details
function viewTicketDetails(id) {
    const ticket = supportTickets.find(t => t.id === id);
    if (ticket) {
        alert(`Ticket Details:\nID: ${ticket.id}\nUser: ${ticket.user}\nIssue: ${ticket.issue}\nStatus: ${ticket.status}`);
    }
}

// View Feedback Details
function viewFeedbackDetails(user) {
    const feedback = feedbackReports.find(f => f.user === user);
    if (feedback) {
        alert(`Feedback Details:\nUser: ${feedback.user}\nFeedback: ${feedback.feedback}\nDate: ${feedback.date}\nRating: ${feedback.rating}`);
    }
}

// Logout Function
function logout() {
    window.location.href = "/login";
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('sidebar-open');
}

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
    navigateTo(window.location.hash.substring(1) || 'analytics');
});