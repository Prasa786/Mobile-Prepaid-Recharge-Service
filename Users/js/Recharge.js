// Base API URL
const apiBaseUrl = "http://localhost:8083/api";

// Fetch Recharge Plans from Backend
async function fetchRechargePlans(search = "", categoryId = "all", minPrice = null, maxPrice = null, minValidity = null, maxValidity = null) {
    let url = `${apiBaseUrl}/recharge-plans/search`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId !== "all") params.append("categoryId", categoryId);
    if (minPrice !== null) params.append("minPrice", minPrice);
    if (maxPrice !== null) params.append("maxPrice", maxPrice);
    if (minValidity !== null) params.append("minValidity", minValidity);
    if (maxValidity !== null) params.append("maxValidity", maxValidity);
    if (params.toString()) url += `?${params.toString()}`;
    else url = `${apiBaseUrl}/recharge-plans`; // Fallback to all plans

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch recharge plans: ${response.status}`);
        }

        const plans = await response.json();
        displayRechargePlans(plans);
    } catch (error) {
        console.error("Error fetching plans:", error);
        const container = document.getElementById("plansContainer");
        if (container) {
            container.innerHTML = "<p class='text-danger'>Error loading plans. Please try again later.</p>";
        }
    }
}

// Fetch Categories for Sidebar
async function fetchCategories() {
    try {
        const response = await fetch(`${apiBaseUrl}/categories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const categories = await response.json();
        populateCategoryList(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        const categoryList = document.getElementById("categoryList");
        if (categoryList) {
            categoryList.innerHTML = "<li><a href='#' onclick=\"filterByCategory('all')\">All Categories</a></li>";
        }
    }
}

// Populate Category List in Sidebar
function populateCategoryList(categories) {
    const categoryList = document.getElementById("categoryList");
    if (!categoryList) return;
    categoryList.innerHTML = "<li><a href='#' onclick=\"filterByCategory('all')\">All Categories</a></li>";
    categories.forEach(category => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="#" onclick="filterByCategory(${category.categoryId})">${category.categoryName}</a>`;
        categoryList.appendChild(li);
    });
}

// Filter Plans by Category
function filterByCategory(categoryId) {
    const search = document.getElementById("searchName").value.trim();
    const minPrice = document.getElementById("minPrice").value || null;
    const maxPrice = document.getElementById("maxPrice").value || null;
    const minValidity = document.getElementById("minValidity").value || null;
    const maxValidity = document.getElementById("maxValidity").value || null;
    fetchRechargePlans(search, categoryId, minPrice, maxPrice, minValidity, maxValidity);
}

// Apply Filters from Inputs
function applyFilters() {
    const search = document.getElementById("searchName").value.trim();
    const categoryId = "all"; // Default to all unless category is clicked
    const minPrice = document.getElementById("minPrice").value || null;
    const maxPrice = document.getElementById("maxPrice").value || null;
    const minValidity = document.getElementById("minValidity").value || null;
    const maxValidity = document.getElementById("maxValidity").value || null;
    fetchRechargePlans(search, categoryId, minPrice, maxPrice, minValidity, maxValidity);
}

// Reset Filters
function resetFilters() {
    document.getElementById("searchName").value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.getElementById("minValidity").value = "";
    document.getElementById("maxValidity").value = "";
    fetchRechargePlans(); // Fetch all plans with no filters
}

// Display Plans in UI
function displayRechargePlans(plans) {
    const container = document.getElementById("plansContainer");
    if (!container) {
        console.error("plansContainer element not found in DOM");
        return;
    }
    container.innerHTML = ""; // Clear previous data

    if (!plans || plans.length === 0) {
        container.innerHTML = "<p class='text-muted'>No plans available.</p>";
        return;
    }

    plans.forEach(plan => {
        const div = document.createElement("div");
        div.classList.add("col-md-4", "mb-4");
        div.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${plan.name}</h5>
                    <p class="card-text"><strong>Price:</strong> ₹${plan.price}</p>
                    <p class="card-text"><strong>Validity:</strong> ${plan.validity}</p>
                    <p class="card-text"><strong>Data:</strong> ${plan.dataLimit || "N/A"}</p>
                    <p class="card-text"><strong>Benefits:</strong> ${plan.benefits || plan.description || "N/A"}</p>
                </div>
                <div class="card-footer bg-transparent border-0">
                    <button class="btn btn-primary me-2" onclick="viewDetails(${plan.planId})">View Details</button>
                    <button class="btn btn-success" onclick="buyNow(${plan.planId})">Buy Now</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Fetch and Show Plan Details in Modal
async function viewDetails(planId) {
    try {
        const response = await fetch(`${apiBaseUrl}/recharge-plans/${planId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch plan details: ${response.status}`);
        }

        const plan = await response.json();
        document.getElementById("modalPlanName").textContent = `Plan: ${plan.name}`;
        document.getElementById("modalPlanPrice").textContent = `Price: ₹${plan.price}`;
        document.getElementById("modalPlanValidity").textContent = `Validity: ${plan.validity}`;
        document.getElementById("modalPlanData").textContent = `Data: ${plan.dataLimit || "N/A"}`;
        document.getElementById("modalPlanDetails").textContent = `Benefits: ${plan.benefits || plan.description || "N/A"}`;
        localStorage.setItem("selectedPlanId", plan.planId);

        const modalElement = document.getElementById("planModal");
        if (!modalElement) {
            console.error("planModal element not found in DOM");
            return;
        }
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error("Error fetching plan details:", error);
        alert("Unable to load plan details. Please try again.");
    }
}

// Function to Buy Plan
function buyNow(planId) {
    const mobileNumber = localStorage.getItem("mobileNumber");

    if (!mobileNumber || mobileNumber === "null" || mobileNumber === "") {
        alert("Please enter a valid mobile number before proceeding.");
        return;
    }

    localStorage.setItem("selectedPlanId", planId);
    window.location.href = "/Users/html/payment.html";
}

// Buy Now from Modal
function buyNowFromModal() {
    const planId = localStorage.getItem("selectedPlanId");
    if (planId) buyNow(planId);
}

// Function to Update Phone Number
function updatePhoneNumber() {
    const newNumber = prompt("Enter new phone number:");
    if (newNumber && /^\d{10}$/.test(newNumber)) {
        localStorage.setItem("mobileNumber", newNumber);
        document.getElementById("userPhone").textContent = newNumber;
    } else {
        alert("Please enter a valid 10-digit mobile number.");
    }
}

// Function to Logout
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("mobileNumber");
        localStorage.removeItem("selectedPlanId");
        window.location.href = "/Users/index.html";
    }
}

// Check and Set User Phone Number
function checkUserPhoneNumber() {
    const mobileNumber = localStorage.getItem("mobileNumber");
    const userPhoneElement = document.getElementById("userPhone");

    if (!userPhoneElement) {
        console.error("userPhone element not found in DOM");
        return;
    }

    if (!mobileNumber || mobileNumber === "null" || mobileNumber === "") {
        const newNumber = prompt("Please enter your 10-digit phone number to proceed with the recharge:");
        if (newNumber && /^\d{10}$/.test(newNumber)) {
            localStorage.setItem("mobileNumber", newNumber);
            userPhoneElement.textContent = newNumber;
        } else {
            alert("Please enter a valid 10-digit mobile number.");
        }
    } else {
        userPhoneElement.textContent = mobileNumber;
    }
}

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    checkUserPhoneNumber();
    fetchRechargePlans(); // Load all plans initially
    fetchCategories();
});