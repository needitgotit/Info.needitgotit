 // --- SUPABASE SETUP ---
const supabaseUrl = "https://kuabmauutjchvvrfycxk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// --- SERVICE DURATIONS (in hours) ---
const serviceDurations = {
  "Home Cleaning": [2,4],
  "Window Cleaning": [1,6],
  "Property Cleaning": [2,6],
  "Interior Decoration": [2,5],
  "Babysitting": [2,12],
  "Dog Walking": [1,2],
  "Personal Shopper": [1,3],
  "Assistant": [1,4],
  "Delivery Assistance*": [0.5,4],
  "Etc.": [1,2],
  "Vocalist": [1,4],
  "Songwriting": [1,4],
  "Model": [1,4],
  "Clothing Stylist": [1,3],
  "Food Reviewer": [1,3],
  "Event Staff": [1,10],
  "Cater Help": [1,8],
  "Promoter": [2,6],
  "Sales": [2,6]
};

// --- TIME SLOT GENERATOR ---
function generateTimeSlots(startHour = 7.5, endHour = 19, interval = 0.5) {
  const slots = [];
  for (let t = startHour; t < endHour; t += interval) {
    const hours = Math.floor(t);
    const minutes = (t % 1) === 0.5 ? "30" : "00";
    const suffix = hours < 12 ? "AM" : "PM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    slots.push(`${displayHour}:${minutes} ${suffix}`);
  }
  return slots;
}

// --- DYNAMIC TIME SLOT POPULATION ---
async function populateTimeSlots() {
  const serviceSelect = document.querySelector('select[name="service"]');
  const dateInput = document.querySelector('input[name="date"]');
  const timeSelect = document.querySelector('select[name="time"]');

  // Clear old options
  timeSelect.innerHTML = '<option value="">Select time</option>';

  const selectedService = serviceSelect.value;
  const selectedDate = dateInput.value;
  if (!selectedService || !selectedDate) return;

  const [minDuration, maxDuration] = serviceDurations[selectedService] || [1,2];

  // Get booked times for the date & service
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('time, service, date')
    .eq('date', selectedDate)
    .eq('service', selectedService);

  const bookedSlots = bookings?.map(b => b.time) || [];

  // Generate all possible slots
  const allSlots = generateTimeSlots(); // 7:30am to 7:00pm in 30min increments

  // Filter out booked slots
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  // Filter by duration: only slots that allow minDuration
  const finalSlots = [];
  for (let i = 0; i < availableSlots.length; i++) {
    let slotStart = i;
    let slotEnd = i + Math.ceil(minDuration * 2); // each interval is 0.5h
    if (slotEnd <= availableSlots.length) {
      // check if all intervals in range are free
      const allFree = availableSlots.slice(slotStart, slotEnd).every(s => !bookedSlots.includes(s));
      if (allFree) finalSlots.push(availableSlots[i]);
    }
  }

  // Populate dropdown
  finalSlots.forEach(slot => {
    const opt = document.createElement('option');
    opt.value = slot;
    opt.textContent = slot;
    timeSelect.appendChild(opt);
  });

  if (finalSlots.length === 0) {
    const opt = document.createElement('option');
    opt.value = "";
    opt.textContent = "No available slots for this date/service";
    timeSelect.appendChild(opt);
  }
}

// --- EVENT LISTENERS ---
document.querySelector('select[name="service"]').addEventListener('change', populateTimeSlots);
document.querySelector('input[name="date"]').addEventListener('change', populateTimeSlots);
