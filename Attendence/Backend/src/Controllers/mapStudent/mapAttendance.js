const { get_database, post_database } = require("../../config/db_utils");

exports.get_role_student = async (req, res)=>{
    const role = req.query.role
    try{
        const query = `
             SELECT s.id, s.name, s.register_number
FROM role_student_map rs
INNER JOIN students s
ON rs.student = s.id
WHERE rs.role = ?
AND rs.status = '1'
ORDER BY s.name
;
        `
        const get_stu = await get_database(query, [role])
        res.json(get_stu)
    }
    catch(err){
        console.error("Error Fetching Role Students",err)
        res.status(500).json("Error Fetching Role Students")
    }
}

exports.post_attendance = async (req, res) => {
    const { role, student, session } = req.body;
    try {
        const query = `
            SELECT id FROM role_student_map 
            WHERE role = ? 
            AND student = ? 
            AND status = '1';
        `;
        const fetchId = await get_database(query, [role, student]);
        console.log(fetchId)
        if (fetchId.length > 0) {
            const studentMapId = fetchId[0].id;
            
            const insertQuery = `
                INSERT INTO roles_student (student_map, session, attendance)
                VALUES (?, ?, CURRENT_TIMESTAMP);
            `;
            const insertAtt = await post_database(insertQuery, [studentMapId, session]);

            res.json({ success: true, data: insertAtt });
        } else {
            res.status(404).json({ error: "Student and role mapping not found." });
        }
    } catch (err) {
        console.error("Error processing attendance record:", err);
        res.status(500).json({ error: "Error processing attendance record." });
    }
};


exports.delete_role_stu_att = async(req, res)=>{
    // const { student_map, slot} = req.body;
    // if(!faculty || !student || !slot ){
    //   return res.status(400).json({error:"Student id, slot is required.."})
  
    // }
    // try{
    //   const query = `
    //  UPDATE role_student
    //  SET status = '0'
    //  WHERE student_map = ?
    //  AND slot =?
    //   `
    //   const role_attendence = await post_database(query,[student_map,slot])
    //   res.json(role_attendence)
    // }
    // catch(err){
    //   console.error("Error Inserting role attendence",err)
    //   res.status(500).json("Error Inserting role attendence")
  
    // }
  }