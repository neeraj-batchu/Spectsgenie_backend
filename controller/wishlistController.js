const db = require("../config/db");

//Get Wishlist items by ID
const getWishlistItemsById = async (req,res) => {
    try {
        const customerId = req.params.id;
        const data = await db.query("SELECT * FROM sg_wishlist WHERE customer_id = ?",[customerId] );
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

//Add Product to Wishlist
const addWishlistItem = async (req, res) => {
    try {
        const { product_id, customer_id, is_active } = req.body;

        // Input validation
        if (!product_id || !customer_id || !is_active) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing: product_id, customer_id, is_active",
            });
        }

        // SQL query
        const query = `
            INSERT INTO sg_wishlist (
                product_id, customer_id, is_active
            ) VALUES (?, ?, ?)
        `;

        // Values to insert
        const values = [product_id, customer_id, is_active];

        // Execute query
        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error inserting wishlist item:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to add wishlist item",
                    error: err.message,
                });
            }

            // Successful insertion
            res.status(201).json({
                success: true,
                message: "Wishlist item added successfully",
                wishlistItemId: result.insertId, // Return the new wishlist item's ID
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


module.exports = {addWishlistItem , getWishlistItemsById};