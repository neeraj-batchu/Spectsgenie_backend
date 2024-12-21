const express = require("express");
const { getAllCustomers, getCustomerById, addNewCustomer, getCustomerAddresses } = require("../controller/customersController");

//router object
const router = express.Router();

//get all products
router.get("/allCustomers", getAllCustomers);

//get product by ID
router.get("/getCustomerById/:id",  getCustomerById)

//Add Product
router.post("/addNewCustomer",  addNewCustomer)

//Get customer addresses
router.get("/getCustomerAddresses/:id",  getCustomerAddresses)


module.exports = router