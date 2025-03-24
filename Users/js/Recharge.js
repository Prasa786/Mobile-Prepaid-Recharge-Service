// Base API URL
const apiBaseUrl = "http://localhost:8083/api";

// Fetch Recharge Plans from Backend
async function fetchRechargePlans(search = "", categoryId = "all") {
    let url = `${apiBaseUrl}/recharge-plans`;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId !== "all") params.append("categoryId", categoryId);
    if (params.toString()) url += `?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                // Uncomment if token is required for users
                // "Authorization": "Bearer " + localStorage.getItem("token"),
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
        document.getElementById("plansContainer").innerHTML = "<p class='text-danger'>Error loading plans. Please try again later.</p>";
    }
}

// Fetch Categories for Filter Dropdown
async function fetchCategories() {
    try {
        const response = await fetch(`${apiBaseUrl}/categories`, {
            method: "GET",
            headers: {
                // "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }

        const categories = await response.json();
        populateCategoryFilter(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        document.getElementById("filterType").innerHTML = "<option value='all'>All Categories</option>";
    }
}

// Populate Category Filter Dropdown
function populateCategoryFilter(categories) {
    const filter = document.getElementById("filterType");
    filter.innerHTML = "<option value='all'>All Categories</option>";
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.categoryId;
        option.textContent = category.categoryName;
        filter.appendChild(option);
    });
}

// Display Plans in UI
function displayRechargePlans(plans) {
    const container = document.getElementById("plansContainer");
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
                    <h5 class="card-title text-primary">${plan.name}</h5>
                    <p class="card-text"><strong>Price:</strong> ₹${plan.price}</p>
                    <p class="card-text"><strong>Validity:</strong> ${plan.validity}</p>
                    <p class="card-text"><strong>Data:</strong> ${plan.dataLimit || "N/A"}</p>
                    <p class="card-text"><strong>Benefits:</strong> ${plan.benefits || plan.description || "N/A"}</p>
                </div>
                <div class="card-footer bg-transparent border-0">
                    <button class="btn btn-outline-primary me-2" onclick="viewDetails(${plan.planId})">View Details</button>
                    <button class="btn btn-success" onclick="buyNow(${plan.planId})">Buy Now</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Filter and Search Plans
document.getElementById("searchPlans")?.addEventListener("input", (e) => {
    const search = e.target.value.trim();
    const categoryId = document.getElementById("filterType").value;
    fetchRechargePlans(search, categoryId);
});

document.getElementById("filterType")?.addEventListener("change", (e) => {
    const search = document.getElementById("searchPlans").value.trim();
    const categoryId = e.target.value;
    fetchRechargePlans(search, categoryId);
});

// Fetch and Show Plan Details in Modal
async function viewDetails(planId) {
    try {
        const response = await fetch(`${apiBaseUrl}/recharge-plans/${planId}`, {
            method: "GET",
            headers: {
                // "Authorization": "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch plan details");
        }

        const plan = await response.json();
        document.getElementById("modalPlanName").textContent = `Plan: ${plan.name}`;
        document.getElementById("modalPlanPrice").textContent = `Price: ₹${plan.price}`;
        document.getElementById("modalPlanValidity").textContent = `Validity: ${plan.validity}`;
        document.getElementById("modalPlanData").textContent = `Data: ${plan.dataLimit || "N/A"}`;
        document.getElementById("modalPlanDetails").textContent = `Benefits: ${plan.benefits || plan.description || "N/A"}`;

        const modal = new bootstrap.Modal(document.getElementById("planModal"));
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
    window.location.href = "payment.html";
}

// Scroll to Top Functionality
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
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

    if (!mobileNumber || mobileNumber === "null" || mobileNumber === "") {
        const newNumber = prompt("Please enter your 10-digit phone number to proceed with the recharge:");
        if (newNumber && /^\d{10}$/.test(newNumber)) {
            localStorage.setItem("mobileNumber", newNumber);
            userPhoneElement.textContent = newNumber;
            return true;
        } else {
            alert("Please enter a valid 10-digit mobile number.");
            return false;
        }
    } else {
        userPhoneElement.textContent = mobileNumber;
        return true;
    }
}

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    checkUserPhoneNumber();
    fetchRechargePlans();
    fetchCategories();
});