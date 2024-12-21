const express = require("express");
const { getLensTypes, getLensPackages } = require("../controller/lensTypesController");

//router object
const router = express.Router();

//get all cart products
router.get("/getLensTypesById/:id", getLensTypes);

//Add items to cart
router.get("/getLensPackageById/:id", getLensPackages)


module.exports = router