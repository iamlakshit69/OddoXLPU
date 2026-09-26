const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/auth.controller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
