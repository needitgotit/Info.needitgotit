/* ============================
   CONFIGURATION KEYS
============================ */
const SUPABASE_URL = "https://kuabmauutjchvvrfycxk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI";

const EMAILJS_PUBLIC_KEY = "SU4xs5Go_As6GQEfL";
const EMAILJS_SERVICE_ID = "service_tpy3o7q";
const EMAILJS_TEMPLATE_ID = "template_7j2yea8";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzdzrwea";

/* ============================
   EMAILJS INITIALIZATION
============================ */
emailjs.init(EMAILJS_PUBLIC_KEY);

/* ============================
   SERVICE DATA (MATCHES FLYER)
============================ */
const services = {
    home_property: [
        { id: "home_cleaning", name: "Home Cleaning", price: "From $39/hr" },
        { id: "window_cleaning", name: "Window Cleaning", price: "From $34/hr" },
        { id: "property_cleaning", name: "Property Cleaning", price: "From $45/hr" }
    ],
    personal_care: [
        { id: "babysitting", name: "Babysitting", price: "From $22/hr" },
        { id: "dog_walking", name: "Dog Walking", price: "From $18/hr" },
        { id: "personal_shopper", name: "Personal Shopper", price: "From $25/hr" },
        { id: "assistant", name: "Assistant", price: "From $28/hr" },
        { id: "delivery_assistance", name: "Delivery Assistance", price: "From $25/hr" }
    ],
    creative_media: [
        { id: "vocalist", name: "Vocalist", price: "From $45/hr" },
        { id: "songwriting", name: "Songwriting", price: "From $50/hr" },
        { id: "model", name: "Model", price: "From $30/hr" }
    ],
    events_promotion: [
        { id: "event_staff", name: "Event Staff", price: "From $18/hr" },
        { id: "cater_help", name: "Cater Help", price: "From $20/hr" },
        { id: "promoter", name: "Promoter", price: "From $25/hr" }
    ]
};

/* ============================
   DOM ELEMENTS
============================ */
const form = document.getElementById("bookingForm");
const categorySelect = document.getElementById("service_category");
const serviceSelect = document.getElementById("service_type");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const submitBtn = document.getElementById("submitBtn");

/* ============================
   POPULATE SERVICES ON CATEGORY CHANGE
============================ */
categorySelect.addEventListener("change", () => {
    const category = categorySelect.value;

    // Reset service dropdown
    serviceSelect.innerHTML = `<option value="">Select a service</option>`;

    if (!category || !services[category]) return;

    // Create optgroup for the selected category
    const group = document.createElement("optgroup");
    group.label = categorySelect.options[categorySelect.selectedIndex].text;

    services[category].forEach(service => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = `${service.name} (${service.price})`;
        group.appendChild(option);
    });

    serviceSelect.appendChild(group);
});

/* ============================
   FORM SUBMISSION
============================ */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMessage.classList.add("hidden");
    successMessage.classList.add("hidden");

    const data = collectFormData();

    if (!validateForm(data)) {
        errorMessage.classList.remove("hidden");
        return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Submitting...";

    try {
        /* ============================
           SEND EMAIL TO CUSTOMER
        ============================ */
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);

        /* ============================
           SEND EMAIL TO ADMIN
        ============================ */
        await emailjs.send(EMAILEMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            ...data,
            admin_copy: "YES"
        });

        /* ============================
           FORMSPREE BACKUP
        ============================ */
        await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        successMessage.classList.remove("hidden");
        form.reset();
        serviceSelect.innerHTML = `<option value="">Select a service</option>`;

    } catch (err) {
        console.error(err);
        errorMessage.textContent = "Something went wrong. Please try again.";
        errorMessage.classList.remove("hidden");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

/* ============================
   COLLECT FORM DATA
============================ */
function collectFormData() {
    const category = categorySelect.value;
    const serviceId = serviceSelect.value;

    let serviceName = "";
    let servicePrice = "";

    if (category && services[category]) {
        const service = services[category].find(s => s.id === serviceId);
        if (service) {
            serviceName = service.name;
            servicePrice = service.price;
        }
    }

    return {
        service_category: category,
        service_id: serviceId,
        service_name: serviceName,
        service_price: servicePrice,
        booking_date: document.getElementById("booking_date").value,
        arrival_window: document.getElementById("arrival_window").value,
        customer_name: document.getElementById("customer_name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        additional_details: document.getElementById("additional_details").value.trim(),
        terms_accepted: document.getElementById("terms").checked
    };
}

/* ============================
   VALIDATION
============================ */
function validateForm(data) {
    if (!data.service_category) return false;
    if (!data.service_id) return false;
    if (!data.booking_date) return false;
    if (!data.arrival_window) return false;
    if (!data.customer_name) return false;
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return false;
    if (!data.phone) return false;
    if (!data.terms_accepted) return false;
    return true;
}
