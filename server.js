// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Application = require('./models/Application');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Routes

// Display the form
app.get('/', (req, res) => {
  res.render('index');
});

// Handle form submission
app.post('/apply', async (req, res) => {
  const { name, email, position, resume } = req.body;

  try {
    // Save application to MongoDB
    const application = new Application({ name, email, position, resume });
    await application.save();

    // Send email to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Internship Application',
      text: `A new internship application has been submitted:
        Name: ${name}
        Email: ${email}
        Position: ${position}
        Resume: ${resume}`
    };

    await transporter.sendMail(mailOptions);

    // Render success page
    res.render('success', { name });
  } catch (err) {
    res.status(500).send('Error submitting application');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
