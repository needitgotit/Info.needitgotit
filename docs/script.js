const services = {
  "home": {
    label: "Home & Property Services",
    items: [
      { name: "Home Cleaning", price: "From $39/hr", description: "General residential cleaning services." },
      { name: "Window Cleaning", price: "From $34/hr", description: "Interior and exterior window cleaning." },
      { name: "Property Cleaning", price: "From $45/hr", description: "Full property cleanups and turnovers." },
      { name: "Yard Management", price: "From $45/hr", description: "Lawn care, cleanup, and outdoor maintenance." },
      { name: "Business Management", price: "From $49/hr", description: "Operational and administrative support." },
      { name: "Organizer", price: "From $29/hr", description: "Home and workspace organization." },
      { name: "Interior Decoration", price: "From $45/hr", description: "Interior styling and decorating support." }
    ]
  },

  "personal": {
    label: "Personal & Care",
    items: [
      { name: "Babysitting", price: "From $22/hr", description: "Reliable childcare services." },
      { name: "Dog Walking", price: "From $18/hr", description: "Dog walking and pet exercise." },
      { name: "Personal Shopper", price: "From $25/hr", description: "Errands and shopping assistance." },
      { name: "Assistant", price: "From $28/hr", description: "Personal assistance and task support." },
      { name: "Friendship", price: "FREE", description: "Companionship and support services." }
    ]
  },

  "delivery": {
    label: "Delivery & Support",
    items: [
      { name: "Vocalist", price: "From $45/hr", description: "Professional vocal performance services." },
      { name: "Songwriting", price: "From $40/hr", description: "Custom songwriting services." },
      { name: "Model", price: "From $50/hr", description: "Modeling for events or promotions." },
      { name: "Clothing Stylist", price: "From $35/hr", description: "Personal and fashion styling." },
      { name: "Food Reviewer", price: "From $35/hr", description: "Food tasting and review services." }
    ]
  },

  "events": {
    label: "Events & Promotion",
    items: [
      { name: "Event Staff", price: "From $30/hr", description: "Professional staffing for events." },
      { name: "Cater Help", price: "From $28/hr", description: "Catering and food service assistance." },
      { name: "Promoter", price: "From $35/hr", description: "Brand and event promotion." },
      { name: "Sales", price: "$40/hr or commission", description: "Sales representation and support." }
    ]
  }
};

// Populate services dropdown
function loadServices() {
  const categoryKey = document.getElementById("category").value;
  const serviceSelect = document.getElementById("service");

  serviceSelect.innerHTML = "";
  if (!services[categoryKey]) return;

  services[categoryKey].items.forEach(service => {
    const option = document.createElement("option");
    option.value = service.name;
    option.textContent = `${service.name} — ${service.price}`;
    option.dataset.description = service.description;
    serviceSelect.appendChild(option);
  });
}

// Show description below select
document.getElementById("service").addEventListener("change", function() {
  const selected = this.selectedOptions[0];
  const desc = selected ? selected.dataset.description : "";
  let descEl = document.getElementById("service-description");

  if (!descEl) {
    descEl = document.createElement("p");
    descEl.id = "service-description";
    this.parentNode.appendChild(descEl);
  }
  descEl.textContent = desc;
});

// Booking confirmation
function bookService() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const service = document.getElementById("service").value;
  const time = document.getElementById("time").value;

  if (!name || !email || !service || !time) {
    alert("Please complete all booking fields.");
    return;
  }

  alert(
    `Booking Confirmed!\n\n` +
    `Service: ${service}\n` +
    `Scheduled: ${time}\n\n` +
    `A confirmation will be sent to info.needitgotit@gmail.com`
  );
}
