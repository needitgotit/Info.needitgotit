 async function loadTimes() {
  console.clear();
  console.log("=== LOAD TIMES TRIGGERED ===");

  timeSelect.innerHTML = `<option value="">Select time</option>`;
  timeSelect.disabled = true;

  console.log("SERVICE:", service.value);
  console.log("DATE:", date.value);

  if (!service.value || !date.value) {
    console.log("STOP: Missing service or date.");
    return;
  }

  const duration = durations[service.value] || 60;
  console.log("DURATION (min):", duration);

  // -----------------------------
  // SUPABASE QUERY
  // -----------------------------
  console.log("Fetching bookings from Supabase…");

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("start_minutes, service")
    .eq("date", date.value);

  console.log("SUPABASE RESULT:", bookings);
  console.log("SUPABASE ERROR:", error);

  let blocked = [];

  if (!error && bookings) {
    blocked = bookings.map(b => {
      const d = durations[b.service] || 60;
      return { start: b.start_minutes, end: b.start_minutes + d };
    });
  }

  console.log("BLOCKED TIME RANGES:", blocked);

  // -----------------------------
  // TIME SLOT GENERATION
  // -----------------------------
  console.log("Generating time slots…");

  let slotCount = 0;

  for (let start = 450; start + duration <= 1140; start += 30) {
    const end = start + duration;

    const overlaps = blocked.some(b =>
      start < b.end && end > b.start
    );

    console.log(
      `CHECK SLOT: ${slotLabel(start, duration)} | Overlaps:`,
      overlaps
    );

    if (overlaps) continue;

    const opt = document.createElement("option");
    opt.value = start;
    opt.textContent = slotLabel(start, duration);
    timeSelect.appendChild(opt);

    slotCount++;
  }

  console.log("TOTAL SLOTS GENERATED:", slotCount);

  if (slotCount === 0) {
    console.log("NO AVAILABLE SLOTS — adding message");
    const opt = document.createElement("option");
    opt.textContent = "No availability";
    opt.disabled = true;
    timeSelect.appendChild(opt);
  }

  timeSelect.disabled = false;
  console.log("=== LOAD TIMES COMPLETE ===");
}
