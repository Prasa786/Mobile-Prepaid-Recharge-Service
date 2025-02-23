document.addEventListener("DOMContentLoaded", function () {
    // Load plan details from localStorage
    const planName = localStorage.getItem("planName");
    const planPrice = localStorage.getItem("planPrice");
    const planData = localStorage.getItem("planData");
    const planSms = localStorage.getItem("planSms");
    const planCalls = localStorage.getItem("planCalls");

    // Display plan details
    document.getElementById("summaryPlanName").innerText = `Plan: ${planName}`;
    document.getElementById("summaryPrice").innerText = `Price: ₹${planPrice}`;
    document.getElementById("summaryData").innerText = `Data: ${planData}`;
    document.getElementById("summarySms").innerText = `SMS: ${planSms}`;
    document.getElementById("summaryCalls").innerText = `Calls: ${planCalls}`;

    // Calculate GST and Total Amount
    const gst = (parseFloat(planPrice) * 0.18).toFixed(2);
    const totalAmount = (parseFloat(planPrice) + parseFloat(gst)).toFixed(2);

    // Display payment summary
    document.getElementById("amountLabel").innerText = `Amount: ₹${planPrice}`;
    document.getElementById("gstlabel").innerText = `GST (18%): ₹${gst}`;
    document.getElementById("totalLabel").innerText = `Total Amount: ₹${totalAmount}`;

    // Add event listeners to sidebar payment options
    document.querySelectorAll(".sidebar .payment-option").forEach((option) => {
        option.addEventListener("click", function () {
            // Remove active class from all options
            document.querySelectorAll(".sidebar .payment-option").forEach((opt) => {
                opt.classList.remove("active");
            });

            // Add active class to the clicked option
            this.classList.add("active");

            // Show corresponding payment method
            const method = this.getAttribute("data-method");
            document.getElementById("paymentOptions").innerHTML = getPaymentOptions(method);
            validatePayment();
        });
    });

    // Handle form submission
    const paymentForm = document.getElementById("payment-form");
    if (paymentForm) {
        paymentForm.addEventListener("submit", handlePaymentSubmit);
    } else {
        console.error("Form with id 'payment-form' not found!");
    }

    // Load wallet balance and payment history
    loadWalletBalance();
    loadPaymentHistory();
});

function loadWalletBalance() {
    const walletBalance = Math.floor(Math.random() * 1000).toFixed(2);
    document.getElementById("walletBalance").innerText = `₹${walletBalance}`;
}

function loadPaymentHistory() {
    const recentPayments = [
        { id: "123456", amount: "₹299", date: "2023-10-01", method: "UPI" },
        { id: "789012", amount: "₹499", date: "2023-09-25", method: "Wallet" },
    ];

    const recentPaymentsList = document.getElementById("recentPayments");
    if (recentPaymentsList) {
        recentPaymentsList.innerHTML = recentPayments
            .map(
                (payment) => `
                <li class="text-light">
                    <strong>Transaction ID:</strong> ${payment.id}<br>
                    <strong>Amount:</strong> ${payment.amount}<br>
                    <strong>Date:</strong> ${payment.date}<br>
                    <strong>Method:</strong> ${payment.method}
                </li>
            `
            )
            .join("");
    }
}

function getPaymentOptions(method) {
    if (method === "upi") {
        return `
            <div class="upi-options">
                <label class="text-light">Select UPI Provider</label>
                <div class="payment-option" data-provider="Google Pay">
                    <input type="radio" name="upiProvider" id="googlePay">
                    <img src="img/gpay.png" alt="Google Pay" class="payment-icon">
                    <label for="googlePay" class="text-light">Google Pay</label>
                </div>
                <div class="payment-option" data-provider="PhonePe">
                    <input type="radio" name="upiProvider" id="phonePe">
                    <img src="img/phonepe.png" alt="PhonePe" class="payment-icon">
                    <label for="phonePe" class="text-light">PhonePe</label>
                </div>
                <div class="payment-option" data-provider="Paytm">
                    <input type="radio" name="upiProvider" id="paytm">
                    <img src="img/Paytm.png" alt="Paytm" class="payment-icon">
                    <label for="paytm" class="text-light">Paytm</label>
                </div>
            </div>
        `;
    } else if (method === "card") {
        return `
            <div class="card-inputs">
                <div class="form-group">
                    <label for="cardNumber" class="text-light">Card Information</label>
                    <input type="text" class="form-control" id="cardNumber" placeholder="Card Number">
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" placeholder="MM/YY">
                    </div>
                    <div class="form-group col-md-6">
                        <input type="text" class="form-control" placeholder="CVV">
                    </div>
                </div>
            </div>
        `;
    } else if (method === "netbanking") {
        return `
            <div class="bank-options">
                <label class="text-light">Select a Bank</label>
                <div class="payment-option" data-bank="SBI">
                    <input type="radio" name="bank" id="sbi">
                    <img src="img/sbi.png" alt="SBI" class="payment-icon">
                    <label for="sbi" class="text-light">SBI</label>
                </div>
                <div class="payment-option" data-bank="HDFC">
                    <input type="radio" name="bank" id="hdfc">
                    <img src="img/hdfc.png" alt="HDFC" class="payment-icon">
                    <label for="hdfc" class="text-light">HDFC</label>
                </div>
            </div>
        `;
    } else if (method === "wallet") {
        return `
            <div class="wallet-options">
                <label class="text-light">Select Wallet</label>
                <div class="payment-option" data-wallet="Paytm Wallet">
                    <input type="radio" name="wallet" id="paytmWallet">
                    <img src="img/paytm-wallet.png" alt="Paytm Wallet" class="payment-icon">
                    <label for="paytmWallet" class="text-light">Paytm Wallet</label>
                </div>
                <div class="payment-option" data-wallet="PhonePe Wallet">
                    <input type="radio" name="wallet" id="phonepeWallet">
                    <img src="img/phonepe-wallet.png" alt="PhonePe Wallet" class="payment-icon">
                    <label for="phonepeWallet" class="text-light">PhonePe Wallet</label>
                </div>
            </div>
        `;
    }
    return "";
}

function handlePaymentSubmit(event) {
    event.preventDefault(); // Prevent form submission

    // Get the selected payment method
    const selectedPaymentMethod = document.querySelector(".sidebar .payment-option.active")?.getAttribute("data-method");

    // Get the selected provider (UPI, Bank, Wallet, etc.)
    let selectedProvider = "";
    if (selectedPaymentMethod === "upi") {
        selectedProvider = document.querySelector("input[name='upiProvider']:checked")?.parentElement.getAttribute("data-provider");
    } else if (selectedPaymentMethod === "netbanking") {
        selectedProvider = document.querySelector("input[name='bank']:checked")?.parentElement.getAttribute("data-bank");
    } else if (selectedPaymentMethod === "wallet") {
        selectedProvider = document.querySelector("input[name='wallet']:checked")?.parentElement.getAttribute("data-wallet");
    }

    // Display payment success modal
    const gift = getGift(selectedPaymentMethod);
    document.getElementById("transactionId").textContent = Math.floor(10000000 + Math.random() * 90000000).toString();
    document.getElementById("transactionDate").textContent = new Date().toLocaleDateString();
    document.getElementById("transactionTime").textContent = new Date().toLocaleTimeString();
    document.getElementById("transactionPaymentMethod").textContent = `${selectedPaymentMethod} (${selectedProvider})`;
    document.getElementById("transactionGift").textContent = gift;

    // Show the modal
    $('#paymentSuccessModal').modal('show');
}

function getGift(method) {
    switch (method) {
        case "upi":
            return "5 GB Data Free for 3 Days";
        case "card":
            return "10% Cashback on Next Recharge";
        case "netbanking":
            return "Free SMS Pack for 7 Days";
        case "wallet":
            return "₹50 Wallet Cashback";
        default:
            return "No Gift";
    }
}

function redirectToRecharge() {
    window.location.href = "recharge.html";
}

function redirectToDashboard() {
    window.location.href = "dashboard.html";
}

function validatePayment() {
    const selectedPaymentMethod = document.querySelector(".sidebar .payment-option.active")?.getAttribute("data-method");
    let isValid = false;

    if (selectedPaymentMethod === "upi") {
        isValid = document.querySelector("input[name='upiProvider']:checked") !== null;
    } else if (selectedPaymentMethod === "netbanking") {
        isValid = document.querySelector("input[name='bank']:checked") !== null;
    } else if (selectedPaymentMethod === "wallet") {
        isValid = document.querySelector("input[name='wallet']:checked") !== null;
    } else if (selectedPaymentMethod === "card") {
        isValid = document.getElementById("cardNumber").value.trim() !== "" &&
                  document.querySelector(".card-inputs input[placeholder='MM/YY']").value.trim() !== "" &&
                  document.querySelector(".card-inputs input[placeholder='CVV']").value.trim() !== "";
    }

    const payButton = document.getElementById("payButton");
    if (payButton) {
        payButton.disabled = !isValid;
    } else {
        console.error("Pay button with id 'payButton' not found!");
    }
}