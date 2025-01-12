const express = require("express");
const { getCartItemsById, addCartItem, deleteProductFromCart, addContactLensToCart, getLocalCartData, addMultipleCartItems } = require("../controller/cartController");

// Router object
const router = express.Router();

// Get all cart products (protected route)
router.get("/myCart/:id",  getCartItemsById);

// Add items to cart (protected route)
router.post("/addToCart", addCartItem);

router.delete("/deleteFromCart/:id", deleteProductFromCart);

router.post("/addContactLensToCart", addContactLensToCart);

router.post("/getLocalCartData", getLocalCartData);

router.post("/addMultipleCartData", addMultipleCartItems);


module.exports = router;
