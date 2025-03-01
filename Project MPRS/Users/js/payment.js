document.addEventListener("DOMContentLoaded", function () {
    // Plan summary initialization
    const planName = localStorage.getItem("planName") || "Premium Plan";
    const planPrice = localStorage.getItem("planPrice") || "499";
    const planDetails = localStorage.getItem("planDetails") || "1.5GB/day";
    const planValidity = localStorage.getItem("planValidity") || "28 days";
    const planCalls = localStorage.getItem("planCalls") || "Unlimited";

    document.getElementById("summaryPlanName").innerText = `Plan: ${planName}`;
    document.getElementById("summaryPrice").innerText = `Price: ₹${planPrice}`;
    document.getElementById("summaryData").innerText = `Details: ${planDetails}`;
    document.getElementById("summarySms").innerText = `Validity: ${planValidity}`;
    document.getElementById("summaryCalls").innerText = `Calls: ${planCalls}`;

    const amount = parseFloat(planPrice);
    const gst = (amount * 0.18).toFixed(2);
    const totalAmount = (amount + parseFloat(gst)).toFixed(2);

    document.getElementById("amountLabel").innerText = `Amount: ₹${amount.toFixed(2)}`;
    document.getElementById("gstlabel").innerText = `GST (18%): ₹${gst}`;
    document.getElementById("totalLabel").innerText = `Total Amount: ₹${totalAmount}`;

    if (amount > 500) {
        document.getElementById("emiOption").style.display = "block";
    }

    // Payment options handling
    document.querySelectorAll(".sidebar .payment-option").forEach((option) => {
        option.addEventListener("click", function () {
            document.querySelectorAll(".sidebar .payment-option").forEach((opt) => {
                opt.classList.remove("active");
            });

            this.classList.add("active");
            const method = this.getAttribute("data-method");
            document.getElementById("paymentOptions").innerHTML = getPaymentOptions(method);
            updateConvenienceFee(method);
            setupFormValidation(method);
            validatePayment();
        });
    });

    // Default selection
    document.querySelector(".sidebar .payment-option[data-method='upi']").click();

    // Form submission
    const paymentForm = document.getElementById("payment-form");
    if (paymentForm) {
        paymentForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!validatePaymentForm()) return;

            document.getElementById("paymentLoader").style.display = "block";
            document.getElementById("payButton").disabled = true;

            setTimeout(() => {
                document.getElementById("paymentLoader").style.display = "none";
                const paymentSuccess = Math.random() < 0.9;
                if (paymentSuccess) {
                    handleSuccessfulPayment();
                } else {
                    showPaymentError();
                }
            }, 2000);
        });
    }

    startOrderTimer();
    document.getElementById("applyPromoBtn").addEventListener("click", applyPromoCode);
    document.getElementById("retryPaymentBtn").addEventListener("click", function () {
        $('#paymentErrorModal').modal('hide');
        document.getElementById("payButton").disabled = false;
    });
    $('#paymentSuccessModal').on('shown.bs.modal', startCountdown);
});

function startOrderTimer() {
    let minutes = 15;
    let seconds = 0;
    const timerElement = document.getElementById("orderTimer");
    const interval = setInterval(() => {
        if (seconds <= 0) {
            if (minutes <= 0) {
                clearInterval(interval);
                timerElement.textContent = "00:00";
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        if (minutes < 5) timerElement.style.color = "#ff6b6b";
    }, 1000);
}

function updateConvenienceFee(method) {
    const fee = { card: 5.00, netbanking: 3.50, wallet: 2.00, upi: 0 }[method] || 0;
    document.getElementById("convenienceLabel").innerHTML = `Convenience Fee: ₹${fee.toFixed(2)} <i class="fas fa-info-circle"></i>`;
    const amount = parseFloat(document.getElementById("amountLabel").innerText.split("₹")[1]);
    const gst = parseFloat(document.getElementById("gstlabel").innerText.split("₹")[1]);
    document.getElementById("totalLabel").innerText = `Total Amount: ₹${(amount + gst + fee).toFixed(2)}`;
}

function getPaymentOptions(method) {
    const options = {
        upi: `
            <div class="form-group">
                <label for="upiId">UPI ID</label>
                <input type="text" class="form-control" id="upiId" placeholder="Enter your UPI ID" required>
                <div class="invalid-feedback">Please enter a valid UPI ID.</div>
            </div>
            <div class="form-group">
                <label for="upiApp">Choose UPI App</label>
                <select class="form-control" id="upiApp" required>
                    <option value="">Select UPI App</option>
                    <option value="gpay">Google Pay</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="paytm">Paytm</option>
                    <option value="others">Others</option>
                </select>
                <div class="invalid-feedback">Please select a UPI app.</div>
            </div>`,
        card: `
            <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" class="form-control" id="cardNumber" placeholder="Enter card number" required>
                <div class="invalid-feedback">Please enter a valid card number.</div>
            </div>
            <div class="form-row">
                <div class="form-group col-md-6">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="text" class="form-control" id="expiryDate" placeholder="MM/YY" required>
                    <div class="invalid-feedback">Please enter a valid expiry date.</div>
                </div>
                <div class="form-group col-md-6">
                    <label for="cvv">CVV</label>
                    <input type="text" class="form-control" id="cvv" placeholder="CVV" required>
                    <div class="invalid-feedback">Please enter a valid CVV.</div>
                </div>
            </div>
            <div class="form-group">
                <label for="cardHolderName">Cardholder Name</label>
                <input type="text" class="form-control" id="cardHolderName" placeholder="Enter cardholder name" required>
                <div class="invalid-feedback">Please enter the cardholder's name.</div>
            </div>
            <div class="save-card-container">
                <input type="checkbox" id="saveCard">
                <label for="saveCard">Save this card for future payments</label>
            </div>`,
        netbanking: `
            <div class="form-group">
                <label for="bankName">Select Bank</label>
                <select class="form-control" id="bankName" required>
                    <option value="">Select Bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="others">Other Banks</option>
                </select>
                <div class="invalid-feedback">Please select a bank.</div>
            </div>`,
        wallet: `
            <div class="form-group">
                <label for="walletType">Select Wallet</label>
                <select class="form-control" id="walletType" required>
                    <option value="">Select Wallet</option>
                    <option value="paytm">Paytm</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="amazonpay">Amazon Pay</option>
                    <option value="others">Other Wallets</option>
                </select>
                <div class="invalid-feedback">Please select a wallet.</div>
            </div>`
    };
    return options[method] || '';
}

function setupFormValidation(method) {
    const inputs = document.querySelectorAll('#paymentOptions input, #paymentOptions select');
    inputs.forEach(input => {
        input.addEventListener('input', validatePayment);
        input.addEventListener('change', validatePayment);
    });
}

function validatePaymentForm() {
    const method = document.querySelector(".sidebar .payment-option.active")?.getAttribute("data-method");
    if (!method) return false;

    let isValid = true;
    const inputs = document.querySelectorAll('#paymentOptions input, #paymentOptions select');
    
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
        if (input.required && !input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        }
    });

    return isValid;
}

function validatePayment() {
    const isValid = validatePaymentForm();
    document.getElementById("payButton").disabled = !isValid;
}

function handleSuccessfulPayment() {
    const transactionId = Math.floor(Math.random() * 1000000000).toString();
    const now = new Date();
    const method = document.querySelector(".sidebar .payment-option.active").getAttribute("data-method");
    const totalAmount = document.getElementById("totalLabel").innerText.split("₹")[1];
    const mobileNumber = localStorage.getItem("mobileNumber");

    document.getElementById("transactionId").innerText = transactionId;
    document.getElementById("transactionDate").innerText = now.toLocaleDateString();
    document.getElementById("transactionTime").innerText = now.toLocaleTimeString();
    document.getElementById("transactionPaymentMethod").innerText = method.toUpperCase();
    document.getElementById("transactionAmount").innerText = `₹${totalAmount}`;
    document.getElementById("transactionGift").innerText = "5GB Extra Data";

    // Add mobile number to transaction details
    const transactionDetails = document.querySelector("#paymentSuccessModal .transaction-details");
    const mobilePara = document.createElement("p");
    mobilePara.innerHTML = `<strong>Mobile Number:</strong> +91 ${mobileNumber}`;
    transactionDetails.insertBefore(mobilePara, transactionDetails.querySelector("p:nth-child(2)"));

    $('#paymentSuccessModal').modal('show');
}

function startCountdown() {
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

function redirectToDashboard() {
    window.location.href = "dashboard.html";
}

function redirectToRecharge() {
    window.location.href = "RechargePlans.html";
}

function applyPromoCode() {
    const promoCode = document.getElementById("promoCode").value.trim();
    const promoMessage = document.getElementById("promoMessage");
    const amount = parseFloat(document.getElementById("amountLabel").innerText.split("₹")[1]);
    const gst = parseFloat(document.getElementById("gstlabel").innerText.split("₹")[1]);
    const convenienceFee = parseFloat(document.getElementById("convenienceLabel").innerText.split("₹")[1]);

    if (promoCode === "VOLT10") {
        const discount = (amount * 0.1).toFixed(2);
        const totalAmount = (amount + gst + convenienceFee - parseFloat(discount)).toFixed(2);
        document.getElementById("totalLabel").innerText = `Total Amount: ₹${totalAmount}`;
        promoMessage.innerHTML = `<p class="text-success">Promo code applied! You saved ₹${discount}.</p>`;
    } else {
        promoMessage.innerHTML = `<p class="text-danger">Invalid promo code. Please try again.</p>`;
    }
}
window.onscroll = function() {
    const backToTop = document.querySelector('.back-to-top');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTop.style.display = 'flex'; // Show the button
    } else {
        backToTop.style.display = 'none'; // Hide the button
    }
};

// Function to scroll to the top of the page
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
