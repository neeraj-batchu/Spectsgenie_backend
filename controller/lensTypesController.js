const db = require("../config/db");

//Get Lens types based on product id
const getLensTypes = async (req,res) => {
    try {
        const productId = req.params.id;
        const data = await db.query("SELECT * FROM sg_lens_type lt WHERE FIND_IN_SET(lt.id, (SELECT lens_type_ids FROM sg_product sp WHERE pr_id = ?)) > 0", [productId]);
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

const getLensPackages= async (req,res) => {
    try {
        const productId = req.params.id;
        const data = await db.query("select * from sg_lens_package slp where FIND_IN_SET(slp.id, (SELECT lens_type_ids FROM sg_product sp WHERE pr_id = ?)) > 0", [productId]);
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



module.exports = {getLensTypes , getLensPackages};