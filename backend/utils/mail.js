const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(toEmail, username) {
  const otp = generateOTP();
  const payload = {
    username,
    otp,
  };

  // Sign token with short expiration
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "5m" });

  const mailOptions = {
    from: `"POWER CONSUMPTION TRACKER OTP" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Code",
    html: `
      <p>Hello <strong>${username}</strong>,</p>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("OTP email sent:", info.response);

  return token;
  }


function verifyOTP(token, inputOtp) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET); // will throw if expired
    console.log("Decoded Token:", decoded);
    return decoded.otp === inputOtp;
  } catch (err) {
    console.error("OTP verification error:", err.message);
    return false;
  }
}


module.exports = { sendOTPEmail, verifyOTP };
