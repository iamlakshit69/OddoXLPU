const crypto = require("crypto");

function generateOtp() {
  // 6-digit numeric OTP
  return crypto.randomInt(100000, 999999).toString();
}

function getOtpExpiry() {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

// Swap this out for real Nodemailer/SendGrid/etc once you have credentials.
// Keeping it as a single function means the rest of the code never has to change.
async function sendOtpEmail(toEmail, otp) {
  console.log(`[OTP] Sending OTP ${otp} to ${toEmail}`);
  // Example real implementation with Nodemailer:
  //
  // const transporter = nodemailer.createTransport({ service: "gmail", auth: {...} });
  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: toEmail,
  //   subject: "StockSense password reset OTP",
  //   text: `Your OTP is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES} minutes.`,
  // });
  return true;
}

module.exports = { generateOtp, getOtpExpiry, sendOtpEmail };
