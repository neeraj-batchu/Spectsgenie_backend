const express = require("express");
const { sendOTP, verifyOTP } = require("../controller/loginController");

const router = express.Router();

//login
router.post("/login", sendOTP);

//verify otp
router.post("/verifyOtp", verifyOTP);


module.exports = router