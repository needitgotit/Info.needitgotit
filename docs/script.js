// ==========================
// 0️⃣ Quick Supabase Connection Test
// ==========================
(async () => {
  try {
    const { data, error } = await supabase.from("bookings").select("*").limit(1);
    if (error) throw error;
    console.log("Supabase connection successful! Sample booking data:", data);
    alert("✅ Supabase connection successful!");
  } catch (err) {
    console.error("Supabase connection failed:", err.message);
    alert("❌ Supabase connection failed: " + err.message);
  }
})();

// ==========================
// 1️⃣ Supabase Setup
// ==========================
const SUPABASE_URL = "https://kuabmauutjchvvrfycxk.supabase.co";
const SUPABASE_KEY = "sb_publishable_vD1UPjBTrWOXumJ8Z5vF-A_4Vt16Byg";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// 2️⃣ Service Duration Mapping (hours)
// ==========================
const serviceDurations = {
  "Home Cleaning - Standard": 2,
  "Home Cleaning - Deep": 4,
  "Home Cleaning - Move-In/Move-Out": 6,
  "Window Cleaning - Small": 1,
  "Window Cleaning - Medium": 2,
  "Window Cleaning - Large": 4,
  "Babysitting - Short": 2,
  "Babysitting - Typical": 4,
  "Babysitting - Full-Day": 8,
  "Event Staff - Setup": 1,
  "Event Staff - Coverage": 4,
  "Event Staff - Full": 8,
  "Delivery Assistance - Small": 0.5,
  "Delivery Assistance - Large": 2,
  "Delivery Assistance - Multi-stop": 4
};

// ==========================
// 3️⃣ Elements
// ==========================
const dateInput = document.querySelector('input[name="date"]');
const serviceSelect = document.querySelector('select[name="service"]');
const timeSelect = document.querySelector('select[name="time"]');
const form = document.getElementById("bookingForm");
const agreeCheckbox = document.getElementById("agreeTerms");

// ==========================
// 4️⃣ Generate Time Slots Dynamically
// ==========================
function generateTimeSlots() {
  timeSelect.innerHTML = '<option value="">Select time</option>'; // reset
  const startHour = 7.5; // 7:30 AM
  const endHour = 19;    // 7:00 PM
  const interval = 0.5;  // 30-minute slots

  for (let t = startHour; t + 0.5 <= endHour; t += interval) {
    const hours = Math.floor(t);
    const minutes = t % 1 === 0.5 ? "30" : "00";
    const timeStr = `${hours.toString().padStart(2, "0")}:${minutes}`;
    const display = `${hours % 12 || 12}:${minutes} ${hours < 12 ? "AM" : "PM"}`;
    const option = document.createElement("option");
    option.value = timeStr;
    option.textContent = display;
    timeSelect.appendChild(option);
  }
}

// Generate slots on page load
generateTimeSlots();

// ==========================
// 5️⃣ Helper Functions
// ==========================
function parseTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

// ==========================
// 6️⃣ Update Available Slots Based on Supabase Bookings
// ==========================
async function updateAvailableSlots(selectedDate, selectedService) {
  const duration = serviceDurations[selectedService];
  if (!duration || !selectedDate) return;

  // Fetch existing bookings for the selected date
  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time, service_duration")
    .eq("date", selectedDate);

  // Reset all options
  Array.from(timeSelect.options).forEach(option => {
    if (!option.value) return;
    option.disabled = false;
    option.textContent = option.textContent.replace(" (Unavailable)", "");
  });

  const OP_START = 7.5; // 7:30
  const OP_END = 19;    // 7 PM

  // Disable slots outside operational hours
  Array.from(timeSelect.options).forEach(option => {
    if (!option.value) return;
    const slotStart = parseTime(option.value);
    if (slotStart < OP_START || slotStart + duration > OP_END) {
      option.disabled = true;
      option.textContent += " (Unavailable)";
    }
  });

  // Disable overlapping slots
  bookings.forEach(booking => {
    const bookingStart = parseTime(booking.start_time);
    const bookingEnd = bookingStart + parseFloat(booking.service_duration);

    Array.from(timeSelect.options).forEach(option => {
      if (!option.value) return;
      const slotStart = parseTime(option.value);
      const slotEnd = slotStart + duration;

      if (timesOverlap(slotStart, slotEnd, bookingStart, bookingEnd)) {
        option.disabled = true;
        option.textContent += " (Unavailable)";
      }
    });
  });
}

// ==========================
// 7️⃣ Event Listeners
// ==========================
dateInput.addEventListener("change", () => updateAvailableSlots(dateInput.value, serviceSelect.value));
serviceSelect.addEventListener("change", () => updateAvailableSlots(dateInput.value, serviceSelect.value));

// ==========================
// 8️⃣ Form Submission
// ==========================
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!agreeCheckbox.checked) {
    alert("You must agree to the Terms & Conditions before submitting.");
    return;
  }

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  const duration = serviceDurations[data.service];

  // Insert booking into Supabase
  const { error } = await supabase.from("bookings").insert([
    {
      date: data.date,
      start_time: data.time,
      service_category: data.category,
      service_name: data.service,
      service_duration: duration,
      client_name: data.name,
      client_email: data.email
    }
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    alert("Booking failed. Please try again.");
    return;
  }

  // EmailJS logic
  const templateParams = {
    to_email: data.email,
    name: data.name,
    phone: data.phone,
    category: data.category,
    service: data.service,
    date: data.date,
    time: data.time,
    details: data.details || "None"
  };

  const submitBtn = this.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  emailjs.send(
    "service_tpy3o7q",
    "template_7j2yea8",
    templateParams
  )
  .then(() => {
    alert("Booking submitted successfully! A confirmation email has been sent.");
    this.reset();
    generateTimeSlots(); // regenerate all slots
    updateAvailableSlots(dateInput.value, serviceSelect.value); // refresh availability
  })
  .catch((error) => {
    console.error("EmailJS error:", error);
    alert("Booking failed. Please try again.");
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  });
});
