        const plans = [
            { id: "recommended", name: "Recommended 3GB/day", price: 349, validity: "28 Days", type: "recommended", details: "Unlimited Calls +100 SMS/day", sms: "100+ sms" },
            { id: "popular", name: "Popular 2GB/day", price: 299, validity: "56 Days", type: "popular", details: "Disney+ Hotstar Free" },
            { id: "unlimited", name: "Unlimited 1.5GB/day", price: 199, validity: "28 Days", type: "unlimited", details: "Free Prime Subscription" },
            { id: "data-addon", name: "Data Add-On 5GB", price: 98, validity: "Validity as per base plan", type: "data-addon", details: "5GB additional data" },
            { id: "topup", name: "Top-Up ₹50", price: 50, validity: "Unlimited", type: "topup", details: "Talktime: ₹50" },
            { id: "long-validity", name: "Long Validity 365 Days", price: 1599, validity: "365 Days", type: "long-validity", details: "2GB/day + Unlimited Calls" },
            { id: "Popular", name: "Work From Home 4GB/day", price: 449, validity: "28 Days", type: "work", details: "Unlimited Calls + 200 SMS/day" },
            { id: "student-special", name: "Student Special 1GB/day", price: 199, validity: "90 Days", type: "student", details: "Extra 50GB data for online classes" },
            { id: "senior-citizen", name: "Senior Citizen Plan", price: 179, validity: "60 Days", type: "senior", details: "1GB/day + Unlimited Calls + Free health helpline" },
            { id: "festival-offer", name: "Festival Special 3GB/day", price: 399, validity: "30 Days", type: "festival", details: "Unlimited Calls + Free OTT Access" },
            { id: "data-addon-10gb", name: "Data Add-On 10GB", price: 149, validity: "Validity as per base plan", type: "data-addon", details: "10GB additional data" },
            { id: "topup-100", name: "Top-Up ₹100", price: 100, validity: "Unlimited", type: "topup", details: "Talktime: ₹100" },
            { id: "gaming", name: "Gaming Pack 5GB/day", price: 499, validity: "30 Days", type: "gaming", details: "Extra low-latency servers + Gaming Benefits" }
        ];
    
        function displayPlans(search = "", type = "all") {
            const container = document.getElementById("plansContainer");
            container.innerHTML = "";
    
            const filteredPlans = plans.filter(plan => {
                const matchesSearch = plan.name.toLowerCase().includes(search.toLowerCase()) || plan.price.toString().includes(search);
                const matchesType = type === "all" || plan.type === type;
                return matchesSearch && matchesType;
            });
    
            filteredPlans.forEach(plan => {
                const div = document.createElement("div");
                div.classList.add("col-md-4", "mb-4");
                div.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${plan.name}</h5>
                            <p>Price: ₹${plan.price}</p>
                            <p>Validity: ${plan.validity}</p>
                            <p>Details: ${plan.details}</p>
                            <button class="btn btn-primary" onclick="viewDetails('${plan.name}', ${plan.price}, '${plan.validity}', '${plan.details}')">View Details</button>
                            <button class="btn btn-success" onclick="buyNow('${plan.name}', ${plan.price}, '${plan.validity}', '${plan.details}')">Buy Now</button>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });
        }
    
        function filterByType(type) {
            displayPlans("", type);
        }
    
        function viewDetails(name, price, validity, details) {
            document.getElementById("modalPlanName").innerText = `Plan: ${name}`;
            document.getElementById("modalPlanPrice").innerText = `Price: ₹${price}`;
            document.getElementById("modalPlanValidity").innerText = `Validity: ${validity}`;
            document.getElementById("modalPlanDetails").innerText = details;
    
            let modal = new bootstrap.Modal(document.getElementById("planModal"));
            modal.show();
        }
    
        function confirmPlan() {
            window.location.href = "payment.html";
        }
    
        function buyNow(name, price, validity, details) {
            // Retrieve the mobile number from localStorage
            const mobileNumber = localStorage.getItem('mobileNumber');
    
            // Store plan details and mobile number in localStorage
            localStorage.setItem("planName", name);
            localStorage.setItem("planPrice", price);
            localStorage.setItem("planValidity", validity);
            localStorage.setItem("planDetails", details);
            localStorage.setItem("mobileNumber", mobileNumber); // Pass the mobile number to the payment page
    
            // Redirect to the payment page
            window.location.href = "payment.html";
        }
    
        document.getElementById("searchPlans").addEventListener("input", (e) => {
            const search = e.target.value;
            const type = document.getElementById("filterType").value;
            displayPlans(search, type);
        });
    
        document.getElementById("filterType").addEventListener("change", (e) => {
            const search = document.getElementById("searchPlans").value;
            const type = e.target.value;
            displayPlans(search, type);
        });
    
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
    
        
    
        // Display plans on page load
        displayPlans();
    
        
    // Function to check if the user's phone number is set
    function checkUserPhoneNumber() {
        const mobileNumber = localStorage.getItem('mobileNumber');

        // If the phone number is not set, show a pop-up to enter the number
        if (!mobileNumber || mobileNumber === 'null' || mobileNumber === '') {
            const newNumber = prompt("Please enter your 10-digit phone number to proceed with the recharge:");
            if (newNumber && /^\d{10}$/.test(newNumber)) {
                localStorage.setItem('mobileNumber', newNumber);
                document.getElementById('userPhone').textContent = newNumber;
                return true; // Phone number is valid
            } else {
                alert("Please enter a valid 10-digit mobile number.");
                return false; // Phone number is invalid
            }
        } else {
            return true; // Phone number is already set
        }
    }

    // Function to handle "Buy Now" button click
    function buyNow(name, price, validity, details) {
        // Check if the user's phone number is set
        if (!checkUserPhoneNumber()) {
            return; // Stop if the phone number is not set
        }

        // Retrieve the mobile number from localStorage
        const mobileNumber = localStorage.getItem('mobileNumber');

        // Store plan details and mobile number in localStorage
        localStorage.setItem("planName", name);
        localStorage.setItem("planPrice", price);
        localStorage.setItem("planValidity", validity);
        localStorage.setItem("planDetails", details);
        localStorage.setItem("mobileNumber", mobileNumber); // Pass the mobile number to the payment page

        // Redirect to the payment page
        window.location.href = "payment.html";
    }

    // Function to handle "Recharge" button click in the modal
    function confirmPlan() {
        // Check if the user's phone number is set
        if (!checkUserPhoneNumber()) {
            return; // Stop if the phone number is not set
        }

        // Redirect to the payment page
        window.location.href = "payment.html";
    }

    // Function to update the phone number
    function updatePhoneNumber() {
        const newNumber = prompt("Enter new phone number:");
        if (newNumber && /^\d{10}$/.test(newNumber)) {
            localStorage.setItem('mobileNumber', newNumber);
            document.getElementById("userPhone").textContent = newNumber;
        } else {
            alert("Please enter a valid 10-digit mobile number.");
        }
    }

    // Function to logout
    function logout() {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('mobileNumber');
            window.location.href = "index.html";
        }
    }

    // Retrieve the mobile number from local storage
    const mobileNumber = localStorage.getItem('mobileNumber');

    // Display the mobile number on the page
    if (mobileNumber) {
        document.getElementById('userPhone').textContent = mobileNumber;
    } else {
        document.getElementById('userPhone').textContent = 'No number found';
    }

    // Display plans on page load
    displayPlans();
