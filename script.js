// ===============================
// CONFIG: Supabase + business rules
// ===============================

const SUPABASE_URL = "https://kuabmauutjchvvrfycxk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Business cutoff: 7:30 PM
const BUSINESS_CUTOFF = "19:30";

// Minimum billable duration per service (minutes)
const SERVICE_MIN_DURATION = {
  "Home Cleaning": 120,
  "Window Cleaning": 120,
  "Property Cleaning": 180,
  "Interior Decoration": 180,

  "Babysitting": 180,
  "Dog Walking": 60,
  "Personal Shopper": 120,
  "Assistant": 120,
  "Delivery Assistance": 60,
  "Etc.": 60,

  "Vocalist": 120,
  "Songwriting": 120,
  "Model": 120,
  "Clothing Stylist": 120,
  "Food Reviewer": 60,

  "Event Staff": 180,
  "Cater Help": 180,
  "Promoter": 120,
  "Sales": 120
};

// ===============================
// Time helpers
// ===============================

function parseTimeToDate(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(0, 0, 0, h, m);
}

function formatDateToTimeStr(dateObj) {
  return dateObj.toTimeString().slice(0, 5);
}

function addMinutesToTimeStr(timeStr, minutes) {
  const d = parseTimeToDate(timeStr);
  d.setMinutes(d.getMinutes() + minutes);
  return formatDateToTimeStr(d);
}

function isTimeAfter(t1, t2) {
  return parseTimeToDate(t1) > parseTimeToDate(t2);
}

function timesOverlap(startA, endA, startB, endB) {
  const aStart = parseTimeToDate(startA);
  const aEnd = parseTimeToDate(endA);
  const bStart = parseTimeToDate(startB);
  const bEnd = parseTimeToDate(endB);
  return aStart < bEnd && bStart < aEnd;
}

// ===============================
// Window fit check
// ===============================

function canWindowFitService(arrivalStart, arrivalEnd, serviceMinutes) {
  const jobEnd = addMinutesToTimeStr(arrivalStart, serviceMinutes);

  if (isTimeAfter(jobEnd, BUSINESS_CUTOFF)) {
    return { ok: false, reason: "cutoff", jobEnd };
  }

  if (isTimeAfter(jobEnd, arrivalEnd)) {
    return { ok: false, reason: "window-too-short", jobEnd };
  }

  return { ok: true, jobEnd };
}

// ===============================
// Supabase: check overlapping bookings
// ===============================

async function isSlotAvailable(date, arrivalStart, arrivalEnd, jobEnd) {
  const { data, error } = await supabase
    .from("bookings")
    .select("arrival_start, arrival_end, job_end")
    .eq("date", date);

  if (error) return false;

  for (const appt of data) {
    if (
      timesOverlap(arrivalStart, arrivalEnd, appt.arrival_start, appt.arrival_end) ||
      timesOverlap(arrivalStart, jobEnd, appt.arrival_start, appt.job_end)
    ) {
      return false;
    }
  }

  return true;
}

// ===============================
// Form handling
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bookingForm");
  const serviceSelect = document.getElementById("serviceSelect");
  const dateInput = document.getElementById("dateInput");
  const arrivalSelect = document.getElementById("arrivalWindowSelect");
  const agreeTerms = document.getElementById("agreeTerms");
  const messageEl = document.getElementById("bookingMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageEl.textContent = "";
    messageEl.className = "booking-message";

    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const category = formData.get("category");
    const service = formData.get("service");
    const date = formData.get("date");
    const details = formData.get("details") || "";
    const arrivalValue = formData.get("time");

    if (!agreeTerms.checked) {
      messageEl.textContent = "You must agree to the Terms & Conditions before booking.";
      messageEl.classList.add("error");
      return;
    }

    const serviceMinutes = SERVICE_MIN_DURATION[service] || 60;
    const [arrivalStart, arrivalEnd] = arrivalValue.split("-");

    const fit = canWindowFitService(arrivalStart, arrivalEnd, serviceMinutes);
    if (!fit.ok) {
      messageEl.textContent = "This arrival window cannot accommodate the selected service.";
      messageEl.classList.add("error");
      return;
    }

    const jobEnd = fit.jobEnd;

    const available = await isSlotAvailable(date, arrivalStart, arrivalEnd, jobEnd);
    if (!available) {
      messageEl.textContent = "This arrival window is no longer available.";
      messageEl.classList.add("error");
      return;
    }

    const { error: insertError } = await supabase
      .from("bookings")
      .insert([
        {
          name,
          email,
          phone,
          category,
          service,
          date,
          arrival_start: arrivalStart,
          arrival_end: arrivalEnd,
          job_end: jobEnd,
          details
        }
      ]);

    if (insertError) {
      messageEl.textContent = "There was an issue saving your booking.";
      messageEl.classList.add("error");
      return;
    }

    // ===============================
    // CORRECT EmailJS block (classic SDK)
    // ===============================
    try {
      await emailjs.send(
        "service_tpy3o7q",
        "template_7j2yea8",
        {
          to_email: email,
          name,
          phone,
          category,
          service,
          date,
          time: arrivalSelect.options[arrivalSelect.selectedIndex].textContent,
          details
        },
        "SU4xs5Go_As6GQEfL"
      );
    } catch (err) {
      console.warn("EmailJS error:", err);
    }

    messageEl.textContent = "Your booking request has been submitted successfully.";
    messageEl.classList.add("success");
    form.reset();
  });
});
