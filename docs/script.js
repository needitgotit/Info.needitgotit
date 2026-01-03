document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  const templateParams = {
    name: data.name,
    email: data.email,
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
