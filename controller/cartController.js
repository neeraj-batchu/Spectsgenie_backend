const db = require("../config/db");

//Get Cart items by ID
const getCartItemsById = async (req,res) => {
    try {
        const customerId = req.params.id;
        const data = await db.query("SELECT * FROM sg_cart WHERE customer_id = ?",[customerId] );
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

//Add Product to cart
const addCartItem = async (req, res) => {
    try {
        const {
            product_id,
            lens_package_id,
            price,
            customer_id,
            lens_type_id
        } = req.body;

        // Input validation (optional but recommended)
        if (!product_id || !lens_package_id || !price || !customer_id || !lens_type_id) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing: product_id, lens_package_id, price, customer_id, lens_type_id",
            });
        }

        // SQL query
        const query = `
            INSERT INTO sg_cart (
                product_id, lens_package_id, price, customer_id, lens_type_id
            ) VALUES (?, ?, ?, ?, ?)
        `;

        // Values to insert
        const values = [
            product_id,
            lens_package_id,
            price,
            customer_id,
            lens_type_id
        ];

        // Execute query
        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error inserting cart data:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to insert cart data",
                    error: err.message,
                });
            }

            // Successful insertion
            res.status(201).json({
                success: true,
                message: "Cart item added successfully",
                cartItemId: result.insertId, // Return the new cart item's ID
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



module.exports = {addCartItem , getCartItemsById};