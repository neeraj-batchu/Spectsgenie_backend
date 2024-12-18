const db = require("../config/db");

// Get all Products
const getAllProducts = async (req, res) => {
    try {
        const data = await db.query("SELECT * FROM getAllProduct");
        if (!data) {
            res.status(404).send({
                success: false,
                message: "No records found"
            })
        } else {
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

// Get Product by ID
const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const data = await db.query("SELECT * FROM sg_product WHERE pr_id = ?", [productId]);
        if (!data) {
            res.status(404).send({
                success: false,
                message: "No records found"
            })
        } else {
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

// Add Product
const addProduct = async (req, res) => {
    try {
        const {
            br_id,
            bd_id,
            ca_id,
            sg_gender_ids,
            parent_product_id,
            pr_name,
            slug,
            pr_sku,
            pr_qty,
            pr_description,
            pr_dprice,
            pr_sprice,
            pr_price,
            pr_image,
            selected_image_to_show,
            psd_files,
            platform,
            pr_a_size,
            pr_b_size,
            pr_d_size,
            lens_type_ids,
            pr_status,
            pr_created_by,
        } = req.body;

        const query = `
            INSERT INTO sg_product (
                br_id, bd_id, ca_id, sg_gender_ids, parent_product_id, pr_name, slug, 
                pr_sku, pr_qty, pr_description, pr_dprice, pr_sprice, pr_price, 
                pr_image, selected_image_to_show, psd_files, platform, pr_a_size, 
                pr_b_size, pr_d_size, lens_type_ids, pr_status, pr_created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            br_id,
            bd_id,
            ca_id,
            sg_gender_ids,
            parent_product_id,
            pr_name,
            slug,
            pr_sku,
            pr_qty,
            pr_description,
            pr_dprice,
            pr_sprice,
            pr_price,
            pr_image,
            selected_image_to_show,
            psd_files,
            platform,
            pr_a_size,
            pr_b_size,
            pr_d_size,
            lens_type_ids,
            pr_status || "1", // Default status to '1' if not provided
            pr_created_by,
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error inserting data: ", err);
                res.status(500).json({ error: "Failed to insert data" });
            } else {
                res.status(201).json({ message: "Product added successfully", id: result.insertId });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error in getAllProducts",
            error
        })
    }
}

// Get Products by Dynamic Query (new method)
const getProductsByDynamicQuery = async (req, res) => {
    const { table, filters, limit, offset } = req.body;

    console.log("test")

    // Validate the request body
    if (!table || !filters || !Array.isArray(filters)) {
        return res.status(400).json({ error: 'Invalid request. Table and filters are required.' });
    }

    // Start building the query
    let query = `SELECT * FROM ??`;
    let queryParams = [table];

    // Handle filters dynamically
    if (filters.length === 0) {
        const whereClauses = filters.map((filter) => `?? = ?`).join(' AND ');
        query += ` WHERE ${whereClauses}`;
        filters.forEach((filter) => {
            queryParams.push(filter.key);
            queryParams.push(filter.value);
        });
    }

    // Handle pagination (limit and offset)
    if (limit) {
        query += ` LIMIT ?`;
        queryParams.push(limit);
    }

    if (offset) {
        query += ` OFFSET ?`;
        queryParams.push(offset);
    }

    // Execute query
    try {
        console.log(queryParams)
        const [results] = await db.query(query, queryParams);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No records found' });
        }

        res.status(200).json({
            success: true,
            message: 'Records fetched',
            data: results,
            totalRecords: results.length,
        });

    } catch (error) {
        console.error("Error executing dynamic query: ", error);
        res.status(500).json({ error: 'Error executing query' });
    }
}

module.exports = { getAllProducts, getProductById, addProduct, getProductsByDynamicQuery };
