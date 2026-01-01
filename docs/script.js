  document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Customer email test
const templateParamsCustomer = {
  name: "Test User",
  service: "Test Service",
  date: "2026-01-01",
  time: "12:00 PM",
  details: "Test details",
  to_email: "yourpersonalemail@gmail.com"  // replace with your real test email
};

// Business email test
const templateParamsBusiness = {
  name: "Test User",
  service: "Test Service",
  date: "2026-01-01",
  time: "12:00 PM",
  details: "Test details",
  to_email: "info.needitgotit@gmail.com"
};


  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  // Send both emails using EmailJS
  Promise.all([
    emailjs.send('service_tpy3o7q', 'template_7j2yea8', templateParamsCustomer)
      .then(() => console.log("Customer email sent"))
      .catch(err => console.error("Customer email error:", err)),

    emailjs.send('service_tpy3o7q', 'template_7j2yea8', templateParamsBusiness)
      .then(() => console.log("Business email sent"))
      .catch(err => console.error("Business email error:", err))
  ])
  .finally(() => {
    alert("Booking submitted successfully! Check your email for confirmation.");
    this.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  });
});
