const { get_database, post_database } = require("../../config/db_utils");


exports.insertBioExcel = async(req, res)=>{
    try {
        const data = req.body; 
    
        data.forEach(async (row) => {
          const { roll_no, time } = row;
    
          const query = `
            INSERT INTO no_arrear (student, attendence, place, status)
            VALUES (?, ?, NULL, '1')
          `;
    
          await post_database(query, [roll_no, time]);
        });
    
        res.status(200).send("Data inserted successfully");
      } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Error inserting data");
      }
}