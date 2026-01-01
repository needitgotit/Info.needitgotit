  document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Customer confirmation email
  const customerParams = {
    name: data.name,
    service: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None",
    to_email: data.email
  };

  // Business notification email
  const businessParams = {
    name: data.name,
    service: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None",
    to_email: data.email,
    phone: data.phone
  };

  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  Promise.all([
    emailjs.send("service_tpy3o7q", "template_7j2yea8", customerParams),
    emailjs.send("service_tpy3o7q", "template_0h1xcah", businessParams)
  ])
  .then(() => {
    alert("Booking submitted successfully! A confirmation has been sent.");
    this.reset();
  })
  .catch(() => {
    alert("Booking submitted, but email delivery failed. We will still contact you.");
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  });
});
