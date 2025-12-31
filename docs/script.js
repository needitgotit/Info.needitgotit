 document.getElementById("bookingForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("Booking submitted successfully! Check your email for confirmation.");
      this.reset();
    } else {
      alert("There was an issue submitting your booking. Please try again.");
    }

  } catch (error) {
    alert("Network error. Please try again later.");
  }
});
