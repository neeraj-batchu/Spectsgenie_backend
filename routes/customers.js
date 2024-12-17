const express = require("express");
const { getAllCustomers, getCustomerById, addNewCustomer, getCustomerAddresses } = require("../controller/customersController");
const authenticateToken = require("../middleware/authentiactToken"); // Import the middleware

//router object
const router = express.Router();

//get all products
router.get("/allCustomers",authenticateToken, getAllCustomers);

//get product by ID
router.get("/getCustomerById/:id", authenticateToken, getCustomerById)

//Add Product
router.post("/addCustomer", authenticateToken, addNewCustomer)

//Get customer addresses
router.get("/getCustomerAddresses/:id", authenticateToken, getCustomerAddresses)


module.exports = router