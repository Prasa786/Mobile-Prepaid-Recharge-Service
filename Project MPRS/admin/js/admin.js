const apiBaseUrl = "http://localhost:8083/api";
const token = localStorage.getItem("adminToken");
console.log("Token:", token);

// Ensure Admin Token Exists
if (!token) {
    alert("Unauthorized! Please login as admin.");
    window.location.href = "admin-login.html";
} else if (!token.startsWith("eyJ")) { // Basic JWT format check
    console.error("Invalid token format:", token);
    alert("Invalid token detected! Please login again.");
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
}

// Global headers for API calls
const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};

// Generic Fetch Function with Detailed Error Handling
async function fetchData(endpoint, method = "GET", body = null) {
    try {
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${apiBaseUrl}${endpoint}`, options);
        const text = await response.text();
        console.log(`Raw response from ${endpoint}:`, text); // Log raw response for debugging

        if (!response.ok) {
            if (response.status === 403) throw new Error("Access denied: Insufficient permissions.");
            if (response.status === 401) throw new Error("Unauthorized: Token expired or invalid.");
            if (response.status === 500) throw new Error(`Server error: ${text.substring(0, 200)}...`);
            throw new Error(`HTTP ${response.status}: ${text}`);
        }

        // Only parse as JSON if there's content and it's not a DELETE response with plain text
        if (text && method !== "DELETE") {
            return JSON.parse(text);
        }
        return text || null; // Return text for DELETE or null if empty
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

// Fetch Recharge Plans
async function fetchRechargePlans() {
    try {
        const plans = await fetchData("/recharge-plans");
        updateRechargePlansUI(plans || []);
    } catch (error) {
        showFeedback("Error fetching plans: " + error.message, false);
        handleAuthError(error);
    }
}

// Fetch Categories
async function fetchCategories() {
    try {
        const categories = await fetchData("/categories");
        updateCategoriesUI(categories || []);
    } catch (error) {
        showFeedback("Error fetching categories: " + error.message, false);
        handleAuthError(error);
    }
}

// Fetch Categories for Dropdown
async function fetchCategoriesForDropdown() {
    try {
        const categories = await fetchData("/categories");
        populateCategoryDropdown(categories || []);
    } catch (error) {
        showFeedback("Error fetching categories for dropdown: " + error.message, false);
        handleAuthError(error);
    }
}

// Populate Category Dropdown
function populateCategoryDropdown(categories) {
    const dropdown = document.getElementById("planCategory");
    if (!dropdown) return;
    dropdown.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a category";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    dropdown.appendChild(defaultOption);

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.categoryId;
        option.textContent = category.categoryName;
        dropdown.appendChild(option);
    });
    dropdown.classList.add("form-select");
}

// Show Feedback Messages
function showFeedback(message, isSuccess = true) {
    const feedbackDiv = document.getElementById("feedback") || document.createElement("div");
    feedbackDiv.id = "feedback";
    feedbackDiv.textContent = message;
    feedbackDiv.style.cssText = `
        color: ${isSuccess ? "green" : "red"};
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 10px;
        background-color: ${isSuccess ? "#d4edda" : "#f8d7da"};
        border-radius: 5px;
        display: block;
    `;
    if (!feedbackDiv.parentElement) document.body.appendChild(feedbackDiv);
    setTimeout(() => feedbackDiv.style.display = "none", 3000);
}

// Handle Authentication Errors
function handleAuthError(error) {
    if (error.message.includes("Unauthorized") || error.message.includes("Access denied")) {
        setTimeout(() => {
            localStorage.removeItem("adminToken");
            window.location.href = "admin-login.html";
        }, 2000);
    }
}

// Add Recharge Plan
async function addRechargePlan() {
    const plan = {
        name: document.getElementById("planName").value.trim(),
        price: parseFloat(document.getElementById("planPrice").value) || 0,
        validity: document.getElementById("planValidity").value.trim() || "0",
        dataLimit: document.getElementById("planData").value.trim() || "0",
        category: { categoryId: parseInt(document.getElementById("planCategory").value) },
        description: "",
        callMinutes: 0,
        smsCount: 0,
        validityDays: 0
    };

    if (!plan.name || !plan.category.categoryId) {
        showFeedback("Plan name and category are required!", false);
        return;
    }

    try {
        const addedPlan = await fetchData("/recharge-plans", "POST", plan);
        showFeedback(`Recharge plan "${addedPlan.name}" added successfully!`, true);
        fetchRechargePlans();
        bootstrap.Modal.getInstance(document.getElementById("addPlanModal")).hide();
    } catch (error) {
        showFeedback("Error adding plan: " + error.message, false);
    }
}

// Update Recharge Plan
async function updateRechargePlan(planId, updatedPlan) {
    try {
        await fetchData(`/recharge-plans/${planId}`, "PUT", updatedPlan);
        showFeedback("Recharge plan updated successfully!", true);
        fetchRechargePlans();
        bootstrap.Modal.getInstance(document.getElementById("editPlanModal")).hide();
    } catch (error) {
        showFeedback("Error updating plan: " + error.message, false);
    }
}

// Delete Recharge Plan
async function deleteRechargePlan(planId) {
    try {
        const responseText = await fetchData(`/recharge-plans/${planId}`, "DELETE");
        // Since backend returns plain text, just check if the request succeeded
        showFeedback(responseText || "Recharge plan deleted successfully!", true);
        fetchRechargePlans();
    } catch (error) {
        showFeedback("Error deleting plan: " + error.message, false);
    }
}

// Add Category
async function addCategory() {
    const category = { categoryName: document.getElementById("categoryName").value.trim() };
    if (!category.categoryName) {
        showFeedback("Category name is required!", false);
        return;
    }

    try {
        const addedCategory = await fetchData("/categories", "POST", category);
        showFeedback(`Category "${addedCategory.categoryName}" added successfully!`, true);
        fetchCategories();
        fetchCategoriesForDropdown();
        bootstrap.Modal.getInstance(document.getElementById("addCategoryModal")).hide();
    } catch (error) {
        showFeedback("Error adding category: " + error.message, false);
    }
}

// Update Category
async function updateCategory(categoryId, updatedCategory) {
    try {
        const updated = await fetchData(`/categories/${categoryId}`, "PUT", updatedCategory);
        showFeedback(`Category "${updated.categoryName}" updated successfully!`, true);
        fetchCategories();
        fetchCategoriesForDropdown();
        bootstrap.Modal.getInstance(document.getElementById("editCategoryModal")).hide();
    } catch (error) {
        showFeedback("Error updating category: " + error.message, false);
    }
}

// Delete Category
async function deleteCategory(categoryId) {
    try {
        const responseText = await fetchData(`/categories/${categoryId}`, "DELETE");
        showFeedback(responseText || "Category deleted successfully!", true);
        fetchCategories();
        fetchCategoriesForDropdown();
    } catch (error) {
        showFeedback("Error deleting category: " + error.message, false);
    }
}

// Fetch Categories (already defined above, keeping for completeness)
async function fetchCategories() {
    try {
        const categories = await fetchData("/categories");
        updateCategoriesUI(categories || []);
    } catch (error) {
        showFeedback("Error fetching categories: " + error.message, false);
        handleAuthError(error);
    }
}

// Update Recharge Plans UI
function updateRechargePlansUI(plans) {
    const table = document.getElementById("rechargePlansTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    plans.forEach(plan => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${plan.name}</td>
            <td>${plan.price}</td>
            <td>${plan.validity}</td>
            <td>${plan.dataLimit}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editRechargePlan('${plan.planId}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteRechargePlan('${plan.planId}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update Categories UI
function updateCategoriesUI(categories) {
    const table = document.getElementById("categoriesTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    categories.forEach(category => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${category.categoryName}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editCategory('${category.categoryId}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category.categoryId}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Logout Admin
function adminLogout() {
    localStorage.removeItem("adminToken");
    alert("Logged out successfully!");
    window.location.href = "admin-login.html";
}

// Fetch Users (Placeholder)
async function fetchUsers() {
    try {
        const users = await fetchData("/users");
        updateUsersUI(users || []);
    } catch (error) {
        showFeedback("Error fetching users: " + error.message, false);
    }
}

// Update Users UI
function updateUsersUI(users) {
    const table = document.getElementById("usersTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.userId || "N/A"}</td>
            <td>${user.name || "N/A"}</td>
            <td>${user.email || "N/A"}</td>
            <td>${user.mobile || "N/A"}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewUserTransactions('${user.userId}')">View Transactions</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// View User Transactions (Placeholder)
async function viewUserTransactions(userId) {
    try {
        const transactions = await fetchData(`/users/${userId}/transactions`);
        updateTransactionsUI(transactions || []);
    } catch (error) {
        showFeedback("Error fetching transactions: " + error.message, false);
    }
}

// Update Transactions UI
function updateTransactionsUI(transactions) {
    const table = document.getElementById("transactionsTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    transactions.forEach(transaction => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.transactionId || "N/A"}</td>
            <td>${transaction.planName || "N/A"}</td>
            <td>${transaction.amount || "N/A"}</td>
            <td>${transaction.date || "N/A"}</td>
            <td>${transaction.status || "N/A"}</td>
        `;
        tbody.appendChild(row);
    });
}

// Fetch KYC Requests (Placeholder)
async function fetchKYCRequests() {
    try {
        const kycRequests = await fetchData("/kyc-requests");
        updateKYCRequestsUI(kycRequests || []);
    } catch (error) {
        showFeedback("Error fetching KYC requests: " + error.message, false);
    }
}

// Update KYC Requests UI
function updateKYCRequestsUI(kycRequests) {
    const table = document.getElementById("kycRequestsTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    kycRequests.forEach(request => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${request.requestId || "N/A"}</td>
            <td>${request.userId || "N/A"}</td>
            <td>${request.status || "N/A"}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewKYCRequest('${request.requestId}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// View KYC Request (Placeholder)
async function viewKYCRequest(requestId) {
    try {
        const request = await fetchData(`/kyc-requests/${requestId}`);
        updateKYCRequestUI(request || {});
    } catch (error) {
        showFeedback("Error fetching KYC request: " + error.message, false);
    }
}

// Update KYC Request UI
function updateKYCRequestUI(request) {
    const modalBody = document.getElementById("kycRequestModalBody");
    if (!modalBody) return;
    modalBody.innerHTML = `
        <p><strong>Request ID:</strong> ${request.requestId || "N/A"}</p>
        <p><strong>User ID:</strong> ${request.userId || "N/A"}</p>
        <p><strong>Status:</strong> ${request.status || "N/A"}</p>
        <p><strong>Details:</strong> ${request.details || "No details provided"}</p>
    `;
    const kycRequestModal = new bootstrap.Modal(document.getElementById("kycRequestModal"));
    kycRequestModal.show();
}

// Load Static Feedback
function loadStaticFeedback() {
    const feedback = [
        { id: 1, message: "Great service!", rating: 5 },
        { id: 2, message: "Could be better.", rating: 3 }
    ];
    updateFeedbackUI(feedback);
}

// Update Feedback UI
function updateFeedbackUI(feedback) {
    const table = document.getElementById("feedbackTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";
    feedback.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.message}</td>
            <td>${item.rating}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load Static Graph
function loadStaticGraph() {
    const ctx = document.getElementById("analyticsChart")?.getContext("2d");
    if (!ctx) return;
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [{
                label: "Recharges",
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Edit Recharge Plan (Open Modal)
function editRechargePlan(planId) {
    fetchData(`/recharge-plans/${planId}`)
        .then(plan => {
            document.getElementById("editPlanId").value = plan.planId;
            document.getElementById("editPlanName").value = plan.name;
            document.getElementById("editPlanPrice").value = plan.price;
            document.getElementById("editPlanValidity").value = plan.validity;
            document.getElementById("editPlanData").value = plan.dataLimit;
            document.getElementById("planCategory").value = plan.category.categoryId;
            const editPlanModal = new bootstrap.Modal(document.getElementById("editPlanModal"));
            editPlanModal.show();
        })
        .catch(error => showFeedback("Error loading plan for edit: " + error.message, false));
}

// Edit Category (Open Modal)
function editCategory(categoryId) {
    fetchData(`/categories/${categoryId}`)
        .then(category => {
            document.getElementById("editCategoryId").value = category.categoryId;
            document.getElementById("editCategoryName").value = category.categoryName;
            const editCategoryModal = new bootstrap.Modal(document.getElementById("editCategoryModal"));
            editCategoryModal.show();
        })
        .catch(error => showFeedback("Error loading category for edit: " + error.message, false));
}

// Event Listeners
document.getElementById("logoutBtn")?.addEventListener("click", adminLogout);
document.getElementById("addRechargePlanForm")?.addEventListener("submit", e => {
    e.preventDefault();
    addRechargePlan();
});
document.getElementById("addCategoryForm")?.addEventListener("submit", e => {
    e.preventDefault();
    addCategory();
});
document.getElementById("saveEditedPlan")?.addEventListener("click", () => {
    const planId = document.getElementById("editPlanId").value;
    const updatedPlan = {
        name: document.getElementById("editPlanName").value.trim(),
        price: parseFloat(document.getElementById("editPlanPrice").value) || 0,
        validity: document.getElementById("editPlanValidity").value.trim() || "0",
        dataLimit: document.getElementById("editPlanData").value.trim() || "0",
        category: { categoryId: parseInt(document.getElementById("planCategory").value) },
        description: "",
        callMinutes: 0,
        smsCount: 0,
        validityDays: 0
    };
    if (!updatedPlan.name) {
        showFeedback("Plan name is required!", false);
        return;
    }
    updateRechargePlan(planId, updatedPlan);
});
document.getElementById("saveEditedCategory")?.addEventListener("click", () => {
    const categoryId = document.getElementById("editCategoryId").value;
    const updatedCategory = { categoryName: document.getElementById("editCategoryName").value.trim() };
    if (!updatedCategory.categoryName) {
        showFeedback("Category name is required!", false);
        return;
    }
    updateCategory(categoryId, updatedCategory);
});

document.querySelectorAll(".sidebar-nav a").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const sectionId = link.getAttribute("href").substring(1);
        navigateTo(sectionId);
    });
});

// Fetch Data on Page Load
window.onload = () => {
    fetchRechargePlans();
    fetchCategories();
    fetchCategoriesForDropdown();
    fetchUsers();
    fetchTransactions();
    fetchKYCRequests();
    loadStaticFeedback();
    loadStaticGraph();
};

// Navigation for Admin Dashboard
function navigateTo(sectionId) {
    document.querySelectorAll(".admin-section").forEach(section => {
        section.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");
}

// Placeholder Fetch Transactions
async function fetchTransactions() {
    console.log("Fetch transactions not implemented yet.");
}