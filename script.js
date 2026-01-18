// ===============================
// CONFIG: Supabase + business rules
// ===============================

// Supabase client (CDN v2)
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

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
  return dateObj.toTimeString().slice(0, 5); // "HH:MM"
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

  // Must not go past business cutoff
  if (isTimeAfter(jobEnd, BUSINESS_CUTOFF)) {
    return { ok: false, reason: "cutoff", jobEnd };
  }

  // Must not exceed arrival window end (your stricter policy)
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

  if (error) {
    console.error("Supabase error while checking availability:", error);
    // Fail-safe: treat as unavailable or available; here we choose unavailable
    return false;
  }

  for (const appt of data) {
    const existingArrivalStart = appt.arrival_start;
    const existingArrivalEnd = appt.arrival_end;
    const existingJobEnd = appt.job_end;

    if (!existingArrivalStart || !existingArrivalEnd || !existingJobEnd) continue;

    // 1) Arrival window overlap
    if (timesOverlap(arrivalStart, arrivalEnd, existingArrivalStart, existingArrivalEnd)) {
      return false;
    }

    // 2) Job duration overlap
    const yourJobStart = arrivalStart;
    const yourJobEnd = jobEnd;
    const existingJobStart = existingArrivalStart;

    if (timesOverlap(yourJobStart, yourJobEnd, existingJobStart, existingJobEnd)) {
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
    const arrivalValue = formData.get("time"); // "HH:MM-HH:MM"

    if (!name || !email || !phone || !category || !service || !date || !arrivalValue) {
      messageEl.textContent = "Please complete all required fields.";
      messageEl.classList.add("error");
      return;
    }

    if (!agreeTerms.checked) {
      messageEl.textContent = "You must agree to the Terms & Conditions before booking.";
      messageEl.classList.add("error");
      return;
    }

    const serviceMinutes = SERVICE_MIN_DURATION[service] || 60;
    const [arrivalStart, arrivalEnd] = arrivalValue.split("-");

    // 1) Check if window can fit the service
    const fit = canWindowFitService(arrivalStart, arrivalEnd, serviceMinutes);

    if (!fit.ok) {
      const label = arrivalSelect.options[arrivalSelect.selectedIndex].textContent.trim();

      if (fit.reason === "window-too-short") {
        messageEl.textContent =
          `This service requires a minimum of ${serviceMinutes / 60} hours. ` +
          `${label} window cannot accommodate this service. ` +
          `Please choose an earlier arrival window.`;
      } else if (fit.reason === "cutoff") {
        messageEl.textContent =
          "This service cannot be scheduled in this window without exceeding our business-day cutoff. Please choose an earlier arrival window.";
      } else {
        messageEl.textContent = "This arrival window cannot accommodate the selected service.";
      }

      messageEl.classList.add("error");
      return;
    }

    const jobEnd = fit.jobEnd;

    // 2) Check for double-booking / overlap
    const available = await isSlotAvailable(date, arrivalStart, arrivalEnd, jobEnd);

    if (!available) {
      messageEl.textContent =
        "This arrival window is no longer available due to an existing booking. Please choose another window.";
      messageEl.classList.add("error");
      return;
    }

    // 3) Save booking in Supabase
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
      console.error("Error saving booking:", insertError);
      messageEl.textContent =
        "There was an issue saving your booking. Please try again or contact us directly.";
      messageEl.classList.add("error");
      return;
    }

    // 4) Optional: send EmailJS notification
    try {
      await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        name,
        email,
        phone,
        category,
        service,
        date,
        arrival_window: arrivalSelect.options[arrivalSelect.selectedIndex].textContent,
        details
      });
    } catch (err) {
      console.warn("EmailJS error (non-fatal):", err);
    }

    // 5) Success message
    messageEl.textContent = "Your booking request has been submitted successfully.";
    messageEl.classList.add("success");

    // Optionally reset form
    form.reset();
  });
});
