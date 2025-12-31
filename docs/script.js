// server.js
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

app.post("/api/book", async (req, res) => {
  const data = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "yourbusiness@gmail.com",
      pass: "APP_PASSWORD"
    }
  });

  const mailOptions = {
    from: "Need It! Got It! <yourbusiness@gmail.com>",
    to: data.email,
    subject: "Booking Confirmation – Need It! Got It!",
    html: `
      <h2>Booking Confirmed</h2>
      <p><strong>Service:</strong> ${data.service}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p>We’ll contact you shortly to finalize details.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  res.status(200).send("Booking received");
});

app.listen(3000, () => console.log("Server running"));
