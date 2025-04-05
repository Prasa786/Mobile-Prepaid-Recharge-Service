
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
                    window.location.href = "/Users/html/payment.html";
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
                        window.location.href = "/Users/html/RechargePlans.html";
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
                        document.getElementById("userPhone") ? document.getElementById("userPhone").textContent = newNumber : console.log("userPhone not found");
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
                    document.getElementById('userPhone') ? document.getElementById('userPhone').textContent = mobileNumber : console.log("userPhone not found");
                } else {
                    document.getElementById('userPhone') ? document.getElementById('userPhone').textContent = 'No number found' : console.log("userPhone not found");
                }

                window.selectPlan = selectPlan;
                window.validatePhoneNumber = validatePhoneNumber;
                window.updateStatus = updateStatus;
                window.updatePhoneNumber = updatePhoneNumber;
                window.logout = logout;
                window.scrollToTop = scrollToTop;
            });
            
           

            // Mobile Number Validation
           document.addEventListener('DOMContentLoaded', function() {
               // Validation function
               function validateMobileNumber(mobileNumber) {
                   // Check if it's exactly 10 digits
                   if (!/^\d{10}$/.test(mobileNumber)) {
                       return {
                           valid: false,
                           message: "Mobile number must be exactly 10 digits."
                       };
                   }
                   
                   // Check if it starts with a valid digit (not 0 or 1)
                   if (/^[01]/.test(mobileNumber)) {
                       return {
                           valid: false,
                           message: "Mobile number cannot start with 0 or 1."
                       };
                   }
                   
                   return {
                       valid: true,
                       message: "Valid mobile number."
                   };
               }
           
               // Override the existing validatePhoneNumber function
               window.validatePhoneNumber = function() {
                   const phoneInput = document.getElementById('phoneNumber');
                   const errorElement = document.getElementById('error-message');
                   const phoneNumber = phoneInput.value;
                   
                   console.log("Validating phone number:", phoneNumber);
                   
                   const validation = validateMobileNumber(phoneNumber);
                   
                   if (!validation.valid) {
                       errorElement.textContent = validation.message;
                       errorElement.style.display = 'block';
                       phoneInput.classList.add('is-invalid');
                       return false;
                   } else {
                       errorElement.style.display = 'none';
                       phoneInput.classList.remove('is-invalid');
                       window.location.href = "RechargePlans.html?phone=" + phoneNumber;
                       return true;
                   }
               };
           
               // Override plan selection buttons
               const planButtons = document.querySelectorAll('[onclick^="selectPlan"]');
               planButtons.forEach(button => {
                   const originalOnClick = button.getAttribute('onclick');
                   
                   button.removeAttribute('onclick');
                   button.addEventListener('click', function() {
                       const phoneNumber = document.getElementById('phoneNumber').value;
                       const validation = validateMobileNumber(phoneNumber);
                       
                       if (!validation.valid) {
                           // Show modal
                           const phoneModal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
                           phoneModal.show();
                           
                           // Store original onclick for later execution
                           document.getElementById('phoneNumberModal').setAttribute('data-original-click', originalOnClick);
                       } else {
                           // Execute original onclick
                           eval(originalOnClick);
                       }
                   });
               });
           
               // Handle modal submission
               const submitBtn = document.getElementById('submitPhoneNumber');
               if (submitBtn) {
                   submitBtn.addEventListener('click', function() {
                       const phoneInput = document.getElementById('phoneNumberInput');
                       const phoneError = document.getElementById('phoneError');
                       const phoneNumber = phoneInput.value;
                       
                       const validation = validateMobileNumber(phoneNumber);
                       
                       if (validation.valid) {
                           // Update main phone input
                           document.getElementById('phoneNumber').value = phoneNumber;
                           
                           // Close modal
                           const phoneModal = bootstrap.Modal.getInstance(document.getElementById('phoneNumberModal'));
                           phoneModal.hide();
                           
                           // Execute original action if it exists
                           const originalClick = document.getElementById('phoneNumberModal').getAttribute('data-original-click');
                           if (originalClick) {
                               eval(originalClick);
                               document.getElementById('phoneNumberModal').removeAttribute('data-original-click');
                           }
                       } else {
                           phoneError.textContent = validation.message;
                           phoneError.style.display = 'block';
                       }
                   });
               }
           
               // Add validation to plan links
               document.querySelectorAll('a[href="/Users/html/RechargePlans.html"]').forEach(link => {
                   link.addEventListener('click', function(e) {
                       const phoneNumber = document.getElementById('phoneNumber').value;
                       const validation = validateMobileNumber(phoneNumber);
                       
                       if (!validation.valid) {
                           e.preventDefault();
                           const phoneModal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
                           phoneModal.show();
                           
                           // Store link for later navigation
                           document.getElementById('phoneNumberModal').setAttribute('data-target-url', this.href);
                       }
                   });
               });


               // Add this function to check KYC status
async function checkKYCStatus(userId) {
    try {
        const response = await fetch(`/api/kyc/status/${userId}`);
        if (response.ok) {
            const status = await response.json();
            return status;
        }
        return null;
    } catch (error) {
        console.error("Error checking KYC status:", error);
        return null;
    }
}
           

async function selectPlan(name, price, validity) {
    console.log("selectPlan called with:", name, price, validity);
    
    // Get user ID from localStorage or wherever you store it
    const userId = localStorage.getItem('userId');
    
    // Check KYC status
    const kycStatus = await checkKYCStatus(userId);
    
    if (kycStatus !== 'VERIFIED') {
        // Show KYC modal or redirect to KYC page
        showKYCModal();
        return;
    }
    
    // Rest of your existing selectPlan logic
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

function showKYCModal() {
    // Create or show a modal for KYC submission
    const kycModal = `
        <div class="modal fade" id="kycModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">KYC Verification Required</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>To purchase plans, please complete your KYC verification.</p>
                        <form id="kycForm">
                            <div class="mb-3">
                                <label class="form-label">Aadhaar Number</label>
                                <input type="text" class="form-control" name="aadhaar" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">PAN Number</label>
                                <input type="text" class="form-control" name="pan" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Upload Document (Front)</label>
                                <input type="file" class="form-control" name="documentFront" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Upload Document (Back)</label>
                                <input type="file" class="form-control" name="documentBack">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitKYC()">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM if not already there
    if (!document.getElementById('kycModal')) {
        document.body.insertAdjacentHTML('beforeend', kycModal);
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('kycModal'));
    modal.show();
}
               // Add validation to login via mobile
            //    document.querySelectorAll('a[href="login.html"]').forEach(link => {
            //        link.addEventListener('click', function(e) {
            //            const isMobileLogin = confirm("Are you signing in via mobile number?");
            //            if (isMobileLogin) {
            //                e.preventDefault();
                           
            //                // Update modal for login context
            //                document.getElementById('phoneNumberModalLabel').textContent = "Sign In with Mobile Number";
                           
            //                const phoneModal = new bootstrap.Modal(document.getElementById('phoneNumberModal'));
            //                phoneModal.show();
                           
            //                // Store login intent
            //                document.getElementById('phoneNumberModal').setAttribute('data-login-intent', 'true');
            //            }
            //        });
            //    });
           });
                   

           async function submitKYC() {
            const form = document.getElementById('kycForm');
            const formData = new FormData(form);
            
            // Get user ID from localStorage
            const userId = localStorage.getItem('userId');
            
            // Add user ID to form data
            formData.append('userId', userId);
            
            try {
                const response = await fetch('/api/kyc/submit', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    alert('KYC submitted successfully! Please wait for admin approval.');
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('kycModal'));
                    modal.hide();
                } else {
                    const error = await response.json();
                    alert(`Error submitting KYC: ${error.message}`);
                }
            } catch (error) {
                console.error("Error submitting KYC:", error);
                alert('Failed to submit KYC. Please try again.');
            }
        }