
       
function filterFAQs() {
    let input = document.getElementById("faqSearch").value.toLowerCase();
    let faqs = document.querySelectorAll(".faq-item");
    let noResults = document.getElementById("noResults");
    let found = false;

    faqs.forEach(faq => {
        let question = faq.querySelector("h5").textContent.toLowerCase();
        if (question.includes(input)) {
            faq.style.display = "block";
            found = true;
        } else {
            faq.style.display = "none";
        }
    });

    noResults.style.display = found ? "none" : "block";
}


window.onscroll = function () {
    let button = document.getElementById("backToTop");
    if (document.documentElement.scrollTop > 100) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}
