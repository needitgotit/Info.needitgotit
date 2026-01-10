 document.addEventListener("DOMContentLoaded", () => {

  // -----------------------------
  // SUPABASE CLIENT (MUST EXIST)
  // -----------------------------
  const supabase = window.supabase.createClient(
    "https://kuabmauutjchvvrfycxk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI"
  );

  // -----------------------------
  // FORM ELEMENTS (MUST MATCH HTML)
  // -----------------------------
  const form = document.getElementById("bookingForm");
  const service = form.service;
  const date = form.date;
  const timeSelect = form.time;
  const agreeTerms = document.getElementById("agreeTerms");

  // -----------------------------
  // SERVICE DURATIONS (MINUTES)
  // -----------------------------
  const durations = {
    "Home Cleaning": 120,
    "Window Cleaning": 60,
    "Babysitting": 240,
    "Event Staff": 180,
    "Delivery Assistance*": 60
  };

  // -----------------------------
  // TIME FORMATTER
  // -----------------------------
  function minutesToLabel(start, duration) {
    const end = start + duration;

    const format = (m) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const ampm = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 || 12;
      return `${displayHour}:${min.toString().padStart(2, "0")} ${ampm}`;
    };

    return `${format(start)} – ${format(end)}`;
  }

  // -----------------------------
  // LOAD AVAILABLE TIME SLOTS
  // -----------------------------
  async function loadTimes() {
    timeSelect.innerHTML = `<option value="">Select time</option>`;

    if (!service.value || !date.value) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("start_minutes")
      .eq("service", service.value)
      .eq("date", date.value);

    if (error) {
      console.error("Supabase fetch error:", error);
      return;
    }

    const booked = data.map(row => row.start_minutes);
    const duration = durations[service.value] || 60;

    // 7:30 AM (450) → 7:00 PM cutoff (1140)
    for (let start = 450; start + duration <= 1140; start += 30) {
      if (booked.includes(start)) continue;

      const option = document.createElement("option");
      option.value = start;
      option.textContent = minutesToLabel(start, duration);
      timeSelect.appendChild(option);
    }

    if (timeSelect.options.length === 1) {
      const opt = document.createElement("option");
      opt.textContent = "No availability";
      opt.disabled = true;
      timeSelect.appendChild(opt);
    }
  }

  // -----------------------------
  // EVENT LISTENERS
  // -----------------------------
  service.addEventListener("change", loadTimes);
  date.addEventListener("change", loadTimes);

  // -----------------------------
  // FORM SUBMISSION
  // -----------------------------
  form.addEventListener("submit", async (e) => {

    if (!agreeTerms.checked) {
      e.preventDefault();
      alert("You must agree to the Terms & Conditions before submitting.");
      return;
    }

    const start_minutes = parseInt(timeSelect.value, 10);

    if (isNaN(start_minutes)) {
      e.preventDefault();
      alert("Please select a valid time slot.");
      return;
    }

    // Insert booking FIRST (prevents double booking)
    const { error } = await supabase
      .from("bookings")
      .insert([{
        service: service.value,
        date: date.value,
        start_minutes
      }]);

    if (error) {
      e.preventDefault();
      alert("That time was just booked. Please choose another.");
      loadTimes();
      return;
    }

    // EmailJS confirmation
    emailjs.send(
      "service_tpy3o7q",
      "template_7j2yea8",
      {
        to_email: form.email.value,
        service: service.value,
        date: date.value,
        time: minutesToLabel(start_minutes, durations[service.value])
      }
    );
  });

});
