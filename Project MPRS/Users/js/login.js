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

function validatePhoneNumber(phoneNumber) {
    const regex = /^[6789]\d{9}$/;
    return regex.test(phoneNumber);
}

async function sendOtp() {
    let phoneNumber = phoneNumberInput.value.trim();

    if (!validatePhoneNumber(phoneNumber)) {
        errorMsg.textContent = "Enter a valid 10-digit mobile number (starting with 6,7,8,9).";
        return;
    }
    errorMsg.textContent = "";

    const fullPhoneNumber = `+91${phoneNumber}`;

    try {
        const response = await fetch("http://localhost:8083/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate OTP");
        }

        localStorage.setItem("userPhone", fullPhoneNumber);
        displayPhoneNumber.textContent = fullPhoneNumber;
        otpModal.show();
        startOtpTimer();
        otpInputs[0].focus();
    } catch (error) {
        console.error("Error sending OTP:", error);
        alert(error.message || "Failed to send OTP. Try again.");
    }
}

async function verifyOtp() {
    const phoneNumber = localStorage.getItem("userPhone");
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
        localStorage.setItem("authToken", data.token);

        otpInputs.forEach((input) => (input.value = ""));

        window.location.href = "/Users/html/dashboard.html";
    } catch (error) {
        console.error("OTP verification failed:", error);
        alert("Something went wrong. Try again.");
    }
}

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

resendOtpButton.addEventListener("click", async () => {
    try {
        await sendOtp();
    } catch (error) {
        console.error("Failed to resend OTP:", error);
        alert("Failed to resend OTP. Try again.");
    }
});

sendOtpButton.addEventListener("click", (e) => {
    e.preventDefault();
    sendOtp();
});

verifyOtpButton.addEventListener("click", (e) => {
    e.preventDefault();
    verifyOtp();
});

document.addEventListener("DOMContentLoaded", () => {
    phoneNumberInput.focus();
});