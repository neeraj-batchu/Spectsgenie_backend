const express = require("express");
const { getProfileDetails } = require("../controller/profileController");
const authenticateToken = require("../middleware/authentiactToken"); // Import the middleware

const router = express.Router();

//get Profile Details
router.get("/getProfileDetails/:id", authenticateToken, getProfileDetails);

module.exports = router