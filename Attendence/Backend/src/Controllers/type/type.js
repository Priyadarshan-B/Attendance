const { get_database } = require("../../config/db_utils");

exports.get_stu_type = async(req, res)=>{
    try{
        const query =  `
        SELECT * FROM type
        `
        const get_type = await get_database(query)
        res.json(get_type)
    }catch (err) {
        console.error("Error fetching type", err);
        res.status(500).json({ error: "Error fetching type" });
      }
}