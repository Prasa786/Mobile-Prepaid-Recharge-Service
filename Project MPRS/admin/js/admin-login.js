const apiBaseUrl = "http://localhost:8083/api";

// Ensure script runs only after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("adminLoginForm");

    if (!loginForm) {
        console.error("Error: Admin login form not found!");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form refresh

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!emailInput || !passwordInput) {
            console.error("Error: Email or Password input fields not found!");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/auth/login-admin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password: password })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Login failed");

            localStorage.setItem("adminToken", data.token);
            alert("Login successful! Redirecting...");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Login error:", error);
            alert("Invalid credentials. Please try again.");
        }
    });
});
