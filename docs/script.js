 // Initialize EmailJS
emailjs.init("SU4xs5Go_As6GQEfL"); // Keep your original key

// Supabase setup
const supabaseUrl = "https://kuabmauutjchvvrfycxk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Service durations in minutes
const serviceDurations = {
  "Home Cleaning": 120,
  "Window Cleaning": 60,
  "Property Cleaning": 90,
  "Interior Decoration": 120,
  "Babysitting": 240,
  "Dog Walking": 60,
  "Personal Shopper": 120,
  "Assistant": 120,
  "Delivery Assistance*": 60,
  "Etc.": 60,
  "Vocalist": 120,
  "Songwriting": 120,
  "Model": 180,
  "Clothing Stylist": 120,
  "Food Reviewer": 120,
  "Event Staff": 180,
  "Cater Help": 180,
  "Promoter": 180,
  "Sales": 180
};

// DOM Elements
const form = document.getElementById("bookingForm");
const categorySelect = form.querySelector("select[name='category']");
const serviceSelect = form.querySelector("select[name='service']");
const dateInput = form.querySelector("input[name='date']");
const timeSelect = form.querySelector("select[name='time']");
const agreeCheckbox = document.getElementById("agreeTerms");

// Generate all possible slots (7:30 AM - 7 PM) in 30-min increments
function generateTimeSlots() {
  const slots = [];
  let start = 7.5 * 60; // 7:30 AM in minutes
  const end = 19 * 60; // 7:00 PM in minutes
  while (start + 30 <= end + 1) { // ensure last slot fits
    const hours = Math.floor(start / 60);
    const minutes = start % 60;
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    slots.push(`${displayHour}:${displayMinutes} ${ampm}`);
    start += 30;
  }
  return slots;
}

// Populate time dropdown dynamically
async function populateTimeSlots() {
  const selectedService = serviceSelect.value;
  const selectedDate = dateInput.value;

  // Reset dropdown
  timeSelect.innerHTML = '<option value="">Select time</option>';

  if (!selectedService || !selectedDate) return;

  // Fetch existing bookings for this service/date
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("service", selectedService)
    .eq("date", selectedDate);

  if (error) {
    console.error("Supabase fetch error:", error);
    return;
  }

  const bookedTimes = bookings.map(b => b.time); // array of booked times
  const allSlots = generateTimeSlots();
  const durationMinutes = serviceDurations[selectedService] || 60;
  const slotStep = 30; // 30-minute increments

  // Filter available slots based on duration and existing bookings
  const availableSlots = allSlots.filter((slot, index) => {
    // Calculate consecutive slots needed for service duration
    const neededSlots = Math.ceil(durationMinutes / slotStep);
    const endIndex = index + neededSlots;

    if (endIndex > allSlots.length) return false; // not enough remaining slots

    const range = allSlots.slice(index, endIndex);
    // Return false if any slot in range is already booked
    return !range.some(s => bookedTimes.includes(s));
  });

  if (availableSlots.length === 0) {
    timeSelect.innerHTML += '<option value="">No available slots for this date/service</option>';
    return;
  }

  availableSlots.forEach(slot => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    timeSelect.appendChild(option);
  });
}

// Event listeners to update slots dynamically
serviceSelect.addEventListener("change", populateTimeSlots);
dateInput.addEventListener("change", populateTimeSlots);

// Original EmailJS & Terms logic
form.addEventListener("submit", async function (e) {
  if (!agreeCheckbox.checked) {
    e.preventDefault();
    alert("You must agree to the Terms & Conditions before submitting.");
    return;
  }

  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

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

    // Insert booking into Supabase for double-booking protection
    const { error } = await supabase.from("bookings").insert([
      {
        service: data.service,
        date: data.date,
        time: data.time
      }
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Booking failed. Please try again.");
      return;
    }

    alert("Booking submitted successfully! A confirmation email has been sent.");
    this.reset();
    timeSelect.innerHTML = '<option value="">Select time</option>'; // reset time dropdown
  } catch (error) {
    console.error("EmailJS error:", error);
    alert("Booking failed. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  }
});
