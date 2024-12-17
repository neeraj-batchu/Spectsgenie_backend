const db = require("../config/db");

//Get all Products
const getAllProducts = async (req,res) => {
    try {
        const data = await db.query("SELECT * FROM sg_product");
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

//Get Product by ID
const getProductById = async (req,res) => {
    try {
        const productId = req.params.id;
        const data = await db.query("SELECT * FROM sg_product WHERE pr_id = ?",[productId] );
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
const addProduct = async (req,res) => {
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

module.exports = {getAllProducts , getProductById, addProduct};