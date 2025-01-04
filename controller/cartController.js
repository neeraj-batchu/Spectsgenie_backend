const db = require("../config/db");

//Get Cart items by ID
const getCartItemsById = async (req,res) => {
    try {
        const customerId = req.params.id;
        const data = await db.query("SELECT * FROM cart_product_details WHERE customer_id = ?",[customerId] );
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
        console.log("Start of function");
        const { product_id, lens_package_id, price, customer_id, lens_type_id } = req.body;

        // Input validation
        if (!product_id || !lens_package_id || !price || !customer_id || !lens_type_id) {
            console.log("Validation failed:", req.body);
            return res.status(400).json({
                success: false,
                message: "Required fields are missing: product_id, lens_package_id, price, customer_id, lens_type_id",
            });
        }
        const sqlQuery = `
            INSERT INTO sg_cart (
                product_id, lens_package_id, price, customer_id, lens_type_id
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const values = [product_id, lens_package_id, price, customer_id, lens_type_id];

        console.log("Executing query...");
        const result = await db.query(sqlQuery, values); // Directly use db.query without promisify

        console.log("Query successful:", result);

        res.status(201).json({
            success: true,
            message: "Cart item added successfully",
            cartItemId: result.insertId,
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

const deleteProductFromCart = async (req, res) => {
    try {
        console.log("Start of function");

        const cartId = req.params.id;

        // Input validation
        if (!cartId) {
            console.log("Validation failed: cartId is missing");
            return res.status(400).json({
                success: false,
                message: "Cart ID is required",
            });
        }

        const sqlQuery = `DELETE FROM sg_cart WHERE id = ?`;

        console.log("Executing query...");
        const result = await db.query(sqlQuery, [cartId]); // Assuming `db.query` supports promises

        if (result.affectedRows === 0) {
            console.log("No cart item found with the given ID:", cartId);
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


const addContactLensToCart = async (req, res) => {
    try {
        console.log("Start of function");
        const { product_id, quantity, price, customer_id } = req.body;

        // Input validation
        if (!product_id || !price || !customer_id) {
            console.log("Validation failed:", req.body);
            return res.status(400).json({
                success: false,
                message: "Required fields are missing: product_id, price, customer_id",
            });
        }
        const sqlQuery = `
            INSERT INTO sg_cart (
                product_id, quantity, price, customer_id
            ) VALUES (?, ?, ?, ?)
        `;

        const values = [product_id, quantity, price, customer_id];

        console.log("Executing query...");
        const result = await db.query(sqlQuery, values); // Directly use db.query without promisify

        console.log("Query successful:", result);

        res.status(201).json({
            success: true,
            message: "Cart item added successfully",
            cartItemId: result.insertId,
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


module.exports = {addCartItem , getCartItemsById, deleteProductFromCart, addContactLensToCart};