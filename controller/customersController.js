const db = require("../config/db");

//Get all Customers
const getAllCustomers = async (req,res) => {
    try {
        const data = await db.query("SELECT * FROM sg_customer");
        if(!data){
            res.status(404).send({
                success: false,
                message: "No records found"
            })
        }else{
            res.status(200).send({
                success: true,
                message: "Records fetched",
                data: data[0],
                totalRecords: data[0].length
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}

//Get Customer by ID
const getCustomerById = async (req,res) => {
    try {
        const customerId = req.params.id;
        const data = await db.query("SELECT * FROM sg_customer WHERE cu_id = ?",[customerId] );
        if(!data){
            res.status(404).send({
                success: false,
                message: "No records found"
            })
        }else{
            res.status(200).send({
                success: true,
                message: "Records fetched",
                data: data[0],
                totalRecords: data[0].length
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}

//Add Product
const addNewCustomer = async (req, res) => {
    try {
        const {
            name,
            password,
            mobile,
            email,
            referral_code,
            is_google_user,
            google_profile_id
        } = req.body;

        // Input validation (optional but recommended)
        if (!name || !password || !mobile || !email) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing: name, password, mobile, email",
            });
        }

        // SQL query
        const query = `
            INSERT INTO sg_customer_online (
                name, password, mobile, email, referral_code, 
                is_google_user, google_profile_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // Values to insert
        const values = [
            name,
            password,
            mobile,
            email,
            referral_code || "", // Optional field
            is_google_user || 0, // Default to 0 if not provided
            google_profile_id || "" // Optional field
        ];

        // Execute query
        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error inserting customer data:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to insert customer data",
                    error: err.message,
                });
            }

            // Successful insertion
            res.status(201).json({
                success: true,
                message: "Customer added successfully",
                customerId: result.insertId, // Return the new customer's ID
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};

//Get Addresses by ID
const getCustomerAddresses = async (req,res) => {
    try {
        const customerId = req.params.id;
        const data = await db.query("SELECT * FROM sg_customer_address WHERE customer_id = ?",[customerId] );
        if(!data){
            res.status(404).send({
                success: false,
                message: "No records found"
            })
        }else{
            res.status(200).send({
                success: true,
                message: "Records fetched",
                data: data[0],
                totalRecords: data[0].length
            })
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}



module.exports = {getAllCustomers , getCustomerById, getCustomerAddresses, addNewCustomer};