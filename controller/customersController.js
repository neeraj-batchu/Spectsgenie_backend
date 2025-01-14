const db = require("../config/db");
const axios = require('axios');
const path = require('path'); // Import the path module
const mime = require('mime-types'); // Import mime-types for MIME type detection

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

//Add user
const addNewCustomer = async (req, res) => {
    try {
        console.log("Start of function");
        const {
            name,
            password,
            mobile,
            email,
            referral_code,
            is_google_user,
            google_profile_id,
        } = req.body;

        if (!name || !password || !mobile || !email) {
            console.log("Validation failed");
            return res.status(400).json({
                success: false,
                message: "Required fields are missing: name, password, mobile, email",
            });
        }

        const bcrypt = require('bcrypt');
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        const sqlQuery = `
            INSERT INTO sg_customer_online(name, password, mobile, email, referral_code, is_google_user, google_profile_id)   
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            name,
            hashedPassword,
            mobile,
            email,
            referral_code || null,
            is_google_user || null,
            google_profile_id || null,
        ];

        console.log("Executing query...");
        const result = await db.query(sqlQuery, values);  // Directly use db.query without promisify

        console.log("Query successful:", result);

        res.status(201).json({
            success: true,
            message: "Customer added successfully",
            customerId: result.insertId,
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

const editCustomer = async (req, res) => {
    try {
        console.log("Start of function");
        const {
            name,
            mobile,
            email,
            id
        } = req.body;

        const sqlQuery = `
            UPDATE sg_customer_online 
            SET name = ?, mobile = ?, email = ? 
            WHERE id = ?
        `;

        const values = [
            name,
            mobile,
            email,
            id
        ];

        console.log("Executing query...");
        const result = await db.query(sqlQuery, values);  // Directly use db.query without promisify

        console.log("Query successful:", result);

        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
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


const fetchFile = async(req, res) => {
    const { url } = req.query;
  
      if (!url) {
          return res.status(400).json({ error: 'URL is required' });
      }
  
 
      try {
        console.log('Fetching URL:', url); // Log the URL
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        const fileExtension = path.extname(url).substring(1);
        const mimeType = mime.lookup(fileExtension) || 'application/octet-stream';
        const base64Data = Buffer.from(response.data, 'binary').toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        res.json({ data: dataUrl });
    } catch (error) {
        console.error('Error fetching the file:', error.response?.status, error.response?.data || error.message);
        res.status(500).json({ error: `Failed to fetch the file: ${error.message}` });
    }
}


module.exports = {getAllCustomers , getCustomerById, getCustomerAddresses, addNewCustomer, editCustomer, fetchFile};