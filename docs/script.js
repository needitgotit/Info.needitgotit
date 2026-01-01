// Customer
const templateParamsCustomer = {
  name: data.name,        // matches {{name}}
  service: data.service,  // matches {{service}}
  date: data.date,        // matches {{date}}
  time: data.time,        // matches {{time}}
  details: data.details || "None",  // matches {{details}}
  to_email: data.email    // actual recipient email
};

// Business
const templateParamsBusiness = {
  name: data.name,
  service: data.service,
  date: data.date,
  time: data.time,
  details: data.details || "None",
  to_email: "info.needitgotit@gmail.com"
};

