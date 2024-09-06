require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);


const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',  // Correct SMTP host for Outlook
    port: 587,                   // Port for TLS
    secure: false,               // Use false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
       const info = await transporter.sendMail(mailOptions);
       console.log('Email sent: ', info.response);
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

module.exports = { sendEmail };
