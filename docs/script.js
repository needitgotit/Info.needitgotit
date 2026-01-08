 // Initialize EmailJS
emailjs.init("SU4xs5Go_As6GQEfL");

// Initialize Supabase
const SUPABASE_URL = "https://kuabmauutjchvvrfycxk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ8..."; // full key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Service durations in minutes
const serviceDurations = {
  "Home Cleaning": 180,
  "Window Cleaning": 120,
  "Babysitting": 240,
  "Delivery Assistance": 120,
  "Event Staff": 300
};

// DOM Elements
const form = document.getElementById("bookingForm");
const agreeCheckbox = document.getElementById("agreeTerms");
const serviceSelect = document.getElementById("serviceSelect");
const dateInput = document.getElementById("dateInput");
const timeSelect = document.getElementById("timeSelect");

// Generate time slots dynamically
function generateTimeSlots(duration) {
  timeSelect.innerHTML = '<option value="">Select time</option>';
  const startHour = 7;
  const endHour = 19;
  let current = new Date();
  current.setHours(startHour, 0, 0, 0);
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + duration * 60000);
    if (slotEnd > end) break;

    const label = slotStart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + " - " +
                  slotEnd.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const option = document.createElement("option");
    option.value = slotStart.toTimeString().slice(0,5);
    option.textContent = label;
    timeSelect.appendChild(option);

    current.setMinutes(current.getMinutes() + 30);
  }
}

// Update available slots by checking Supabase
async function updateAvailableSlots() {
  const selectedService = serviceSelect.value;
  const selectedDate = dateInput.value;
  if (!selectedService || !selectedDate) return;

  const duration = serviceDurations[selectedService] || 60;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("time, service, date")
    .eq("date", selectedDate);

  generateTimeSlots(duration);

  Array.from(timeSelect.options).forEach(opt => {
    const slotStart = new Date(`${selectedDate}T${opt.value}:00`);
    const slotEnd = new Date(slotStart.getTime() + duration*60000 + 30*60000);
    const overlap = bookings.some(b => {
      const bookedStart = new Date(`${b.date}T${b.time}:00`);
      const bookedDuration = serviceDurations[b.service] || 60;
      const bookedEnd = new Date(bookedStart.getTime() + bookedDuration*60000 + 30*60000);
      return (slotStart < bookedEnd && slotEnd > bookedStart);
    });
    if (overlap) opt.disabled = true;
  });
}

// Event listeners for dynamic slot updates
serviceSelect.addEventListener("change", updateAvailableSlots);
dateInput.addEventListener("change", updateAvailableSlots);

// Booking submission
form.addEventListener("submit", async function(e){
  e.preventDefault();
  if(!agreeCheckbox.checked){
    alert("You must agree to the Terms & Conditions before submitting.");
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Send booking to EmailJS
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

  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  try {
    await emailjs.send("service_tpy3o7q","template_7j2yea8",templateParams);
    // Insert booking into Supabase
    await supabase.from("bookings").insert([{
      name: data.name,
      email: data.email,
      phone: data.phone,
      category: data.category,
      service: data.service,
      date: data.date,
      time: data.time,
      details: data.details || "None"
    }]);
    alert("Booking submitted successfully!");
    form.reset();
    timeSelect.innerHTML = '<option value="">Select time</option>';
  } catch(err){
    console.error(err);
    alert("Booking failed. Please try again.");
  } finally{
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  }
});
