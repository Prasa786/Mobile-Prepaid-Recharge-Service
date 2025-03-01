
    document.addEventListener("DOMContentLoaded", function () {
        let selectedPlan = null;

        function selectPlan(name, price, validity) {
            console.log("selectPlan called with:", name, price, validity);
            selectedPlan = { name, price, validity };
            let mobileNumber = localStorage.getItem('mobileNumber');
            console.log("Current mobileNumber:", mobileNumber);

            if (!mobileNumber || mobileNumber === 'null' || mobileNumber === '') {
                console.log("Showing modal");
                const modal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
                modal.show();
            } else {
                proceedToPayment(mobileNumber);
            }
        }

        function proceedToPayment(mobileNumber) {
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

            console.log("Redirecting to payment.html");
            window.location.href = "payment.html";
        }

        document.getElementById('submitPhoneNumber').addEventListener('click', function () {
            const phoneNumberInput = document.getElementById('phoneNumberInput').value;
            const phoneError = document.getElementById('phoneError');
            if (/^\d{10}$/.test(phoneNumberInput)) {
                phoneError.style.display = 'none';
                localStorage.setItem('mobileNumber', phoneNumberInput);
                const modal = bootstrap.Modal.getInstance(document.getElementById('phoneNumberModal'));
                modal.hide();
                proceedToPayment(phoneNumberInput);
            } else {
                phoneError.style.display = 'block';
            }
        });

        // Rest of your existing code (counters, validatePhoneNumber, etc.) remains unchanged
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

        function validatePhoneNumber() {
            const phoneNumber = document.getElementById('phoneNumber').value;
            const errorMessage = document.getElementById('error-message');
            if (phoneNumber.length === 10 && !isNaN(phoneNumber)) {
                errorMessage.style.display = 'none';
                localStorage.setItem('mobileNumber', phoneNumber);
                window.location.href = "RechargePlans.html";
            } else {
                errorMessage.style.display = 'block';
            }
        }

        function updateStatus() {
            const lastUpdated = document.getElementById('lastUpdated');
            const date = new Date();
            lastUpdated.textContent = date.toLocaleString();
        }

        window.onscroll = function() {
            const backToTop = document.querySelector('.back-to-top');
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        };

        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function updatePhoneNumber() {
            const newNumber = prompt("Enter new phone number:");
            if (newNumber && /^\d{10}$/.test(newNumber)) {
                localStorage.setItem('mobileNumber', newNumber);
                document.getElementById("userPhone").textContent = newNumber;
            } else {
                alert("Please enter a valid 10-digit mobile number.");
            }
        }

        function logout() {
            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem('mobileNumber');
                window.location.href = "index.html";
            }
        }

        const mobileNumber = localStorage.getItem('mobileNumber');
        if (mobileNumber) {
            document.getElementById('userPhone') ? document.getElementById('userPhone').textContent = mobileNumber : console.log("userPhone element not found");
        } else {
            document.getElementById('userPhone') ? document.getElementById('userPhone').textContent = 'No number found' : console.log("userPhone element not found");
        }

        window.selectPlan = selectPlan;
        window.validatePhoneNumber = validatePhoneNumber;
        window.updateStatus = updateStatus;
        window.updatePhoneNumber = updatePhoneNumber;
        window.logout = logout;
        window.scrollToTop = scrollToTop;
    });
