document.addEventListener("DOMContentLoaded", function () {
    const kycForm = document.getElementById("kycForm");
    const message = document.getElementById("message");
    const submitBtn = kycForm.querySelector(".btn-submit");

    kycForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Validate form inputs
        if (!kycForm.checkValidity()) {
            event.stopPropagation();
            kycForm.classList.add("was-validated");
            return;
        }

        const userId = document.getElementById("userId").value.trim();
        const documentType = document.getElementById("documentType").value;
        const documentNumber = document.getElementById("documentNumber").value.trim();

        const requestBody = {
            userId: userId,
            documentType: documentType,
            documentNumber: documentNumber
        };

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
        message.textContent = "";
        message.classList.remove("show", "text-success", "text-danger");

        try {
            const response = await fetch("http://localhost:8083/api/kyc/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                message.textContent = "KYC submitted successfully!";
                message.classList.add("show", "text-success");
                kycForm.reset();
                kycForm.classList.remove("was-validated");
            } else {
                const errorData = await response.json();
                message.textContent = errorData.message || "Submission failed!";
                message.classList.add("show", "text-danger");
            }
        } catch (error) {
            message.textContent = "Error connecting to server!";
            message.classList.add("show", "text-danger");
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit KYC";
        }
    });
});