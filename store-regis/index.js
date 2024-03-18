const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://localhost:27017/Database');
const db = mongoose.connection;
db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'shamsundar.k2005@gmail.com',
        pass: 'dcmd ibmy buiu zqsx',
    },
    debug: true,
});

// Sending email function
const sendEmail = (email, name) => {
    const mailOptions = {
        from: 'shamsundar.k2005@gmail.com',
        to: email,
        subject: 'Registration Confirmation',
        text: `Dear ${name},\n\nThank you for registering. Your registration details have been successfully recorded.\n\nBest regards,\nThe Organizing Team`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error in sending email: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

// Define the Registration schema
const registrationSchema = new mongoose.Schema({
    name: String,
    College: String,
    email: String,
    phno: String,
    gender: String,
    Accommodation: String,
    transactionId: String
});

// Create the Registration model
const Registration = mongoose.model('Registration', registrationSchema);

app.post("/sign_up", (req, res) => {
    const { name, age, email, phno, gender, password, Accommodation } = req.body;

    const newRegistration = new Registration({
        name,
        College: age,
        email,
        phno,
        gender,
        Accommodation,
        transactionId: password
    });

    newRegistration.save()
        .then(() => {
            console.log("Record Inserted Successfully");

            // Call the sendEmail function
            sendEmail(email, name);

            res.redirect('signup_successful.html');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error saving data');
        });
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Route to view registered data
app.get("/view", async (req, res) => {
    try {
        const registrations = await Registration.find();
        res.render('viewRegistrations', { registrations });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/", (req, res) => {
    res.set({
        "Allow-acces-Allow-Origin": '*'
    })
    return res.redirect('index.html')
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
