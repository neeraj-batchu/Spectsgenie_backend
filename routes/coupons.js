const express = require("express");
const authenticateToken = require("../middleware/authentiactToken"); // Import the middleware
const { getAllCoupons } = require("../controller/couponsController");

//router object
const router = express.Router();

//get all Coupons
router.get("/allCoupons", authenticateToken, getAllCoupons);


module.exports = router