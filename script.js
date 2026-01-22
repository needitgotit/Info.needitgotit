 document.addEventListener("DOMContentLoaded", () => {

  const supabase = window.supabase.createClient(
    "https://kuabmauutjchvvrfycxk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI"
  );

  const form = document.getElementById("bookingForm");
  const service = form.service;
  const date = form.date;
  const timeSelect = form.time;
  const agreeTerms = document.getElementById("agreeTerms");

  timeSelect.disabled = true;

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

  function toEasternMinutes(minutes) {
    const date = new Date();
    date.setHours(0, minutes, 0, 0);

    const eastern = new Date(
      date.toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    return eastern.getHours() * 60 + eastern.getMinutes();
  }

  async function loadTimes() {
    timeSelect.innerHTML = `<option value="">Select time</option>`;
    timeSelect.disabled = true;

    if (!service.value || !date.value) return;

    const duration = durations[service.value] || 60;
    let blocked = [];

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("start_minutes, service")
      .eq("date", date.value);

    if (!error && bookings) {
      blocked = bookings.map(b => {
        const d = durations[b.service] || 60;
        return { start: b.start_minutes, end: b.start_minutes + d };
      });
    }

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

    timeSelect.disabled = false;
  }

  service.addEventListener("change", loadTimes);
  date.addEventListener("change", loadTimes);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!agreeTerms.checked) {
      alert("You must agree to the Terms & Conditions.");
      return;
    }

    const rawStart = parseInt(timeSelect.value);
    if (isNaN(rawStart)) {
      alert("Please select a valid time.");
      return;
    }

    const start_minutes = toEasternMinutes(rawStart);

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

    // ORIGINAL WORKING EMAILJS BLOCK
    emailjs.send(
      "service_tpy3o7q",
      "template_7j2yea8",
      {
        to_email: form.email.value,
        name: form.name.value,
        service: service.value,
        date: date.value,
        time: slotLabel(rawStart, durations[service.value]),
        details: form.details.value || "None"
      },
      "SU4xs5Go_As6GQEfL"
    );

    alert("Booking confirmed!");
    form.reset();
    timeSelect.innerHTML = `<option value="">Select time</option>`;
    timeSelect.disabled = true;
  });
});
