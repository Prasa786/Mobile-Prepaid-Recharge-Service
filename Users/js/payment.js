// Base API URL
const apiBaseUrl = "http://localhost:8083/api";

// Global variables
let selectedPaymentMethod = null;
let planDetails = null;
let timerInterval;

// Load Payment Page
async function loadPaymentPage() {
    const planId = localStorage.getItem("selectedPlanId");
    const mobileNumber = localStorage.getItem("mobileNumber");

    if (!planId || !mobileNumber) {
        alert("No plan or mobile number selected. Please select a plan first.");
        window.location.href = "/Users/html/RechargePlans.html";
        return;
    }

    // Fetch plan details
    try {
        const response = await fetch(`${apiBaseUrl}/recharge-plans/${planId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error(`Failed to fetch plan: ${response.status}`);
        planDetails = await response.json();

        // Populate Plan Summary
        document.getElementById("summaryPlanName").textContent = planDetails.name;
        document.getElementById("summaryPrice").textContent = planDetails.price.toFixed(2);
        document.getElementById("summaryData").textContent = planDetails.dataLimit || "N/A";
        document.getElementById("summarySms").textContent = planDetails.smsCount > 0 ? `${planDetails.smsCount} SMS` : "N/A";
        document.getElementById("summaryCalls").textContent = planDetails.callMinutes > 0 ? `${planDetails.callMinutes} Minutes` : "Unlimited";

        // Populate Payment Summary
        const amount = planDetails.price;
        const gst = amount * 0.18; // 18% GST
        const total = amount + gst;
        document.getElementById("amountLabel").textContent = amount.toFixed(2);
        document.getElementById("gstlabel").textContent = gst.toFixed(2);
        document.getElementById("convenienceLabel").textContent = "0.00"; // Update dynamically later
        document.getElementById("totalLabel").textContent = total.toFixed(2);

        if (total > 500) document.getElementById("emiOption").style.display = "block";

        // Enable Pay Button once plan is loaded
        document.getElementById("payButton").disabled = false;
    } catch (error) {
        console.error("Error fetching plan:", error);
        document.querySelector(".plan-summary").innerHTML = "<p class='text-danger'>Error loading plan details.</p>";
    }

    // Start order timer
    startOrderTimer();
}

// Start 15-minute Order Timer
function startOrderTimer() {
    let timeLeft = 15 * 60; // 15 minutes in seconds
    const timerElement = document.getElementById("orderTimer");

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "Expired";
            document.getElementById("payButton").disabled = true;
            alert("Payment time expired. Please select a plan again.");
            window.location.href = "/Users/html/RechargePlans.html";
        }
    }, 1000);
}

// Handle Payment Method Selection
function setupPaymentOptions() {
    const paymentOptions = document.querySelectorAll(".payment-option");
    paymentOptions.forEach(option => {
        option.addEventListener("click", () => {
            paymentOptions.forEach(opt => opt.classList.remove("active"));
            option.classList.add("active");
            selectedPaymentMethod = option.getAttribute("data-method");

            // Update convenience fee based on method (example logic)
            const convenienceFee = selectedPaymentMethod === "upi" ? 0 : 10;
            document.getElementById("convenienceLabel").textContent = convenienceFee.toFixed(2);
            updateTotal();
        });
    });
}

// Update Total Amount
function updateTotal() {
    const amount = parseFloat(document.getElementById("amountLabel").textContent);
    const gst = parseFloat(document.getElementById("gstlabel").textContent);
    const convenienceFee = parseFloat(document.getElementById("convenienceLabel").textContent);
    const total = amount + gst + convenienceFee;
    document.getElementById("totalLabel").textContent = total.toFixed(2);
}

// Apply Promo Code (Simple Simulation)
document.getElementById("applyPromoBtn").addEventListener("click", () => {
    const promoCode = document.getElementById("promoCode").value.trim();
    const promoMessage = document.getElementById("promoMessage");
    if (promoCode === "SAVE10") {
        const amount = parseFloat(document.getElementById("amountLabel").textContent);
        const discount = amount * 0.10; // 10% off
        document.getElementById("amountLabel").textContent = (amount - discount).toFixed(2);
        promoMessage.innerHTML = "<p class='text-success'>Promo applied! 10% discount added.</p>";
        updateTotal();
    } else {
        promoMessage.innerHTML = "<p class='text-danger'>Invalid promo code.</p>";
    }
});

// Razorpay Payment Processing
function processPayment() {
    if (!selectedPaymentMethod) {
        alert("Please select a payment method.");
        return;
    }

    const total = parseFloat(document.getElementById("totalLabel").textContent);
    const mobileNumber = localStorage.getItem("mobileNumber");

    const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Replace with your Razorpay test key
        amount: total * 100, // Amount in paise
        currency: "INR",
        name: "VoltMobi",
        description: `Recharge for ${planDetails.name}`,
        image: "/Users/img/212268702.png",
        handler: function (response) {
            clearInterval(timerInterval); // Stop timer on success
            showSuccessModal(response.razorpay_payment_id, total);
        },
        prefill: {
            name: "User Name", // Replace with dynamic user data if available
            email: "user@example.com",
            contact: mobileNumber
        },
        theme: {
            color: "#B68D40" // Bronze Gold from recharge.css
        },
        modal: {
            ondismiss: function () {
                document.getElementById("paymentLoader").style.display = "none";
                document.getElementById("payButton").disabled = false;
            }
        }
    };

    document.getElementById("paymentLoader").style.display = "block";
    document.getElementById("payButton").disabled = true;

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function (response) {
        showErrorModal(response.error.description);
    });
    rzp.open();
}

// Show Success Modal
function showSuccessModal(paymentId, amount) {
    document.getElementById("transactionId").textContent = paymentId;
    document.getElementById("transactionMobile").textContent = localStorage.getItem("mobileNumber");
    const now = new Date();
    document.getElementById("transactionDate").textContent = now.toLocaleDateString();
    document.getElementById("transactionTime").textContent = now.toLocaleTimeString();
    document.getElementById("transactionPaymentMethod").textContent = selectedPaymentMethod;
    document.getElementById("transactionAmount").textContent = `₹${amount.toFixed(2)}`;
    document.getElementById("transactionGift").textContent = selectedPaymentMethod === "upi" ? "10% Cashback" : "N/A";

    const modal = new bootstrap.Modal(document.getElementById("paymentSuccessModal"));
    modal.show();

    // Countdown for redirect
    let countdown = 10;
    const countdownElement = document.getElementById("countdown");
    const progressBar = document.getElementById("progressBar");
    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        progressBar.style.width = `${(10 - countdown) * 10}%`;
        if (countdown <= 0) {
            clearInterval(interval);
            redirectToDashboard();
        }
    }, 1000);
}

// Show Error Modal
function showErrorModal(errorMessage) {
    document.getElementById("paymentLoader").style.display = "none";
    document.getElementById("payButton").disabled = false;
    document.getElementById("errorMessage").textContent = errorMessage;
    const modal = new bootstrap.Modal(document.getElementById("paymentErrorModal"));
    modal.show();
}

// Redirect Functions
function redirectToRecharge() {
    localStorage.removeItem("selectedPlanId");
    window.location.href = "/Users/html/RechargePlans.html";
}

function redirectToDashboard() {
    localStorage.removeItem("selectedPlanId");
    window.location.href = "/Users/html/dashboard.html"; // Adjust to your dashboard URL
}

// Event Listeners
document.getElementById("payButton").addEventListener("click", processPayment);
document.getElementById("retryPaymentBtn").addEventListener("click", () => {
    bootstrap.Modal.getInstance(document.getElementById("paymentErrorModal")).hide();
    processPayment();
});

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    loadPaymentPage();
    setupPaymentOptions();
});