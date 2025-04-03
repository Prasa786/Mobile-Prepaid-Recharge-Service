const apiBaseUrl = "http://localhost:8080/api";

let selectedPaymentMethod = null;
let planDetails = null;
let timerInterval;

document.addEventListener("DOMContentLoaded", initializePaymentPage);

async function initializePaymentPage() {
    try {
        await loadPlanDetails();
        setupPaymentOptions();
        setupEventListeners();
    } catch (error) {
        console.error("Initialization error:", error);
        showError("Failed to initialize payment page");
    }
}

async function loadPlanDetails() {
    const planId = localStorage.getItem("selectedPlanId");
    const mobileNumber = localStorage.getItem("mobileNumber");

    if (!planId || !mobileNumber) {
        redirectToRechargePlans("No plan or mobile number selected");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/recharge-plans/${planId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        planDetails = await response.json();
        updatePlanDisplay();
        startOrderTimer();
    } catch (error) {
        console.error("Error loading plan:", error);
        redirectToRechargePlans("Failed to load plan details");
    }
}

function updatePlanDisplay() {
    if (!planDetails) return;

    document.getElementById("summaryPlanName").textContent = planDetails.name;
    document.getElementById("summaryPrice").textContent = planDetails.price.toFixed(2);
    document.getElementById("summaryData").textContent = 
        planDetails.dataLimit ? `${planDetails.dataLimit} GB` : "N/A";
    document.getElementById("summarySms").textContent = 
        planDetails.smsCount > 0 ? `${planDetails.smsCount} SMS` : "N/A";
    document.getElementById("summaryCalls").textContent = 
        planDetails.callMinutes > 0 ? `${planDetails.callMinutes} mins` : "Unlimited";

    calculatePaymentTotal();
    document.getElementById("payButton").disabled = false;
}

function calculatePaymentTotal() {
    if (!planDetails) return;

    const amount = parseFloat(planDetails.price);
    const gst = amount * 0.18;
    const convenienceFee = selectedPaymentMethod === "upi" ? 0 : 10;
    const total = amount + gst + convenienceFee;

    document.getElementById("amountLabel").textContent = amount.toFixed(2);
    document.getElementById("gstlabel").textContent = gst.toFixed(2);
    document.getElementById("convenienceLabel").textContent = convenienceFee.toFixed(2);
    document.getElementById("totalLabel").textContent = total.toFixed(2);

    document.getElementById("emiOption").style.display = total > 500 ? "block" : "none";
}

function setupPaymentOptions() {
    document.querySelectorAll(".payment-option").forEach(option => {
        option.addEventListener("click", () => {
            document.querySelectorAll(".payment-option").forEach(opt => {
                opt.classList.remove("active");
            });
            
            option.classList.add("active");
            selectedPaymentMethod = option.getAttribute("data-method");
            
            calculatePaymentTotal();
        });
    });
}

function setupEventListeners() {
    document.getElementById("payButton").addEventListener("click", processPayment);
    document.getElementById("applyPromoBtn").addEventListener("click", applyPromoCode);
    document.getElementById("retryPaymentBtn").addEventListener("click", retryPayment);
}

function startOrderTimer() {
    let timeLeft = 15 * 60;
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
            redirectToRechargePlans("Payment time expired");
        }
    }, 1000);
}

function applyPromoCode() {
    const promoCode = document.getElementById("promoCode").value.trim();
    const promoMessage = document.getElementById("promoMessage");
    
    if (promoCode === "SAVE10") {
        const amountElement = document.getElementById("amountLabel");
        const currentAmount = parseFloat(amountElement.textContent);
        const discount = currentAmount * 0.10;
        amountElement.textContent = (currentAmount - discount).toFixed(2);
        promoMessage.innerHTML = "<p class='text-success'>Promo applied! 10% discount added.</p>";
        calculatePaymentTotal();
    } else {
        promoMessage.innerHTML = "<p class='text-danger'>Invalid promo code.</p>";
    }
}

async function processPayment() {
    if (!selectedPaymentMethod) {
        showError("Please select a payment method");
        return;
    }

    if (!planDetails) {
        showError("Plan details not loaded");
        return;
    }

    const total = parseFloat(document.getElementById("totalLabel").textContent);
    const mobileNumber = localStorage.getItem("mobileNumber");

    const options = {
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: total * 100,
        currency: "INR",
        name: "VoltMobi",
        description: `Recharge for ${planDetails.name}`,
        image: "/Users/img/212268702.png",
        handler: async (response) => {
            try {
                await handleSuccessfulPayment(response, total);
            } catch (error) {
                handlePaymentError(error, response.razorpay_payment_id);
            }
        },
        prefill: {
            name: "Customer",
            email: "customer@example.com",
            contact: mobileNumber
        },
        theme: { color: "#B68D40" },
        modal: {
            ondismiss: () => {
                document.getElementById("paymentLoader").style.display = "none";
                document.getElementById("payButton").disabled = false;
            }
        }
    };

    document.getElementById("paymentLoader").style.display = "block";
    document.getElementById("payButton").disabled = true;

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", (response) => {
        showErrorModal(response.error.description);
    });
    rzp.open();
}

async function handleSuccessfulPayment(response, amount) {
    clearInterval(timerInterval);
    
    try {
        const paymentData = {
            razorpayId: response.razorpay_payment_id,
            amount: amount,
            method: selectedPaymentMethod,
            planId: localStorage.getItem("selectedPlanId"),
            mobile: localStorage.getItem("mobileNumber")
        };

        await savePaymentDetails(paymentData);
        showSuccessModal(response.razorpay_payment_id, amount);
    } catch (error) {
        throw error;
    } finally {
        document.getElementById("paymentLoader").style.display = "none";
    }
}

async function savePaymentDetails(paymentData) {
    const response = await fetch(`${apiBaseUrl}/payments/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save payment details");
    }
}

function showSuccessModal(paymentId, amount) {
    const now = new Date();
    
    document.getElementById("transactionId").textContent = paymentId;
    document.getElementById("transactionMobile").textContent = localStorage.getItem("mobileNumber");
    document.getElementById("transactionDate").textContent = now.toLocaleDateString();
    document.getElementById("transactionTime").textContent = now.toLocaleTimeString();
    document.getElementById("transactionPaymentMethod").textContent = selectedPaymentMethod;
    document.getElementById("transactionAmount").textContent = `₹${amount.toFixed(2)}`;
    document.getElementById("transactionGift").textContent = selectedPaymentMethod === "upi" ? "10% Cashback" : "N/A";
    
    document.getElementById("transactionPlanName").textContent = planDetails.name;
    document.getElementById("transactionPlanDetails").textContent = 
        `${planDetails.dataLimit}GB | ${planDetails.validityDays} Days`;
    
    const modal = new bootstrap.Modal(document.getElementById("paymentSuccessModal"));
    modal.show();

    startRedirectCountdown();
}

function startRedirectCountdown() {
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

function showErrorModal(message) {
    document.getElementById("errorMessage").textContent = message;
    const modal = new bootstrap.Modal(document.getElementById("paymentErrorModal"));
    modal.show();
}

function retryPayment() {
    bootstrap.Modal.getInstance(document.getElementById("paymentErrorModal")).hide();
    processPayment();
}

function redirectToRechargePlans(message) {
    if (message) alert(message);
    localStorage.removeItem("selectedPlanId");
    window.location.href = "/Users/html/RechargePlans.html";
}

function redirectToDashboard() {
    localStorage.removeItem("selectedPlanId");
    window.location.href = "/Users/html/dashboard.html";
}

function showError(message) {
    console.error(message);
    alert(message);
}