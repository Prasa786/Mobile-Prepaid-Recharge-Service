
    // Main variables
    const sendOtpButton = document.getElementById('sendOtpButton');
    const verifyOtpButton = document.getElementById('verifyOtpButton');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const otpModal = document.getElementById('otpModal');
    let generatedOTP;
    let countdown;
    
    // Event listeners
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Validate phone number
        var phoneNumber = phoneNumberInput.value;
        var errorMsg = document.getElementById("error-msg");
        
        if (!/^\d{10}$/.test(phoneNumber)) {
            errorMsg.textContent = "Please enter a valid 10-digit phone number.";
            return;
        } else {
            errorMsg.textContent = "";
        }
        
        // Generate OTP
        generatedOTP = generateOTP();
        console.log('Generated OTP (for testing):', generatedOTP);
        
        // Store phone number
        localStorage.setItem("userPhone", phoneNumber);
        document.getElementById("displayPhoneNumber").textContent = "+91 " + phoneNumber;
        
        // Show OTP modal
        var bootstrapModal = new bootstrap.Modal(document.getElementById("otpModal"));
        bootstrapModal.show();
        
        // Focus first OTP input
        setTimeout(focusOnFirstOtpInput, 500);
        
        // Start timer
        startOtpTimer();
        
        // Alert for testing
        alert(`Your OTP for testing is: ${generatedOTP}`);
    });
    
    verifyOtpButton.addEventListener('click', () => {
        const enteredOTP = getEnteredOTP();
        const userPhone = phoneNumberInput.value;
        
        if (enteredOTP === generatedOTP) {
            localStorage.setItem('userPhone', userPhone);
            alert("OTP verified successfully!");
            localStorage.setItem('userPhone', userPhone);
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById("otpErrorMessage").style.display = "block";
            document.getElementById("otpErrorMessage").textContent = "Incorrect OTP. Please try again.";
            
            // Shake the OTP inputs to indicate error
            const otpInputs = document.querySelectorAll(".otp-input");
            otpInputs.forEach(input => {
                input.classList.add("animation-shake");
                setTimeout(() => input.classList.remove("animation-shake"), 500);
            });
        }
    });

    
    document.getElementById("resendOtp").addEventListener('click', () => {
        generatedOTP = generateOTP();
        console.log('Generated OTP (for testing):', generatedOTP);
        
        // Clear all OTP fields
        clearOtpFields();
        
        // Hide error message
        document.getElementById("otpErrorMessage").style.display = "none";
        
        // Reset timer
        startOtpTimer();
        
        // Disable resend button again
        document.getElementById("resendOtp").disabled = true;
        
        // Alert for testing
        alert(`Your new OTP for testing is: ${generatedOTP}`);
        
        // Focus first OTP input
        focusOnFirstOtpInput();
    });
    
    // Handle OTP input fields
    const otpFields = document.querySelectorAll('.otp-field');
    otpFields.forEach((field, index) => {
        field.addEventListener('input', () => {
            if (field.value.length === 1) {
                if (index < otpFields.length - 1) {
                    otpFields[index + 1].focus();
                } else {
                    // Auto verify when last digit is entered
                    verifyOtpButton.focus();
                }
            }
        });
        
        field.addEventListener('keydown', (event) => {
            if (event.key === 'Backspace') {
                if (field.value.length === 0 && index > 0) {
                    otpFields[index - 1].focus();
                }
            }
        });
        
        field.addEventListener('paste', (event) => {
            let pasteData = event.clipboardData.getData('text');
            pasteData = pasteData.slice(0, otpFields.length - index);
            
            for (let i = 0; i < pasteData.length; i++) {
                if (index + i < otpFields.length) {
                    otpFields[index + i].value = pasteData[i];
                    if (index + i < otpFields.length - 1) {
                        otpFields[index + i + 1].focus();
                    }
                }
            }
            event.preventDefault();
        });
    });
    
    // Functions
    function getEnteredOTP() {
        let otp = "";
        for (let i = 1; i <= 6; i++) {
            const inputField = document.getElementById(`otp${i}`);
            otp += inputField.value;
        }
        return otp;
    }
    
    function focusOnFirstOtpInput() {
        document.getElementById('otp1').focus();
    }
    
    function generateOTP() {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp.toString();
    }
    
    function clearOtpFields() {
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`otp${i}`).value = '';
        }
    }
    
    function startOtpTimer() {
        let timeLeft = 60;
        const timerElement = document.getElementById("timer");
        const resendBtn = document.getElementById("resendOtp");
        
        // Enable verify button
        verifyOtpButton.disabled = false;
        
        // Clear any existing interval
        if (countdown) clearInterval(countdown);
        
        countdown = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                resendBtn.disabled = false;
                
                // Notify expiry
                document.getElementById("otpErrorMessage").style.display = "block";
                document.getElementById("otpErrorMessage").textContent = "OTP has expired. Please request a new one.";
            }
        }, 1000);
    }
    
    // Prevent non-numeric input in phone field
    phoneNumberInput.addEventListener("input", function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Apply button styling
    verifyOtpButton.style.backgroundColor = "#50C878";
    verifyOtpButton.style.color = "white";
