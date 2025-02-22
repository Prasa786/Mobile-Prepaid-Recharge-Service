
const expiringPlans = [
    { mobile: "9876543210", plan: "₹399 Plan", expiry: "2025-11-01", amount: "₹399" },
    { mobile: "9876543211", plan: "₹699 Plan", expiry: "2025-08-02", amount: "₹699" },
    { mobile: "8790765416", plan: "168 Plan",expiry:"2025-06-01", amount:"₹168"}
];

const rechargePlans = [
    { name: "₹399 Plan", price: "₹399", validity: "28 Days", data: "2GB/Day" },
    { name: "₹699 Plan", price: "₹699", validity: "56 Days", data: "3GB/Day" },
];

const transactions = [
    { plan: "₹399 Plan", date: "2023-11-25", amount: "₹399", method: "UPI", status: "Success" },
    { plan: "₹699 Plan", date: "2023-11-26", amount: "₹699", method: "Credit Card", status: "Failed" },
];

const supportTickets = [
    { id: "T123", user: "John Doe", issue: "Recharge Failed", status: "Open" },
    { id: "T124", user: "Jane Smith", issue: "Plan Not Activated", status: "Resolved" },
];

const feedbackReports = [
    { user: "John Doe", feedback: "Great service!", date: "2023-11-25" },
    { user: "Jane Smith", feedback: "Need more plans.", date: "2023-11-26" },
];


function populateTable(tableId, data, columns) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    data.forEach(item => {
        const row = document.createElement("tr");
        columns.forEach(col => {
            const cell = document.createElement("td");
            cell.textContent = item[col];
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateTable("expiringPlansTable", expiringPlans, ["mobile", "plan", "expiry", "amount"]);
    populateTable("rechargePlansTable", rechargePlans, ["name", "price", "validity", "data"]);
    populateTable("transactionHistoryTable", transactions, ["plan", "date", "amount", "method", "status"]);
    populateTable("supportTicketsTable", supportTickets, ["id", "user", "issue", "status"]);
    populateTable("feedbackReportsTable", feedbackReports, ["user", "feedback", "date"]);

    document.getElementById("totalSubscribers").textContent = "1,234";
    document.getElementById("activePlans").textContent = "789";
    document.getElementById("monthlyRevenue").textContent = "₹1,23,456";
});

document.getElementById("applyFiltersBtn").addEventListener("click", () => {
    const date = document.getElementById("filterDate").value;
    const amount = document.getElementById("filterAmount").value;
    const method = document.getElementById("filterPaymentMethod").value;

    const filtered = transactions.filter(t => {
        return (!date || t.date === date) &&
               (!amount || t.amount === `₹${amount}`) &&
               (!method || t.method === method);
    });

    populateTable("transactionHistoryTable", filtered, ["plan", "date", "amount", "method", "status"]);
});
document.getElementById("notificationForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = document.getElementById("notificationMessage").value;
    alert(`Notification sent: ${message}`);
    document.getElementById("notificationForm").reset();
});