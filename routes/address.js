const express = require("express");
const { addAddress, deleteAddress } = require("../controller/addressController");

// Router object
const router = express.Router();

// Add items to cart (protected route)
router.post("/addAddress", addAddress);

router.delete("/deleteAddress/:id", deleteAddress);


module.exports = router;