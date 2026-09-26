const bcrypt = require("bcryptjs");
const { User } = require("../models");
const generateToken = require("../utils/generateToken");
const { generateOtp, getOtpExpiry, sendOtpEmail } = require("../utils/otp");

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "name, email and password are required" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role && ["MANAGER", "WAREHOUSE_STAFF", "ADMIN"].includes(role) ? role : "WAREHOUSE_STAFF",
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "email is required" });
    }

    const user = await User.findOne({ where: { email } });
    // Don't reveal whether the email exists - always respond success-shaped.
    if (user) {
      const otp = generateOtp();
      user.otpCode = otp;
      user.otpExpiresAt = getOtpExpiry();
      await user.save();
      await sendOtpEmail(user.email, otp);
    }

    res.json({ success: true, data: { message: "If that email exists, an OTP has been sent." } });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: "email, otp and newPassword are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (
      !user ||
      !user.otpCode ||
      user.otpCode !== otp ||
      !user.otpExpiresAt ||
      new Date() > new Date(user.otpExpiresAt)
    ) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ success: true, data: { message: "Password has been reset. Please log in." } });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (protected)
async function getMe(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "createdAt"],
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, forgotPassword, resetPassword, getMe };
