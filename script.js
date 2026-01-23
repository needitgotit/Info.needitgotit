  // ==========================================
// CONFIGURATION - REPLACE WITH YOUR KEYS
// ==========================================

const SUPABASE_URL = 'https://kuabmauutjchvvrfycxk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1YWJtYXV1dGpjaHZ2cmZ5Y3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDM2NjEsImV4cCI6MjA4MzQxOTY2MX0.7tNZxv8DD0qL23zRoFUgEWq7dby_2U6WgZiIie5hGWI';
const EMAILJS_PUBLIC_KEY = 'SU4xs5Go_As6GQEfL';
const EMAILJS_SERVICE_ID = 'service_tpy3o7q';
const EMAILJS_TEMPLATE_ID = 'template_7j2yea8';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzdzrwea'; // Optional fallback

// ==========================================
// INITIALIZE SERVICES
// ==========================================

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
emailjs.init(EMAILJS_PUBLIC_KEY);

// ==========================================
// SERVICE DATA
// ==========================================

const servicesByCategory = {
    home_property: [
        { id: 'cleaning', name: 'House Cleaning', price: '$50-$150' },
        { id: 'lawn_care', name: 'Lawn Care', price: '$40-$120' },
        { id: 'handyman', name: 'Handyman Services', price: '$60-$200' },
        { id: 'moving', name: 'Moving Help', price: '$80-$300' }
    ],
    personal_care: [
        { id: 'pet_sitting', name: 'Pet Sitting', price: '$25-$60' },
        { id: 'senior_care', name: 'Senior Companion Care', price: '$30-$80' },
        { id: 'tutoring', name: 'Tutoring', price: '$35-$100' },
        { id: 'fitness', name: 'Personal Training', price: '$40-$120' }
    ],
    creative_media: [
        { id: 'photography', name: 'Photography', price: '$100-$500' },
        { id: 'video', name: 'Videography', price: '$150-$800' },
        { id: 'graphic_design', name: 'Graphic Design', price: '$50-$300' },
        { id: 'web_design', name: 'Web Design', price: '$200-$1000' }
    ],
    events_promotion: [
        { id: 'event_setup', name: 'Event Setup', price: '$100-$400' },
        { id: 'social_media', name: 'Social Media Marketing', price: '$75-$500' },
        { id: 'flyer_distribution', name: 'Flyer Distribution', price: '$30-$150' },
        { id: 'brand_ambassador', name: 'Brand Ambassador', price: '$50-$200' }
    ]
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const form = document.getElementById('bookingForm');
const serviceCategory = document.getElementById('serviceCategory');
const serviceType = document.getElementById('serviceType');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const bookingDate = document.getElementById('bookingDate');

// ==========================================
// SET MINIMUM DATE TO TODAY
// ==========================================

const today = new Date().toISOString().split('T')[0];
bookingDate.setAttribute('min', today);

// ==========================================
// POPULATE SERVICE TYPE BASED ON CATEGORY
// ==========================================

serviceCategory.addEventListener('change', function() {
    const category = this.value;
    serviceType.innerHTML = '<option value="">Select a service...</option>';
    
    if (category && servicesByCategory[category]) {
        servicesByCategory[category].forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} (${service.price})`;
            serviceType.appendChild(option);
        });
        serviceType.disabled = false;
    } else {
        serviceType.disabled = true;
    }
});

// ==========================================
// FORM SUBMISSION
// ==========================================

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Disable button and show loader
    submitBtn.disabled = true;
    btnText.textContent = 'Processing...';
    loader.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    
    // Collect form data
    const formData = {
        customer_name: document.getElementById('customerName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service_category: serviceCategory.value,
        service_type: serviceType.options[serviceType.selectedIndex].text,
        booking_date: document.getElementById('bookingDate').value,
        arrival_window: document.getElementById('arrivalWindow').value,
        additional_details: document.getElementById('additionalDetails').value || null,
        status: 'pending',
        terms_accepted: document.getElementById('terms').checked,
        created_at: new Date().toISOString()
    };
    
    try {
        // ==========================================
        // STEP 1: SAVE TO SUPABASE (PRIMARY)
        // ==========================================
        
        const { data, error } = await supabase
            .from('bookings')
            .insert([formData])
            .select();
        
        if (error) throw error;
        
        console.log('✓ Booking saved to Supabase:', data);
        
        // ==========================================
        // STEP 2: SEND EMAIL VIA EMAILJS
        // ==========================================
        
        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                customer_name: formData.customer_name,
                customer_email: formData.email,
                phone: formData.phone,
                service: formData.service_type,
                booking_date: formData.booking_date,
                arrival_window: formData.arrival_window,
                additional_details: formData.additional_details || 'None'
            });
            
            console.log('✓ Confirmation email sent via EmailJS');
        } catch (emailError) {
            console.warn('⚠ EmailJS failed, but booking is saved:', emailError);
        }
        
        // ==========================================
        // STEP 3: SHOW SUCCESS
        // ==========================================
        
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
    } catch (error) {
        console.error('✗ Primary flow failed:', error);
        
        // ==========================================
        // FALLBACK: FORMSPREE (OPTIONAL)
        // ==========================================
        
        try {
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                console.log('✓ Fallback: Data sent to Formspree');
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
            } else {
                throw new Error('Formspree also failed');
            }
        } catch (fallbackError) {
            console.error('✗ All methods failed:', fallbackError);
            errorMessage.classList.remove('hidden');
        }
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        btnText.textContent = 'Book Now';
        loader.classList.add('hidden');
    }
});
