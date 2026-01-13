document.addEventListener("DOMContentLoaded", () => {

  // -----------------------------
  // SUPABASE CLIENT
  // -----------------------------
  const supabase = window.supabase.createClient(
    "https://kuabmauutjchvvrfycxk.supabase.co",
    "YOUR_ANON_KEY"
  );

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
    "Property Cleaning": 120,
    "Interior Decoration": 120,
    "Babysitting": 240,
    "Dog Walking": 60,
    "Event Staff": 180,
    "Delivery Assistance*": 60
  };

  // -----------------------------
  // TIME FORMATTER
  // -----------------------------
  function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const dh = h % 12 || 12;
    return `${dh}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  function slotLabel(start, duration) {
    return `${formatTime(start)} – ${formatTime(start + duration)}`;
  }

  // -----------------------------
  // LOAD AVAILABLE TIME SLOTS
  // -----------------------------
  async function loadTimes() {
    timeSelect.innerHTML = `<option value="">Select time</option>`;
    if (!service.value || !date.value) return;

    const duration = durations[service.value] || 60;

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("start_minutes, service")
      .eq("date", date.value);

    if (error) {
      console.error(error);
      return;
    }

    const blocked = bookings.map(b => {
      const d = durations[b.service] || 60;
      return { start: b.start_minutes, end: b.start_minutes + d };
    });

    for (let start = 450; start + duration <= 1140; start += 30) {
      const end = start + duration;

      const overlaps = blocked.some(b =>
        start < b.end && end > b.start
      );

      if (overlaps) continue;

      const opt = document.createElement("option");
      opt.value = start;
      opt.textContent = slotLabel(start, duration);
      timeSelect.appendChild(opt);
    }

    if (timeSelect.options.length === 1) {
      const opt = document.createElement("option");
      opt.textContent = "No availability";
      opt.disabled = true;
      timeSelect.appendChild(opt);
    }
  }

  service.addEventListener("change", loadTimes);
  date.addEventListener("change", loadTimes);

  // -----------------------------
  // FORM SUBMISSION
  // -----------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!agreeTerms.checked) {
      alert("You must agree to the Terms & Conditions.");
      return;
    }

    const start_minutes = parseInt(timeSelect.value);
    if (isNaN(start_minutes)) {
      alert("Please select a valid time.");
      return;
    }

    const { error } = await supabase.from("bookings").insert([{
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      category: form.category.value,
      service: service.value,
      date: date.value,
      start_minutes,
      details: form.details.value || "None"
    }]);

    if (error) {
      alert("That time was just booked. Please choose another.");
      loadTimes();
      return;
    }

    emailjs.send("service_tpy3o7q", "template_7j2yea8", {
      to_email: form.email.value,
      name: form.name.value,
      service: service.value,
      date: date.value,
      time: slotLabel(start_minutes, durations[service.value]),
      details: form.details.value || "None"
    });

    alert("Booking confirmed!");
    form.reset();
    timeSelect.innerHTML = `<option value="">Select time</option>`;
  });
});
