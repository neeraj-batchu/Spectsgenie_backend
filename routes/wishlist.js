const express = require("express");
const authenticateToken = require("../middleware/authentiactToken"); // Import the middleware
const { addWishlistItem, getWishlistItemsById, deleteProductFromWishlist } = require("../controller/wishlistController");

// Router object
const router = express.Router();

// Get all cart products (protected route)
router.get("/myWishlist/:id", authenticateToken, getWishlistItemsById);

// Add items to cart (protected route)
router.post("/addWishlistItem", authenticateToken, addWishlistItem);

router.delete("/deleteWishlistItem", authenticateToken, deleteProductFromWishlist);


module.exports = router;
