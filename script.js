 // Booking Form State
let formData = {
    service_category: '',
    service_type: '',
    service_price: '',
    booking_date: null,
    arrival_window: '',
    customer_name: '',
    email: '',
    phone: '',
    additional_details: '',
    terms_accepted: false
};

let currentStep = 1;

// Corrected Service Data (Matches Flyer)
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

// Corrected Categories (Matches Flyer)
const categories = {
    home_property: { label: 'Home & Property Services', icon: '🏠' },
    personal_care: { label: 'Personal & Care', icon: '❤️' },
    creative_media: { label: 'Creative & Media', icon: '🎨' },
    events_promotion: { label: 'Events & Promotion', icon: '📣' }
};

const arrivalWindows = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM'
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createSparkles();
    renderForm();
});

// Create sparkle effects
function createSparkles() {
    const container = document.getElementById('sparkles');
    if (!container) return;

    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle absolute w-1 h-1 bg-yellow-300 rounded-full';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(sparkle);
    }
}

// Render Form
function renderForm() {
    const formContainer = document.getElementById('booking-form');

    const progressHTML = `
        <div class="mb-8">
            <div class="flex items-center justify-between mb-3">
                ${[1, 2, 3, 4].map(s => `
                    <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${currentStep >= s ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}">
                        ${currentStep > s ? '✓' : s}
                    </div>
                `).join('')}
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-500" style="width: ${((currentStep - 1) / 3) * 100}%"></div>
            </div>
        </div>
    `;
    
    let stepHTML = '';
    
    if (currentStep === 1) {
        stepHTML = `
            <h2 class="text-3xl font-bold text-gray-900 mb-2">What do you need?</h2>
            <p class="text-gray-600 mb-6">Select a service category to get started</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${Object.entries(categories).map(([key, cat]) => `
                    <div onclick="selectCategory('${key}')" class="cursor-pointer border-2 ${formData.service_category === key ? 'border-red-600 bg-red-50' : 'border-gray-200'} rounded-xl p-6 hover:border-red-600 hover:bg-red-50 transition-all">
                        <div class="text-4xl mb-3">${cat.icon}</div>
                        <h3 class="font-bold text-lg mb-1">${cat.label}</h3>
                    </div>
                `).join('')}
            </div>
        `;
    } 
    
    else if (currentStep === 2) {
        const categoryServices = services[formData.service_category] || [];
        stepHTML = `
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Choose your service</h2>
            <p class="text-gray-600 mb-6">Select the specific service you need</p>
            <div class="grid grid-cols-1 gap-3">
                ${categoryServices.map(service => `
                    <div onclick="selectService('${service.id}')" class="cursor-pointer border-2 ${formData.service_type === service.name ? 'border-red-600 bg-red-50' : 'border-gray-200'} rounded-xl p-4 hover:border-red-600 hover:bg-red-50 transition-all flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-lg">${service.name}</h3>
                        </div>
                        <div class="text-red-600 font-bold">${service.price}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } 
    
    else if (currentStep === 3) {
        stepHTML = `
            <h2 class="text-3xl font-bold text-gray-900 mb-2">When do you need it?</h2>
            <p class="text-gray-600 mb-6">Pick your preferred date and arrival window</p>
            <div class="space-y-6">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Select Date</label>
                    <input type="date" id="booking_date" value="${formData.booking_date || ''}" onchange="updateDate(this.value)" class="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none" min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Arrival Window</label>
                    <select id="arrival_window" onchange="updateWindow(this.value)" class="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none">
                        <option value="">Select a time window</option>
                        ${arrivalWindows.map(w => `<option value="${w}" ${formData.arrival_window === w ? 'selected' : ''}>${w}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    } 
    
    else if (currentStep === 4) {
        stepHTML = `
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Your details</h2>
            <p class="text-gray-600 mb-6">We'll use this to confirm your booking</p>
            <div class="space-y-5">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Full Name</label>
                    <input type="text" id="customer_name" value="${formData.customer_name}" onchange="updateField('customer_name', this.value)" placeholder="John Smith" class="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Email Address</label>
                    <input type="email" id="email" value="${formData.email}" onchange="updateField('email', this.value)" placeholder="john@example.com" class="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Phone Number</label>
                    <input type="tel" id="phone" value="${formData.phone}" onchange="updateField('phone', this.value)" placeholder="(321) 260-2212" class="w-full h-14 px-4 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2 uppercase">Additional Details (Optional)</label>
                    <textarea id="additional_details" onchange="updateField('additional_details', this.value)" placeholder="Any specific requirements..." class="w-full min-h-[100px] px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none">${formData.additional_details}</textarea>
                </div>
                <div class="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                    <input type="checkbox" id="terms" ${formData.terms_accepted ? 'checked' : ''} onchange="updateField('terms_accepted', this.checked)" class="mt-1 w-5 h-5">
                    <label for="terms" class="text-sm text-gray-700 cursor-pointer font-medium">
                        I have read and agree to the Terms & Conditions
                    </label>
                </div>
            </div>
        `;
    }
    
    const navigationHTML = `
        <div class="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200">
            ${currentStep > 1 ? '<button onclick="prevStep()" class="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:border-gray-400 transition-colors">← Back</button>' : '<div></div>'}
            ${currentStep < 4 
                ? '<button onclick="nextStep()" class="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-bold shadow-lg transition-colors">Continue →</button>' 
                : '<button onclick="submitForm()" class="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-bold shadow-lg transition-colors">✨ Submit Booking</button>'}
        </div>
    `;
    
    formContainer.innerHTML = progressHTML + stepHTML + navigationHTML;
}

// Form Actions
function selectCategory(category) {
    formData.service_category = category;
    formData.service_type = '';
    formData.service_price = '';
    renderForm();
}

function selectService(serviceId) {
    const service = services[formData.service_category].find(s => s.id === serviceId);
    formData.service_type = service.name;
    formData.service_price = service.price;
    renderForm();
}

function updateDate(value) {
    formData.booking_date = value;
}

function updateWindow(value) {
    formData.arrival_window = value;
}

function updateField(field, value) {
    formData[field] = value;
}

function nextStep() {
    if (validateStep()) {
        currentStep++;
        renderForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    currentStep--;
    renderForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep() {
    if (currentStep === 1 && !formData.service_category) {
        alert('Please select a category');
        return false;
    }
    if (currentStep === 2 && !formData.service_type) {
        alert('Please select a service');
        return false;
    }
    if (currentStep === 3) {
        if (!formData.booking_date) {
            alert('Please select a date');
            return false;
        }
        if (!formData.arrival_window) {
            alert('Please select an arrival window');
            return false;
        }
    }
    if (currentStep === 4) {
        if (!formData.customer_name.trim()) {
            alert('Name is required');
            return false;
        }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            alert('Valid email is required');
            return false;
        }
        if (!formData.phone.trim()) {
            alert('Phone is required');
            return false;
        }
        if (!formData.terms_accepted) {
            alert('You must accept the terms');
            return false;
        }
    }
    return true;
}

function submitForm() {
    if (!validateStep()) return;

    alert(
        `Booking submitted!\n\n` +
        `Service: ${formData.service_type}\n` +
        `Price: ${formData.service_price}\n` +
        `Date: ${formData.booking_date}\n` +
        `Window: ${formData.arrival_window}\n` +
        `Name: ${formData.customer_name}\n` +
        `Email: ${formData.email}\n\n` +
        `NOTE: Connect this to your backend API to actually save the booking.`
    );

    // Example backend call:
    /*
    fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = 'confirmation.html';
    });
    */
}
