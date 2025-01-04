const express = require("express");
const { getCartItemsById, addCartItem, deleteProductFromCart, addContactLensToCart } = require("../controller/cartController");
const authenticateToken = require("../middleware/authentiactToken"); // Import the middleware

// Router object
const router = express.Router();

// Get all cart products (protected route)
router.get("/myCart/:id", authenticateToken, getCartItemsById);

// Add items to cart (protected route)
router.post("/addToCart", authenticateToken, addCartItem);

router.delete("/deleteFromCart/:id", authenticateToken, deleteProductFromCart);

router.post("/addContactLensToCart", authenticateToken, addContactLensToCart);


module.exports = router;
