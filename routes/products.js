const express = require("express");
const { getAllProducts, getProductById, addProduct } = require("../controller/productController");
const authenticateToken = require("../middleware/authentiactToken"); // Import the middleware

//router object
const router = express.Router();

//get all products
router.get("/allProducts", authenticateToken,getAllProducts);

//get product by ID
router.get("/getProductById/:id", authenticateToken, getProductById)

//Add Product
router.post("/addProduct",authenticateToken, addProduct)


module.exports = router