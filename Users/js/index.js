document.addEventListener("DOMContentLoaded", function () {
    // Constants and state
    const BASE_URL = 'http://localhost:8083'; // or your specific backend URL
    let selectedPlan = null;

    // DOM Elements
    const elements = {
        phoneNumber: document.getElementById('phoneNumber'),
        errorMessage: document.getElementById('error-message'),
        phoneNumberInput: document.getElementById('phoneNumberInput'),
        phoneError: document.getElementById('phoneError'),
        submitPhoneNumber: document.getElementById('submitPhoneNumber'),
        kycForm: document.getElementById('kycForm'),
        kycSubmitButton: document.getElementById('kycSubmitButton'),
        registerLink: document.getElementById('registerLink'),
        backToTop: document.querySelector('.back-to-top'),
        lastUpdated: document.getElementById('lastUpdated')
    };

    // Initialize the application
    function init() {
        initEventListeners();
        initCounters();
        updateStatus();
    }

    // Set up all event listeners
    function initEventListeners() {
        // Plan selection buttons
        document.querySelectorAll('[onclick^="selectPlan"]').forEach(button => {
            button.addEventListener('click', handlePlanButtonClick);
        });

        // Phone number validation
        if (elements.phoneNumber) {
            elements.phoneNumber.addEventListener('blur', validatePhoneNumber);
        }

        // Phone number modal submission
        if (elements.submitPhoneNumber) {
            elements.submitPhoneNumber.addEventListener('click', handlePhoneSubmit);
        }

        // KYC registration
        if (elements.registerLink) {
            elements.registerLink.addEventListener('click', showKYCModal);
        }

        // KYC form submission
        if (elements.kycSubmitButton) {
            elements.kycSubmitButton.addEventListener('click', submitKYC);
        }

        // Back to top button
        if (elements.backToTop) {
            elements.backToTop.addEventListener('click', scrollToTop);
            window.addEventListener('scroll', handleScroll);
        }
    }

    // Initialize animated counters
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-count');
            const increment = target / 100;
            let count = 0;
            
            const updateCounter = () => {
                if (count < target) {
                    count += increment;
                    counter.textContent = Math.ceil(count);
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = target;
                }
            };
            updateCounter();
        });
    }

    // Phone number validation
    async function validatePhoneNumber() {
        const phoneNumber = elements.phoneNumber.value;
        const fullPhoneNumber = `+91${phoneNumber}`;
        
        const validation = validateMobileNumber(phoneNumber);
        if (!validation.valid) {
            showError(elements.errorMessage, validation.message);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/api/users/check-mobile/${fullPhoneNumber}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const exists = await response.json();
            if (exists) {
                hideError(elements.errorMessage);
                localStorage.setItem('mobileNumber', fullPhoneNumber);
                window.location.href = "/Users/html/RechargePlans.html";
            } else {
                showError(elements.errorMessage, 'Phone number not registered. Please register first.');
            }
        } catch (error) {
            console.error('Error:', error);
            showError(elements.errorMessage, 'Error checking phone number. Please try again.');
        }
    }

    // Plan selection handler
    function selectPlan(name, price, validity) {
        selectedPlan = { name, price, validity };
        const mobileNumber = localStorage.getItem('mobileNumber');

        if (!mobileNumber || mobileNumber === 'null' || mobileNumber === '') {
            const modal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
            localStorage.setItem('pendingPlan', JSON.stringify(selectedPlan));
            modal.show();
        } else {
            proceedToPayment(mobileNumber);
        }
    }

    // Handle plan button clicks
    function handlePlanButtonClick(event) {
        const originalOnClick = event.currentTarget.getAttribute('onclick');
        const phoneNumber = elements.phoneNumber?.value;
        
        if (phoneNumber) {
            const validation = validateMobileNumber(phoneNumber);
            if (validation.valid) {
                const fullPhoneNumber = `+91${phoneNumber}`;
                localStorage.setItem('mobileNumber', fullPhoneNumber);
                eval(originalOnClick);
            } else {
                const modal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
                modal.show();
                document.getElementById('phoneNumberModal').setAttribute('data-original-click', originalOnClick);
            }
        } else {
            const modal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
            modal.show();
            document.getElementById('phoneNumberModal').setAttribute('data-original-click', originalOnClick);
        }
    }

    function proceedToPayment(mobileNumber) {
        if (!selectedPlan) return;

        const planDetails = {
            "Basic Plan": { data: "1GB/day", sms: "100 SMS/day", calls: "Unlimited" },
            "Popular Plan": { data: "2GB/day", sms: "100 SMS/day", calls: "Unlimited" },
            "Premium Plan": { data: "3GB/day", sms: "100 SMS/day", calls: "Unlimited" },
            "Ultimate Plan": { data: "5GB/day", sms: "100 SMS/day", calls: "Unlimited" }
        }[selectedPlan.name];

        localStorage.setItem("planName", selectedPlan.name);
        localStorage.setItem("planPrice", selectedPlan.price);
        localStorage.setItem("planValidity", selectedPlan.validity);
        localStorage.setItem("planData", planDetails.data);
        localStorage.setItem("planSms", planDetails.sms);
        localStorage.setItem("planCalls", planDetails.calls);
        localStorage.setItem("mobileNumber", mobileNumber);

        window.location.href = "/Users/html/payment.html";
    }

    async function handlePlanSelection(planName, planPrice, validity) {
        // Store selected plan details
        const selectedPlan = {
            name: selectPlan.planName,
            price: planPrice,
            validity: validity
        };
        
        // Show modal for phone number input
        const modal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
        modal.show();
    
        // Handle phone number submission
        const submitButton = document.getElementById('submitPhoneNumber');
        const phoneInput = document.getElementById('phoneNumberInput');
        const phoneError = document.getElementById('phoneError');
        
        submitButton.onclick = async function() {
            const phoneNumber = phoneInput.value.trim();
            const fullPhoneNumber = `+91${phoneNumber}`;
    
            // Validate phone number
            if (!/^\d{10}$/.test(phoneNumber)) {
                phoneError.textContent = "Please enter a valid 10-digit mobile number";
                phoneError.style.display = 'block';
                return;
            }
    
            if (/^[01]/.test(phoneNumber)) {
                phoneError.textContent = "Mobile number cannot start with 0 or 1";
                phoneError.style.display = 'block';
                return;
            }
    
            try {
                submitButton.disabled = true;
                submitButton.textContent = 'Checking...';
    
                // Check if mobile number exists in database
                const response = await fetch(`http://localhost:8083/api/users/check-mobile/+91${fullPhoneNumber}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const exists = await response.json();
                
                if (exists) {
                    // Store plan details and phone number
                    localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
                    localStorage.setItem('mobileNumber', fullPhoneNumber);
                    
                    // Hide modal and redirect to payment page
                    modal.hide();
                    window.location.href = "/Users/html/payment.html";
                } else {
                    phoneError.textContent = "Phone number not registered. Please register first.";
                    phoneError.style.display = 'block';
                }
            } catch (error) {
                console.error('Error:', error);
                phoneError.textContent = "An error occurred. Please try again.";
                phoneError.style.display = 'block';
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit';
            }
        };
    }
    // Proceed to payment with selected plan

    // Handle phone number submission in modal
    async function handlePhoneSubmit() {
        const phoneNumberInput = elements.phoneNumberInput.value;
        const fullPhoneNumber = `+91${phoneNumberInput}`;
        
        const validation = validateMobileNumber(phoneNumberInput);
        if (!validation.valid) {
            showError(elements.phoneError, validation.message);
            return;
        }

        try {
            elements.submitPhoneNumber.disabled = true;
            elements.submitPhoneNumber.textContent = 'Verifying...';

            const response = await fetch(`${BASE_URL}/api/users/check-mobile/${fullPhoneNumber}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const exists = await response.json();
            if (!exists) {
                showError(elements.phoneError, 'Phone number not registered. Please register first.');
                return;
            }

            // Success case
            hideError(elements.phoneError);
            localStorage.setItem('mobileNumber', fullPhoneNumber);
            elements.phoneNumber.value = phoneNumberInput;

            // Check for pending plan
            const pendingPlan = localStorage.getItem('pendingPlan');
            if (pendingPlan) {
                selectedPlan = JSON.parse(pendingPlan);
                localStorage.removeItem('pendingPlan');
                proceedToPayment(fullPhoneNumber);
            }

            // Execute original click if exists
            const originalClick = document.getElementById('phoneNumberModal').getAttribute('data-original-click');
            if (originalClick) {
                eval(originalClick);
                document.getElementById('phoneNumberModal').removeAttribute('data-original-click');
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('phoneNumberModal'));
            modal.hide();
        } catch (error) {
            console.error('Error:', error);
            showError(elements.phoneError, 'An error occurred. Please try again.');
        } finally {
            elements.submitPhoneNumber.disabled = false;
            elements.submitPhoneButton.textContent = 'Submit';
        }
    }

    // KYC form submission
    async function submitKYC() {
        const form = document.getElementById('kycForm');
        const formData = new FormData(form);
        const username = formData.get('username');
        const documentType = document.getElementById('documentType').value;
        
        localStorage.setItem('username', username);
    
        try {
            const kycSubmitButton = document.getElementById('kycSubmitButton');
            kycSubmitButton.disabled = true;
            kycSubmitButton.textContent = 'Submitting...';
    
            console.log('Submitting KYC to:', `${BASE_URL}/api/users/kyc/submit`);
            
            // Add documentType to formData
            formData.append('documentType', documentType);
            
            console.log('Form data:', {
                username: formData.get('username'),
                aadhaar: formData.get('aadhaar'),
                pan: formData.get('pan'),
                documentFront: formData.get('documentFront') ? 'exists' : 'missing',
                documentBack: formData.get('documentBack') ? 'exists' : 'missing'
            });
    
            const response = await fetch(`${BASE_URL}/api/users/kyc/submit`, {
                method: 'POST',
                body: formData
            });
    
            console.log('Response status:', response.status);
            
            if (response.ok) {
                alert('KYC submitted successfully! Please wait for admin approval.');
                const modal = bootstrap.Modal.getInstance(document.getElementById('kycModal'));
                modal.hide();
            } else if (response.status === 403) {
                alert('Forbidden: Please check your permissions or try again later.');
            } else {
                const error = await response.text();
                console.error('KYC error:', error);
                alert(`Error submitting KYC: ${error}`);
            }
        } catch (error) {
            console.error("Error submitting KYC:", error);
            alert('Failed to submit KYC. Please try again.');
        } finally {
            const kycSubmitButton = document.getElementById('kycSubmitButton');
            if (kycSubmitButton) {
                kycSubmitButton.disabled = false;
                kycSubmitButton.textContent = 'Submit';
            }
        }
    }

    // Helper functions
    function validateMobileNumber(mobileNumber) {
        if (!/^\d{10}$/.test(mobileNumber)) {
            return { valid: false, message: "Mobile number must be exactly 10 digits." };
        }
        if (/^[01]/.test(mobileNumber)) {
            return { valid: false, message: "Mobile number cannot start with 0 or 1." };
        }
        return { valid: true, message: "Valid mobile number." };
    }

    function showError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.style.display = 'block';
    }

    function hideError(element) {
        if (!element) return;
        element.style.display = 'none';
    }

    function updateStatus() {
        if (elements.lastUpdated) {
            const date = new Date();
            elements.lastUpdated.textContent = date.toLocaleString();
        }
    }

    function handleScroll() {
        if (window.scrollY > 100) {
            elements.backToTop.style.display = 'flex';
        } else {
            elements.backToTop.style.display = 'none';
        }
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showKYCModal() {
        const modal = new bootstrap.Modal(document.getElementById('kycModal'));
        modal.show();
    }

    // Initialize the application
    init();
});