
document.addEventListener("DOMContentLoaded", function () {
    
    const planName = localStorage.getItem("planName");
    const planPrice = localStorage.getItem("planPrice");
    const planData = localStorage.getItem("planData");
    const planSms = localStorage.getItem("planSms");
    const planCalls = localStorage.getItem("planCalls");

    
    document.getElementById("summaryPlanName").innerText = `Plan: ${planName}`;
    document.getElementById("summaryPrice").innerText = `Price: ₹${planPrice}`;
    document.getElementById("summaryData").innerText = `Data: ${planData}`;
    document.getElementById("summarySms").innerText = `SMS: ${planSms}`;
    document.getElementById("summaryCalls").innerText = `Calls: ${planCalls}`;

    
    const gst = (parseFloat(planPrice) * 0.18).toFixed(2); 
    const totalAmount = (parseFloat(planPrice) + parseFloat(gst)).toFixed(2);

    
    document.getElementById("amountLabel").innerText = `Amount: ₹${planPrice}`;
    document.getElementById("gstlabel").innerText = `GST (18%): ₹${gst}`;
    document.getElementById("totalLabel").innerText = `Total Amount: ₹${totalAmount}`;

    
    document.getElementById("paymentMethod").addEventListener("change", togglePaymentInputs);
    document.getElementById("payment-form").addEventListener("submit", handlePaymentSubmit);

    
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


function togglePaymentInputs() {
    const paymentMethod = document.getElementById("paymentMethod").value;
    const paymentOptions = document.getElementById("paymentOptions");

    if (paymentMethod) {
        paymentOptions.innerHTML = getPaymentOptions(paymentMethod);
        paymentOptions.classList.add("active");

        
        if (paymentMethod === "upi") {
            document.querySelectorAll("input[name='upiProvider']").forEach((input) => {
                input.addEventListener("change", validatePayment);
            });
        } else if (paymentMethod === "netbanking") {
            document.querySelectorAll("input[name='bank']").forEach((input) => {
                input.addEventListener("change", validatePayment);
            });
        } else if (paymentMethod === "wallet") {
            document.querySelectorAll("input[name='wallet']").forEach((input) => {
                input.addEventListener("change", validatePayment);
            });
        }

        validatePayment(); 
    } else {
        paymentOptions.classList.remove("active");
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
    event.preventDefault(); 

    const paymentMethod = document.getElementById("paymentMethod").value;
    const gift = getGift(paymentMethod);

    
    document.getElementById("transactionId").textContent = Math.floor(10000000 + Math.random() * 90000000).toString();
    document.getElementById("transactionDate").textContent = new Date().toLocaleDateString();
    document.getElementById("transactionTime").textContent = new Date().toLocaleTimeString();
    document.getElementById("transactionPaymentMethod").textContent = paymentMethod;
    document.getElementById("transactionGift").textContent = gift;

    
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
    const paymentMethod = document.getElementById("paymentMethod").value;
    let isValid = false;

    if (paymentMethod === "upi") {
        isValid = document.querySelector("input[name='upiProvider']:checked") !== null;
    } else if (paymentMethod === "netbanking") {
        isValid = document.querySelector("input[name='bank']:checked") !== null;
    } else if (paymentMethod === "wallet") {
        isValid = document.querySelector("input[name='wallet']:checked") !== null;
    }

    document.getElementById("payButton").disabled = !isValid;
}