const db = require("../config/db");


//Add Product to cart
const addAddress = async (request, response) => {
    try {
        console.log("Start of function");

        // Destructure fields from request body based on query columns
        const {
            customerId,
            addressName,
            addressLine1,
            addressLine2,
            pincode,
            city,
            state,
            country
        } = request.body;

        // Input validation
        if (
            !customerId ||
            !addressName ||
            !addressLine1 ||
            !pincode ||
            !city ||
            !state ||
            !country
        ) {
            console.log("Validation failed:", request.body);
            return response.status(400).json({
                success: false,
                message: "Required fields are missing: customerId, addressName, addressLine1, pincode, city, state, country",
            });
        }

        // SQL query
        const sqlQuery = `
            INSERT INTO sg_customer_address
            (customer_id, address_name, address_line_1, address_line_2, pincode, city, state, country)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;

        // Map values from the request body
        const values = [
            customerId,
            addressName,
            addressLine1,
            addressLine2 || '', // Default to empty string if not provided
            pincode,
            city,
            state,
            country
        ];

        console.log("Executing query...");
        const result = await db.query(sqlQuery, values); // Execute query with values

        console.log("Query successful:", result);

        response.status(201).json({
            success: true,
            message: "Customer address added successfully",
            addressId: result.insertId,
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        response.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};


const deleteAddress = async (req, res) => {
    try {
        console.log("Start of function");

        const id = req.params.id;

        // Input validation
        if (!id) {
            console.log("Validation failed: id is missing");
            return res.status(400).json({
                success: false,
                message: "ID is required",
            });
        }

        const sqlQuery = `DELETE FROM sg_customer_address WHERE id = ?`;

        console.log("Executing query...");
        const result = await db.query(sqlQuery, [id]); // Assuming `db.query` supports promises

        if (result.affectedRows === 0) {
            console.log("No cart item found with the given ID:", id);
            return res.status(404).json({
                success: false,
                message: "No cart item found with the given ID",
            });
        }

        console.log("Query successful, rows affected:", result.affectedRows);

        res.status(200).json({
            success: true,
            message: "Cart item deleted successfully",
            affectedRows: result.affectedRows,
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

module.exports = {addAddress,deleteAddress};