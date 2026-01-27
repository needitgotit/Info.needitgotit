// Service data aligned with flyer
const services = {
    home_property: [
        { id: 'home_cleaning', name: 'Home Cleaning', price: 'From $39/hr' },
        { id: 'window_cleaning', name: 'Window Cleaning', price: 'From $34/hr' },
        { id: 'property_cleaning', name: 'Property Cleaning', price: 'From $45/hr' },
        { id: 'interior_decoration', name: 'Interior Decoration', price: 'From $45/hr' }
    ],
    personal_care: [
        { id: 'babysitting', name: 'Babysitting', price: 'From $22/hr' },
        { id: 'dog_walking', name: 'Dog Walking', price: 'From $18/hr' },
        { id: 'personal_shopper', name: 'Personal Shopper', price: 'From $25/hr' },
        { id: 'assistant', name: 'Assistant', price: 'From $28/hr' },
        { id: 'delivery_assistance', name: 'Delivery Assistance', price: 'From $25/hr' }
    ],
    creative_media: [
        { id: 'vocalist', name: 'Vocalist', price: 'From $45/hr' },
        { id: 'songwriting', name: 'Songwriting', price: 'From $50/hr' },
        { id: 'model', name: 'Model', price: 'From $30/hr' },
        { id: 'clothing_stylist', name: 'Clothing Stylist', price: 'From $35/hr' },
        { id: 'food_reviewer', name: 'Food Reviewer', price: 'From $50/hr' }
    ],
    events_promotion: [
        { id: 'event_staff', name: 'Event Staff', price: 'From $18/hr' },
        { id: 'cater_help', name: 'Cater Help', price: 'From $20/hr' },
        { id: 'promoter', name: 'Promoter', price: 'From $25/hr' },
        { id: 'sales', name: 'Sales', price: '$40/hr or commission' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm');
    const categorySelect = document.getElementById('service_category');
    const serviceSelect = document.getElementById('service_type');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');

    // Populate services when category changes
    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        serviceSelect.innerHTML = '<option value="">Select a service</option>';

        if (!category || !services[category]) return;

        services[category].forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} (${service.price})`;
            serviceSelect.appendChild(option);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.add('hidden');
        successMessage.classList.add('hidden');

        const formData = collectFormData();

        if (!validateForm(formData)) {
            errorMessage.classList.remove('hidden');
            return;
        }

        // Visual feedback
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';

        try {
            // 🔗 PLACEHOLDER: Send to your backend / EmailJS / Formspree / Supabase
            // Example structure (you plug in the real endpoint or EmailJS call):
            /*
            await fetch('YOUR_BACKEND_ENDPOINT_HERE', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            */

            // If using EmailJS directly in frontend, you'd call emailjs.send(...) here.

            successMessage.classList.remove('hidden');
            form.reset();
            // Reset service dropdown
            serviceSelect.innerHTML = '<option value="">Select a service</option>';
        } catch (err) {
            console.error(err);
            errorMessage.textContent = 'Something went wrong. Please try again in a moment.';
            errorMessage.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});

function collectFormData() {
    const category = document.getElementById('service_category').value;
    const serviceId = document.getElementById('service_type').value;
    const bookingDate = document.getElementById('booking_date').value;
    const arrivalWindow = document.getElementById('arrival_window').value;
    const customerName = document.getElementById('customer_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const additionalDetails = document.getElementById('additional_details').value.trim();
    const termsAccepted = document.getElementById('terms').checked;

    let serviceName = '';
    let servicePrice = '';

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
        booking_date: bookingDate,
        arrival_window: arrivalWindow,
        customer_name: customerName,
        email,
        phone,
        additional_details: additionalDetails,
        terms_accepted: termsAccepted
    };
}

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
