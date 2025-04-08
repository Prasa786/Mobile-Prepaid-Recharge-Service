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
    else url = `${apiBaseUrl}/recharge-plans`;

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
    const categoryId = "all";
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
    fetchRechargePlans();
}

// Display Plans in UI
function displayRechargePlans(plans) {
    const container = document.getElementById("plansContainer");
    if (!container) {
        console.error("plansContainer element not found in DOM");
        return;
    }
    container.innerHTML = "";

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
async function buyNow(planId) {
    const mobileNumber = localStorage.getItem("mobileNumber");

    if (!mobileNumber || mobileNumber === "null" || mobileNumber === "") {
        localStorage.setItem("selectedPlanId", planId);
        const modal = new bootstrap.Modal(document.getElementById("phoneNumberModal"));
        modal.show();
    } else {
        // Verify if number exists in DB
        const exists = await checkMobileExists(mobileNumber);
        if (exists) {
            localStorage.setItem("selectedPlanId", planId);
            window.location.href = "/Users/html/payment.html";
        } else {
            localStorage.removeItem("mobileNumber");
            alert("Phone number not registered. Please enter a valid number.");
            const modal = new bootstrap.Modal(document.getElementById("phoneNumberModal"));
            modal.show();
        }
    }
}

// Buy Now from Modal
function buyNowFromModal() {
    const planId = localStorage.getItem("selectedPlanId");
    if (planId) buyNow(planId);
}

// Handle Phone Number Submission
async function handlePhoneSubmit() {
    const phoneNumberInput = document.getElementById("phoneNumberInput").value;
    const fullPhoneNumber = `+91${phoneNumberInput}`;
    const phoneError = document.getElementById("phoneError");
    const submitBtn = document.getElementById("submitPhoneNumber");

    if (!/^\d{10}$/.test(phoneNumberInput)) {
        phoneError.textContent = "Please enter a valid 10-digit number.";
        phoneError.style.display = "block";
        return;
    }

    if (/^[01]/.test(phoneNumberInput)) {
        phoneError.textContent = "Mobile number cannot start with 0 or 1.";
        phoneError.style.display = "block";
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying...";

        const exists = await checkMobileExists(fullPhoneNumber);
        if (exists) {
            localStorage.setItem("mobileNumber", fullPhoneNumber);
            document.getElementById("userPhone").textContent = phoneNumberInput;
            document.getElementById("updatePhoneBtn").style.display = "inline-block";
            document.getElementById("logoutBtn").style.display = "inline-block";
            const modal = bootstrap.Modal.getInstance(document.getElementById("phoneNumberModal"));
            modal.hide();
            const planId = localStorage.getItem("selectedPlanId");
            if (planId) {
                window.location.href = "/Users/html/payment.html";
            }
        } else {
            phoneError.textContent = "Phone number not registered. Please register first.";
            phoneError.style.display = "block";
        }
    } catch (error) {
        console.error("Error:", error);
        phoneError.textContent = "Error verifying number. Please try again.";
        phoneError.style.display = "block";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
    }
}

// Check if mobile exists in DB
async function checkMobileExists(mobileNumber) {
    try {
        const response = await fetch(`${apiBaseUrl}/users/check-mobile/${mobileNumber}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error checking mobile:", error);
        return false;
    }
}

// Function to Update Phone Number
function updatePhoneNumber() {
    const newNumber = prompt("Enter new phone number:");
    if (newNumber && /^\d{10}$/.test(newNumber)) {
        const fullNumber = `+91${newNumber}`;
        localStorage.setItem("mobileNumber", fullNumber);
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
        document.getElementById("userPhone").textContent = "Guest User";
        document.getElementById("updatePhoneBtn").style.display = "none";
        document.getElementById("logoutBtn").style.display = "none";
    }
}

// Check User Status on Page Load
function checkUserStatus() {
    const mobileNumber = localStorage.getItem("mobileNumber");
    if (mobileNumber && mobileNumber !== "null" && mobileNumber !== "") {
        checkMobileExists(mobileNumber).then(exists => {
            if (exists) {
                document.getElementById("userPhone").textContent = mobileNumber.slice(3); // Remove +91
                document.getElementById("updatePhoneBtn").style.display = "inline-block";
                document.getElementById("logoutBtn").style.display = "inline-block";
            } else {
                localStorage.removeItem("mobileNumber");
                document.getElementById("userPhone").textContent = "Guest User";
                document.getElementById("updatePhoneBtn").style.display = "none";
                document.getElementById("logoutBtn").style.display = "none";
            }
        });
    }
}

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    checkUserStatus();
    fetchRechargePlans();
    fetchCategories();
    document.getElementById("submitPhoneNumber").addEventListener("click", handlePhoneSubmit);
});