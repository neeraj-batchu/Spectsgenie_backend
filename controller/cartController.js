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
        const { product_id, lens_package_id, price, customer_id, lens_type_id, ca_id } = req.body;

        // Input validation
        if (!product_id || !lens_package_id || !price || !customer_id || !lens_type_id || !ca_id) {
            console.log("Validation failed:", req.body);
            return res.status(400).json({
                success: false,
                message: "Required fields are missing: product_id, lens_package_id, price, customer_id, lens_type_id",
            });
        }
        const sqlQuery = `
            INSERT INTO sg_cart (
                product_id, lens_package_id, price, customer_id, lens_type_id, ca_id
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [product_id, lens_package_id, price, customer_id, lens_type_id, ca_id];

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
        const { product_id, quantity, price, customer_id, ca_id } = req.body;

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
                product_id, quantity, price, customer_id, ca_id
            ) VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                quantity = quantity + VALUES(quantity)
        `;

        const values = [product_id, quantity, price, customer_id, ca_id];

        console.log("Executing query...");
        const result = await db.query(sqlQuery, values);

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

const getLocalCartData = async (req, res) => {
    try {
      const payload = req.body; // Array of objects from the request body
  
      if (!Array.isArray(payload) || payload.length === 0) {
        return res.status(400).send({
          success: false,
          message: "Invalid or empty payload",
        });
      }
  
      // Array to hold all results
      const queryResults = [];
  
      for (const item of payload) {
        const { product_id, ca_id } = item;
  
        if (!product_id || !ca_id || isNaN(product_id) || isNaN(ca_id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid product_id or ca_id in payload",
          });
        }
  
        let queryResult;
        if (Number(ca_id) === 3) {
          // Query for categoryId 3
          queryResult = await db.query(
            `SELECT * FROM cart_temp_lens WHERE product_id = ?`,
            [product_id]
          );
        } else {
          // Query for other categories
          queryResult = await db.query(
            `SELECT * FROM cart_temp_products WHERE product_id = ?`,
            [product_id]
          );
        }
  
        // Flatten and push the results into the same array
        if (queryResult && Array.isArray(queryResult)) {
          queryResults.push(...queryResult[0]);
        }
      }
  
      if (queryResults.length === 0) {
        return res.status(404).send({
          success: false,
          message: "No records found",
          data: [],
          totalRecords: 0,
        });
      }
  
      return res.status(200).send({
        success: true,
        message: "Records fetched",
        data: queryResults, // Flat structure for all records
        totalRecords: queryResults.length,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  const addMultipleCartItems = async (req, res) => {
    try {
        const cartItems = req.body;

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid payload format or empty array." });
        }

        const sqlQuery = `INSERT INTO sg_cart (product_id, lens_package_id, price, customer_id, lens_type_id, ca_id, quantity) VALUES ?`;

        const values = cartItems.map(item => [
            item.product_id,
            item.lens_package_id || null,
            item.price || null,
            item.customer_id,
            item.lens_type_id || null,
            item.ca_id,
            item.quantity || 1
        ]);

        const [result] = await db.query(sqlQuery, [values]);

        res.status(201).json({
            success: true,
            message: `${result.affectedRows} cart items added successfully.`
        });
    } catch (error) {
        console.error("Error inserting cart items:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while inserting cart items.",
            error: error.message
        });
    }
};

module.exports = {addCartItem , getCartItemsById, deleteProductFromCart, addContactLensToCart, getLocalCartData, addMultipleCartItems};