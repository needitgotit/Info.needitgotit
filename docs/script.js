document.addEventListener("DOMContentLoaded", function () {

  /* =======================
     SUPABASE SETUP
  ======================= */
  const supabase = window.supabase.createClient(
    "https://kuabmauutjchvvrfycxk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI"
  );

  /* =======================
     ELEMENTS
  ======================= */
  const form = document.getElementById("bookingForm");
  const serviceSelect = form.querySelector("select[name='service']");
  const dateInput = form.querySelector("input[name='date']");
  const timeSelect = form.querySelector("select[name='time']");
  const agreeCheckbox = document.getElementById("agreeTerms");

  /* =======================
     SERVICE DURATIONS (MIN)
  ======================= */
  const durations = {
    "Home Cleaning": 120,
    "Window Cleaning": 60,
    "Babysitting": 240,
    "Event Staff": 180,
    "Delivery Assistance*": 60
  };

  /* =======================
     TIME SLOT GENERATOR
  ======================= */
  function generateSlots() {
    const slots = [];
    let minutes = 450; // 7:30 AM
    const end = 1140; // 7:00 PM

    while (minutes + 30 <= end) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const ampm = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      slots.push(`${displayH}:${m.toString().padStart(2, "0")} ${ampm}`);
      minutes += 30;
    }
    return slots;
  }

  /* =======================
     POPULATE TIMES
  ======================= */
  async function populateTimes() {
    timeSelect.innerHTML = `<option value="">Select time</option>`;

    if (!serviceSelect.value || !dateInput.value) return;

    console.log("populateTimeSlots fired");

    const duration = durations[serviceSelect.value] || 60;
    const slotsNeeded = duration / 30;
    const allSlots = generateSlots();

    const { data: bookings } = await supabase
      .from("bookings")
      .select("time")
      .eq("service", serviceSelect.value)
      .eq("date", dateInput.value);

    const booked = bookings.map(b => b.time);

    for (let i = 0; i + slotsNeeded <= allSlots.length; i++) {
      const range = allSlots.slice(i, i + slotsNeeded);
      if (range.some(t => booked.includes(t))) continue;

      const start = range[0];
      const end = range[range.length - 1];
      const opt = document.createElement("option");
      opt.value = `${start} – ${end}`;
      opt.textContent = `${start} – ${end}`;
      timeSelect.appendChild(opt);
    }

    if (timeSelect.options.length === 1) {
      timeSelect.innerHTML += `<option>No available times</option>`;
    }
  }

  /* =======================
     EVENTS
  ======================= */
  serviceSelect.addEventListener("change", populateTimes);
  dateInput.addEventListener("change", populateTimes);

});
