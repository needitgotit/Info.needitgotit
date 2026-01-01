 document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Prepare actual values for EmailJS (must match template variables)
  const templateParamsCustomer = {
    name: data.name,                   // matches {{name}} in template
    service: data.service,             // matches {{service}}
    date: data.date,                   // matches {{date}}
    time: data.time,                   // matches {{time}}
    details: data.details || "None",   // matches {{details}}
    to_email: data.email               // matches {{to_email}} field in template
  };

  const templateParamsBusiness = {
    name: data.name,
    service: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None",
    to_email: "info.needitgotit@gmail.com"  // your business email
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
