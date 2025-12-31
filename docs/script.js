 document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Templates for EmailJS
  const templateParamsCustomer = {
    to_name: data.name,
    to_email: data.email,
    service_category: data.category,
    service_name: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None",
  };

  const templateParamsBusiness = {
    customer_name: data.name,
    customer_email: data.email,
    customer_phone: data.phone,
    service_category: data.category,
    service_name: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None",
  };

  // Disable submit button to prevent double submissions
  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  // Send customer confirmation
  emailjs.send('YOUR_SERVICE_ID', 'CUSTOMER_TEMPLATE_ID', templateParamsCustomer)
    .then(() => {
      console.log("Customer email sent!");
    })
    .catch(err => {
      console.error("Customer email error:", err);
      alert("Failed to send confirmation email. Please try again later.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Booking";
    });

  // Send booking copy to business email
  emailjs.send('YOUR_SERVICE_ID', 'BUSINESS_TEMPLATE_ID', templateParamsBusiness)
    .then(() => {
      console.log("Business email sent!");
      alert("Booking submitted successfully! Check your email for confirmation.");
      this.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Booking";
    })
    .catch(err => {
      console.error("Business email error:", err);
      alert("Failed to send booking to business email. Please contact us directly.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Booking";
    });
});
