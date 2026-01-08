 // ==========================
// 0️⃣ Initialize Supabase
// ==========================
const SUPABASE_URL = "https://kuabmauutjchvvrfycxk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// 1️⃣ Service Duration Mapping (minutes)
// ==========================
const serviceDurations = {
  "Home Cleaning - Standard": 180,
  "Home Cleaning - Deep": 360,
  "Home Cleaning - Move-In/Move-Out": 600,
  "Window Cleaning - Small": 90,
  "Window Cleaning - Medium": 180,
  "Window Cleaning - Large": 360,
  "Babysitting - Short": 120,
  "Babysitting - Typical": 240,
  "Babysitting - Full Day": 480,
  "Delivery Assistance": 120,
  "Event Staff": 300,
};

// ==========================
// 2️⃣ DOM Elements
// ==========================
const serviceSelect = document.getElementById("serviceSelect");
const dateInput = document.getElementById("dateInput");
const timeSelect = document.getElementById("timeSelect");

// ==========================
// 3️⃣ Generate 30-min interval time slots
// ==========================
function generateTimeSlots(duration) {
  timeSelect.innerHTML = '<option value="">Select time</option>';
  const startHour = 7, startMinute = 30;
  const endHour = 19, endMinute = 0;
  let current = new Date();
  current.setHours(startHour, startMinute, 0, 0);
  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  while (current <= end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + duration * 60000);

    if (slotEnd > end) break;

    const label = slotStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + " - " +
                  slotEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const value = slotStart.toTimeString().slice(0,5);
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    timeSelect.appendChild(option);

    current.setMinutes(current.getMinutes() + 30);
  }
}

// ==========================
// 4️⃣ Disable overlapping slots
// ==========================
async function updateAvailableSlots() {
  const selectedService = serviceSelect.value;
  const selectedDate = dateInput.value;
  if (!selectedService || !selectedDate) return;

  const duration = serviceDurations[selectedService] || 60;

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("time, service, date")
    .eq("date", selectedDate);

  if (error) {
    console.error("Supabase fetch error:", error);
    return;
  }

  generateTimeSlots(duration);

  // Disable overlapping slots (including 30-min buffer)
  Array.from(timeSelect.options).forEach(opt => {
    const slotStart = new Date(`${selectedDate}T${opt.value}:00`);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000 + 30*60000); // duration + buffer
    const overlap = bookings.some(b => {
      const bookedStart = new Date(`${b.date}T${b.time}:00`);
      const bookedDuration = serviceDurations[b.service] || 60;
      const bookedEnd = new Date(bookedStart.getTime() + bookedDuration * 60000 + 30*60000);
      return (slotStart < bookedEnd && slotEnd > bookedStart);
    });
    if (overlap) opt.disabled = true;
  });
}

// ==========================
// 5️⃣ Event listeners for date/service change
// ==========================
serviceSelect.addEventListener("change", updateAvailableSlots);
dateInput.addEventListener("change", updateAvailableSlots);

// ==========================
// 6️⃣ Booking form submission
// ==========================
const form = document.getElementById("bookingForm");
const agreeCheckbox = document.getElementById("agreeTerms");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!agreeCheckbox.checked) {
    alert("You must agree to the Terms & Conditions before submitting.");
    return;
  }

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  const duration = serviceDurations[data.service] || 60;

  // Check overlapping again before submission
  const { data: bookings } = await supabase.from("bookings")
    .select("time, service, date")
    .eq("date", data.date);

  const slotStart = new Date(`${data.date}T${data.time}:00`);
  const slotEnd = new Date(slotStart.getTime() + duration*60000 + 30*60000);
  const overlap = bookings.some(b => {
    const bookedStart = new Date(`${b.date}T${b.time}:00`);
    const bookedDuration = serviceDurations[b.service] || 60;
    const bookedEnd = new Date(bookedStart.getTime() + bookedDuration*60000 + 30*60000);
    return (slotStart < bookedEnd && slotEnd > bookedStart);
  });
  if (overlap) {
    alert("Selected time slot is no longer available. Please choose another.");
    updateAvailableSlots();
    return;
  }

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

  try {
    await emailjs.send("service_tpy3o7q", "template_7j2yea8", templateParams);

    // Save booking to Supabase
    const { error } = await supabase.from("bookings").insert([{
      name: data.name,
      email: data.email,
      phone: data.phone,
      category: data.category,
      service: data.service,
      date: data.date,
      time: data.time,
      details: data.details || "None"
    }]);
    if (error) throw error;

    alert("Booking submitted successfully! A confirmation email has been sent.");
    this.reset();
    timeSelect.innerHTML = '<option value="">Select time</option>';
  } catch (err) {
    console.error("Booking error:", err);
    alert("Booking failed. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  }
});

// ==========================
// 7️⃣ Initial Supabase test
// ==========================
(async () => {
  try {
    const { data } = await supabase.from("bookings").select("*").limit(1);
    console.log("✅ Supabase connection successful", data);
  } catch (err) {
    console.error("❌ Supabase connection failed:", err.message);
  }
})();
