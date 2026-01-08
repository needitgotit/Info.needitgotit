document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  const templateParams = {
    to_email: data.email,        // 🔑 REQUIRED
    name: data.name,
    phone: data.phone,
    category: data.category,
    service: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None"
  };

  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  emailjs.send(
    "service_tpy3o7q",
    "template_7j2yea8",
    templateParams
  )
  .then(() => {
    alert("Booking submitted successfully! A confirmation email has been sent.");
    this.reset();
  })
  .catch((error) => {
    console.error("EmailJS error:", error);
    alert("Booking failed. Please try again.");
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  });
});
// TERMS & CONDITIONS ENFORCEMENT
const form = document.getElementById("bookingForm");
const agreeCheckbox = document.getElementById("agreeTerms");

form.addEventListener("submit", function (e) {
  if (!agreeCheckbox.checked) {
    e.preventDefault();
    alert("You must agree to the Terms & Conditions before submitting.");
  }
});
