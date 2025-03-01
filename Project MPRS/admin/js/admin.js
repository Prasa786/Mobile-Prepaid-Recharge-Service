
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
                    <button class="btn-primary mt-3" onclick="downloadInvoice()">Download Invoice</button>
                   
                  
                    
                </section>
            `,
            'expiring-plans': `
                <section id="expiring-plans" class="admin-section active">
                    <h2>Subscribers with Expiring Plans (Next 3 Days)</h2>
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
                        <button id="deactivateAllBtn" class="btn-danger">Deactivate All Selected</button>
                        <button id="notifyAllBtn" class="btn-warning">Notify All Selected</button>
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
                    <button id="addPlanBtn" class="btn-primary" onclick="showAddPlanModal()">Add New Plan</button>
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
                        <textarea id="notificationMessage" placeholder="Enter your message..." required></textarea>
                        <div class="notification-controls">
                            <select id="notificationPriority">
                                <option value="normal">Normal Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <button type="submit" class="btn-primary">Send Notification</button>
                        </div>
                    </form>
                </section>
            `,
            'support-tickets': `
                <section id="support-tickets" class="admin-section active">
                    <h2>Customer Support Tickets</h2>
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
                    </div>
                </section>
            `,
            'plans': `
                <section id="plans" class="admin-section active">
                    <h2>Subscription Plans</h2>
                    <button class="btn-primary" onclick="showAddPlanModal()">Add New Plan</button>
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
                    <button class="btn-primary" onclick="showFilterTransactionsModal()">Filter Transactions</button>
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
                    <button class="btn-primary" onclick="showGenerateReportModal()">Generate Report</button>
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
            alert("Plan added successfully!");
        }

        // Delete Plan
        function deletePlan(index) {
            if (confirm("Are you sure you want to delete this plan?")) {
                rechargePlans.splice(index, 1);
                populateRechargePlansTable();
                alert("Plan deleted successfully!");
            }
        }

        // Populate Recharge Plans Table
        function populateRechargePlansTable() {
            populateTable("rechargePlansTable", rechargePlans, ["name", "price", "validity", "data"], 
                (index) => `<button class="btn btn-outline-danger btn-sm" onclick="deletePlan(${index})">Delete</button>`);
            populateTable("plansTable", rechargePlans, ["name", "price", "validity", "data"], 
                (index) => `<button class="btn btn-outline-danger btn-sm" onclick="deletePlan(${index})">Delete</button>`);
        }

        // Download Invoice
        function downloadInvoice() {
            const invoiceContent = `
                VoltMobi Admin Dashboard Invoice
                Date: ${new Date().toLocaleDateString('en-IN')}
                Total Subscribers: ${document.getElementById("totalSubscribers").textContent}
                Active Plans: ${document.getElementById("activePlans").textContent}
                Revenue (This Month): ${document.getElementById("monthlyRevenue").textContent}
                Inactive Numbers: ${document.getElementById("inactiveNumbers").textContent}
                
                Recharge Plans:
                ${rechargePlans.map(plan => `${plan.name}: ${plan.price}, ${plan.validity}, ${plan.data}`).join('\n')}
                
                Transactions:
                ${transactions.map(t => `${t.id}: ${t.user}, ${t.plan}, ${t.date}, ${t.amount}, ${t.status}`).join('\n')}
            `;
            const blob = new Blob([invoiceContent], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'VoltMobi_Dashboard_Invoice.pdf';
            link.click();
        }

        // Send Notification
        function sendNotification(e) {
            e.preventDefault();
            const type = document.getElementById("notificationType").value;
            const message = document.getElementById("notificationMessage").value;
            const priority = document.getElementById("notificationPriority").value;
            let recipients = [];

            if (type === "all") recipients = ["All Users"];
            else if (type === "expiring") recipients = expiringPlans.map(p => p.mobile);
            else if (type === "inactive") recipients = inactiveNumbersData.map(n => n.number);
            else if (type === "custom") recipients = document.getElementById("customUserInput").value.split(",").map(num => num.trim());

            alert(`Notification sent to ${recipients.join(", ")}:\n${message}\nPriority: ${priority}`);
            document.getElementById("notificationForm").reset();
        }

        // Filter Transaction History
        function applyTransactionHistoryFilters() {
            const date = document.getElementById("filterDate").value;
            const amount = document.getElementById("filterAmount").value;
            const method = document.getElementById("filterPaymentMethod").value;

            const filtered = transactions.filter(t => {
                return (!date || t.date === date) &&
                       (!amount || t.amount === `₹${amount}`) &&
                       (!method || t.method === method);
            });
            populateTable("transactionHistoryTable", filtered, ["plan", "date", "amount", "method", "status"]);
        }

        // Filter Transactions
        function applyTransactionFilters() {
            const dateRange = document.getElementById("transactionDateRange").value;
            const status = document.getElementById("transactionStatus").value;
            const plan = document.getElementById("transactionPlan").value;

            const filtered = transactions.filter(t => {
                const [start, end] = dateRange ? dateRange.split(" - ") : ["", ""];
                return (!dateRange || (t.date >= start && t.date <= end)) &&
                       (status === "all" || t.status.toLowerCase() === status) &&
                       (plan === "all" || t.plan.toLowerCase().includes(plan));
            });

            populateTable("transactionsTable", filtered, ["id", "user", "date", "amount", "plan", "status"], 
                () => `<button class="btn btn-outline-primary btn-sm">View</button>`);
            bootstrap.Modal.getInstance(document.getElementById("filterTransactionsModal")).hide();
        }

        // Generate Report
        function generateReport() {
            const type = document.getElementById("reportType").value;
            const dateRange = document.getElementById("reportDateRange").value;
            const format = document.getElementById("reportFormat").value;

            let content = `VoltMobi Report\nType: ${type}\nDate Range: ${dateRange || "All Time"}\n`;
            if (type === "transactions") content += transactions.map(t => `${t.id}: ${t.user}, ${t.amount}, ${t.status}`).join('\n');
            else if (type === "plans") content += rechargePlans.map(p => `${p.name}: ${p.price}, ${p.validity}`).join('\n');

            const blob = new Blob([content], { type: format === "pdf" ? 'application/pdf' : 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `VoltMobi_${type}_Report.${format}`;
            link.click();
            bootstrap.Modal.getInstance(document.getElementById("generateReportModal")).hide();
        }

        // Show Modals
        function showAddPlanModal() {
            const template = document.getElementById('add-plan-modal-template').innerHTML;
            document.body.insertAdjacentHTML('beforeend', template);
            const modal = new bootstrap.Modal(document.getElementById('addPlanModal'));
            modal.show();
            document.getElementById('addPlanModal').addEventListener('hidden.bs.modal', () => {
                document.getElementById('addPlanModal').remove();
            }, { once: true });
        }

        function showFilterTransactionsModal() {
            const template = document.getElementById('filter-transactions-modal-template').innerHTML;
            document.body.insertAdjacentHTML('beforeend', template);
            const modal = new bootstrap.Modal(document.getElementById('filterTransactionsModal'));
            modal.show();
            document.getElementById('filterTransactionsModal').addEventListener('hidden.bs.modal', () => {
                document.getElementById('filterTransactionsModal').remove();
            }, { once: true });
        }

        function showGenerateReportModal() {
            const template = document.getElementById('generate-report-modal-template').innerHTML;
            document.body.insertAdjacentHTML('beforeend', template);
            const modal = new bootstrap.Modal(document.getElementById('generateReportModal'));
            modal.show();
            document.getElementById('generateReportModal').addEventListener('hidden.bs.modal', () => {
                document.getElementById('generateReportModal').remove();
            }, { once: true });
        }

        // Toggle Sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.querySelector('.main-content');
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('sidebar-open');
        }

        // Initialize Content
        function initializeContent(route) {
            switch (route) {
                case 'expiring-plans':
                    populateTable("expiringPlansTable", expiringPlans, ["mobile", "plan", "expiry", "amount"], 
                        () => `<button class="btn btn-warning btn-sm">Notify</button>`);
                    break;
                case 'inactive-numbers':
                    loadInactiveNumbers();
                    document.getElementById("selectAll").addEventListener("change", function() {
                        const checkboxes = document.querySelectorAll("#inactiveNumbersTable tbody input[type='checkbox']");
                        checkboxes.forEach(checkbox => checkbox.checked = this.checked);
                    });
                    document.getElementById("deactivateAllBtn").addEventListener("click", () => {
                        const selected = Array.from(document.querySelectorAll(".number-checkbox:checked")).map(cb => cb.parentElement.nextElementSibling.textContent);
                        if (selected.length) alert(`Deactivated: ${selected.join(", ")}`);
                    });
                    document.getElementById("notifyAllBtn").addEventListener("click", () => {
                        const selected = Array.from(document.querySelectorAll(".number-checkbox:checked")).map(cb => cb.parentElement.nextElementSibling.textContent);
                        if (selected.length) alert(`Notified: ${selected.join(", ")}`);
                    });
                    break;
                case 'recharge-plans':
                    populateRechargePlansTable();
                    break;
                case 'transaction-history':
                    populateTable("transactionHistoryTable", transactions, ["plan", "date", "amount", "method", "status"]);
                    break;
                case 'support-tickets':
                    populateTable("supportTicketsTable", supportTickets, ["id", "user", "issue", "status"], 
                        () => `<button class="btn btn-primary btn-sm" onclick="resolve()">Resolve</button>`);
                    break;
                case 'feedback-reports':
                    populateTable("feedbackReportsTable", feedbackReports, ["user", "feedback", "date", "rating"], 
                        () => `<button class="btn btn-primary btn-sm">View</button>`);
                    break;
                case 'plans':
                    populateRechargePlansTable();
                    break;
                case 'transactions':
                    populateTable("transactionsTable", transactions, ["id", "user", "date", "amount", "plan", "status"], 
                        () => `<button class="btn btn-outline-primary btn-sm">View</button>`);
                    break;
                case 'reports':
                    const userGrowthCtx = document.getElementById("userGrowthChart").getContext("2d");
                    new Chart(userGrowthCtx, {
                        type: "bar",
                        data: {
                            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                            datasets: [{
                                label: "New Users",
                                data: [50, 100, 200, 150, 300, 250, 400],
                                backgroundColor: "rgba(97, 122, 85, 0.8)",
                                borderColor: "#617A55",
                                borderWidth: 1
                            }]
                        },
                        options: { scales: { y: { beginAtZero: true } }, responsive: true }
                    });

                    const revenueBreakdownCtx = document.getElementById("revenueBreakdownChart").getContext("2d");
                    new Chart(revenueBreakdownCtx, {
                        type: "pie",
                        data: {
                            labels: ["₹239 Plan", "₹299 Plan", "₹479 Plan"],
                            datasets: [{
                                label: "Revenue Breakdown (₹)",
                                data: [239000, 299000, 479000],
                                backgroundColor: ["rgba(12, 29, 19, 0.8)", "rgba(97, 122, 85, 0.8)", "rgba(182, 141, 64, 0.8)"],
                                borderColor: ["#0C1D13", "#617A55", "#B68D40"],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                tooltip: { callbacks: { label: (context) => "₹" + context.raw.toLocaleString("en-IN") } }
                            }
                        }
                    });

                    const analysisCtx = document.getElementById("Analysis").getContext("2d");
                    new Chart(analysisCtx, {
                        type: "line",
                        data: {
                            labels: ["January", "February", "March", "April", "May", "June"],
                            datasets: [{
                                label: "Monthly Active Users",
                                data: [1200, 1500, 2000, 2500, 3000, 3500],
                                backgroundColor: "rgba(182, 141, 64, 0.1)",
                                borderColor: "#B68D40",
                                borderWidth: 2,
                                pointBackgroundColor: "#B68D40",
                                pointRadius: 5
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: { beginAtZero: true, title: { display: true, text: "Number of Users" } },
                                x: { title: { display: true, text: "Months" } }
                            }
                        }
                    });
                    break;
                case 'notifications':
                    document.getElementById("notificationType").addEventListener("change", function() {
                        document.getElementById("customUserGroup").style.display = this.value === "custom" ? "block" : "none";
                    });
                    break;
            }
        }


        function resolve(){
            alert("Ticket Resolved");
        }
        // Load Inactive Numbers
        function loadInactiveNumbers() {
            const tbody = document.querySelector("#inactiveNumbersTable tbody");
            if (!tbody) return;
            tbody.innerHTML = "";
            inactiveNumbersData.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><input type="checkbox" class="number-checkbox"></td>
                    <td>${item.number}</td>
                    <td>${item.lastRecharge}</td>
                    <td>${item.days}</td>
                    <td>${item.name}</td>
                    <td>
                        <button class="btn-warning btn-sm" onclick="notifyUser('${item.number}')">Notify</button>
                        <button class="btn-danger btn-sm" onclick="deactivateNumber('${item.number}')">Deactivate</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

        function notifyUser(number) {
            alert(`Notification sent to ${number}`);
        }

        function deactivateNumber(number) {
            if (confirm(`Are you sure you want to deactivate ${number}?`)) {
                alert(`Number ${number} has been deactivated`);
            }
        }

        function logout() {
            window.location.href = "admin-login.html";
        }

        function saveProfileSettings(e) {
            e.preventDefault();
            alert("Profile settings saved!");
        }

        function changePassword(e) {
            e.preventDefault();
            const current = document.getElementById("currentPassword").value;
            const newPass = document.getElementById("newPassword").value;
            const confirm = document.getElementById("confirmPassword").value;
            if (newPass === confirm) {
                alert("Password changed successfully!");
            } else {
                alert("Passwords do not match!");
            }
        }

        // Initial Setup
        document.addEventListener("DOMContentLoaded", () => {
            const navLinks = document.querySelectorAll('.sidebar-nav a');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const route = link.getAttribute('data-route');
                    navigateTo(route);
                });
            });

            // Initial route based on hash or default to analytics
            const initialRoute = window.location.hash.substring(1) || 'analytics';
            navigateTo(initialRoute);

            // Listen for hash changes
            window.addEventListener('hashchange', () => {
                const route = window.location.hash.substring(1) || 'analytics';
                navigateTo(route);
            });

            // Responsive sidebar toggle on resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    document.getElementById('sidebar').classList.remove('active');
                    document.querySelector('.main-content').classList.remove('sidebar-open');
                }
            });
        });
    