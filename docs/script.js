 document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Customer email template parameters
  const templateParamsCustomer = {
    to_name: data.name,
    to_email: data.email,
    service_category: data.category,
    service_name: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None",
  };

  // Business email template parameters
  const templateParamsBusiness = {
    to_name: "Need It! Got It!",             // Business display name
    to_email: "info.needitgotit@gmail.com", // Your business email
    customer_name: data.name,
    customer_email: data.email,
    customer_phone: data.phone,
    service_category: data.category,
    service_name: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None",
  };

  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  // Send both emails in parallel
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
