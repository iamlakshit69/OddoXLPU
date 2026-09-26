const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ---------------------------------------------------------------------------
// generateOtp()
// Returns a cryptographically random 6-digit string (100000–999999).
// ---------------------------------------------------------------------------
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// ---------------------------------------------------------------------------
// getOtpExpiry()
// Returns a Date that is OTP_EXPIRY_MINUTES from now (default: 10 min).
// ---------------------------------------------------------------------------
function getOtpExpiry() {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

// ---------------------------------------------------------------------------
// createTransporter()
// Builds a Nodemailer transport from environment variables.
//
// Supported env vars:
//   EMAIL_SERVICE  — e.g. "gmail", "yahoo", "hotmail"  (default: "gmail")
//   EMAIL_HOST     — custom SMTP host (overrides EMAIL_SERVICE if set)
//   EMAIL_PORT     — custom SMTP port (default: 587)
//   EMAIL_SECURE   — "true" for TLS port 465 (default: false → STARTTLS)
//   EMAIL_USER     — sender address / SMTP username
//   EMAIL_PASS     — sender password / app-password / SMTP password
// ---------------------------------------------------------------------------
function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } =
    process.env;

  if (EMAIL_HOST) {
    // Custom SMTP server (SendGrid, Mailgun, your own server, etc.)
    return nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT) || 587,
      secure: EMAIL_SECURE === "true",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }

  // Well-known service shortcut (gmail, yahoo, hotmail, …)
  return nodemailer.createTransport({
    service: EMAIL_SERVICE || "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

// ---------------------------------------------------------------------------
// sendOtpEmail(toEmail, otp)
//
// Sends the OTP to the user's email address.
//
// In DEVELOPMENT (EMAIL_USER not set):
//   Falls back to console.log so the app still works without a real mailbox.
//   The OTP is visible in your terminal / server logs.
//
// In PRODUCTION (EMAIL_USER + EMAIL_PASS set in .env):
//   Sends a real email through Nodemailer.
//
// Gmail setup:
//   1. Enable 2-Step Verification on your Google account.
//   2. Create an App Password at myaccount.google.com → Security → App Passwords.
//   3. Set EMAIL_USER=your@gmail.com  and  EMAIL_PASS=<16-char-app-password> in .env.
// ---------------------------------------------------------------------------
async function sendOtpEmail(toEmail, otp) {
  const { RESEND_API_KEY, RESEND_FROM, EMAIL_USER, NODE_ENV } = process.env;
  const expiryMinutes = process.env.OTP_EXPIRY_MINUTES || 10;

  // Always log OTP to server logs so admins / devs can see it immediately on Render logs
  console.log(`[OTP] ==========================================`);
  console.log(`[OTP] Password reset OTP for ${toEmail}: ${otp}`);
  console.log(`[OTP] Valid for ${expiryMinutes} minutes`);
  console.log(`[OTP] ==========================================`);

  const subject = "StockSense — Your Password Reset OTP";
  const text = [
    `Hello,`,
    ``,
    `You requested a password reset for your StockSense account.`,
    ``,
    `Your One-Time Password (OTP) is:`,
    ``,
    `  ${otp}`,
    ``,
    `This code expires in ${expiryMinutes} minutes.`,
    ``,
    `If you did not request this, please ignore this email.`,
    ``,
    `— StockSense`,
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="color:#1d4ed8;margin-bottom:8px;">StockSense</h2>
      <h3 style="margin-top:0;color:#111827;">Password Reset OTP</h3>
      <p style="color:#374151;">You requested a password reset. Use the OTP below:</p>
      <div style="background:#f3f4f6;border-radius:6px;padding:20px 32px;text-align:center;margin:24px 0;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1d4ed8;">${otp}</span>
      </div>
      <p style="color:#6b7280;font-size:14px;">
        This code expires in <strong>${expiryMinutes} minutes</strong>.<br>
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  // 1. Resend HTTP API (Recommended for Render, Vercel, Railway - bypasses SMTP port blocking)
  if (RESEND_API_KEY) {
    try {
      const { Resend } = require("resend");
      const resend = new Resend(RESEND_API_KEY);
      const from = RESEND_FROM || "StockSense <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({
        from,
        to: toEmail,
        subject,
        text,
        html,
      });

      if (error) {
        console.error(`[OTP] Resend delivery error:`, error.message || error);
      } else {
        console.log(`[OTP] Email delivered via Resend to ${toEmail} (ID: ${data?.id})`);
      }
      return;
    } catch (err) {
      console.error(`[OTP] Failed to send via Resend:`, err.message);
      return;
    }
  }

  // 2. SMTP / Nodemailer fallback (Works locally or on paid cloud instances where SMTP ports 587/465 are unblocked)
  if (EMAIL_USER) {
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: `"StockSense" <${EMAIL_USER}>`,
        to: toEmail,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[OTP] Email sent via SMTP to ${toEmail} (Message ID: ${info.messageId})`);
    } catch (err) {
      console.error(
        `[OTP] SMTP send failed (${err.message}). ` +
        `Note: Render Free Tier blocks outbound SMTP (ports 25, 465, 587). ` +
        `Set RESEND_API_KEY in Render environment variables to send emails via HTTP API.`
      );
    }
    return;
  }

  // 3. Fallback when neither is configured
  console.warn(`[OTP] Neither RESEND_API_KEY nor EMAIL_USER configured. Check server logs above for the OTP.`);
}

module.exports = { generateOtp, getOtpExpiry, sendOtpEmail };
