// Get elements
const sendOtpButton = document.getElementById("sendOtpButton");
const verifyOtpButton = document.getElementById("verifyOtpButton");
const phoneNumberInput = document.getElementById("phoneNumber");
const otpModal = new bootstrap.Modal(document.getElementById("otpModal"));
const otpInputs = document.querySelectorAll(".otp-input");
const errorMsg = document.getElementById("error-msg");
const otpErrorMessage = document.getElementById("otpErrorMessage");
const displayPhoneNumber = document.getElementById("displayPhoneNumber");
const timerElement = document.getElementById("timer");
const resendOtpButton = document.getElementById("resendOtp");

// Function to validate phone number (without +91)
function validatePhoneNumber(phoneNumber) {
    const regex = /^[6789]\d{9}$/; // Must start with 6,7,8,9 and be 10 digits long
    return regex.test(phoneNumber);
}

// Function to send OTP
async function sendOtp() {
    let phoneNumber = phoneNumberInput.value.trim();

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
        errorMsg.textContent = "Enter a valid 10-digit mobile number (starting with 6,7,8,9).";
        return;
    }
    errorMsg.textContent = "";

    // Prepend +91 to the phone number
    const fullPhoneNumber = `+91${phoneNumber}`;

    try {
        const response = await fetch("http://localhost:8083/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Parse error response
            throw new Error(errorData.error || "Failed to generate OTP");
        }

        localStorage.setItem("userPhone", fullPhoneNumber);
        displayPhoneNumber.textContent = fullPhoneNumber;
        otpModal.show(); // Show OTP modal
        startOtpTimer(); // Start timer
        otpInputs[0].focus(); // Focus first OTP input
    } catch (error) {
        console.error("Error sending OTP:", error);
        alert(error.message || "Failed to send OTP. Try again.");
    }
}

// Function to verify OTP
async function verifyOtp() {
    const phoneNumber = localStorage.getItem("userPhone"); // Retrieve full number with +91
    const enteredOTP = [...otpInputs].map((input) => input.value).join("");

    if (enteredOTP.length !== 6) {
        otpErrorMessage.textContent = "Enter a valid 6-digit OTP.";
        return;
    }

    try {
        const response = await fetch("http://localhost:8083/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber: phoneNumber, otp: enteredOTP }),
        });

        if (!response.ok) {
            otpErrorMessage.textContent = "Invalid OTP. Try again.";
            return;
        }

        const data = await response.json();
        localStorage.setItem("authToken", data.token); // Store token

        // Clear OTP inputs
        otpInputs.forEach((input) => (input.value = ""));

        window.location.href = "/Users/html/dashboard.html"; // Redirect on success
    } catch (error) {
        console.error("OTP verification failed:", error);
        alert("Something went wrong. Try again.");
    }
}

// OTP input auto-focus and backspace handling
otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && index > 0 && e.target.value.length === 0) {
            otpInputs[index - 1].focus();
        }
    });
});

// Timer for OTP expiration
let countdown;
function startOtpTimer() {
    let timeLeft = 60;
    resendOtpButton.disabled = true;

    if (countdown) clearInterval(countdown);

    countdown = setInterval(() => {
        timerElement.textContent = timeLeft + "s";
        timeLeft--;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            resendOtpButton.disabled = false;
            otpErrorMessage.textContent = "OTP expired. Request a new one.";
        }
    }, 1000);
}

// Resend OTP
resendOtpButton.addEventListener("click", async () => {
    try {
        await sendOtp();
    } catch (error) {
        console.error("Failed to resend OTP:", error);
        alert("Failed to resend OTP. Try again.");
    }
});

// Event listeners
sendOtpButton.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent form submission
    sendOtp();
});

verifyOtpButton.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent form submission
    verifyOtp();
});

// Auto-focus on phone number input
document.addEventListener("DOMContentLoaded", () => {
    phoneNumberInput.focus();
});