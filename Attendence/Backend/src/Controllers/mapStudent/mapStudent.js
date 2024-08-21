const { get_database, post_database } = require("../../config/db_utils");

exports.get_map_role = async (req, res)=>{
    try{
        const query = `
        SELECT * FROM roles 
        WHERE status = '2'
        ;
        `
        const mapRole = await get_database(query)
        res.json(mapRole)
    }
    catch(err){
        console.error("Error fetching Role Map Details", err);
        res.status(500).json({ error: "Error fetching Role Map Details" });
    }
}

exports.get_role_student_map = async (req, res)=>{
    try{
        const query = `
        SELECT rsm.id, roles.name AS role, students.id AS studentId, students.name,students.register_number
        FROM role_student_map rsm
        JOIN roles ON rsm.role = roles.id
        JOIN students ON rsm.student = students.id
        WHERE rsm.status = '1';
        `
        const getMap = await get_database(query)
        res.json(getMap)
    }
    catch(err){
        console.error("Error fetching Role Student Map Details", err);
        res.status(500).json({ error: "Error fetching  Role Student Map Details" });
    }
}

exports.post_map_role = async (req, res) => {
    const { roleId, studentIds } = req.body;

    if (!roleId || !studentIds || studentIds.length === 0) {
        return res.status(400).json({ error: "Role ID and student IDs are required" });
    }

    try {
        const checkQuery = `
            SELECT COUNT(*) as count 
            FROM role_student_map 
            WHERE role = ? AND student = ? AND status = 1;
        `;

        const insertQuery = `
            INSERT INTO role_student_map(role, student) 
            VALUES (?, ?);
        `;

        for (const studentId of studentIds) {
            const [result] = await post_database(checkQuery, [roleId, studentId]);
            if (result.count === 0) { 
                await post_database(insertQuery, [roleId, studentId]);
            }
        }

        res.status(200).json({ message: "Role mapping successful" });
    } catch (err) {
        console.error("Error inserting role map details:", err);
        res.status(500).json({ error: "Error inserting role map details" });
    }
};

exports.update_role_student_map = async (req, res)=>{
    const id = req.query.id
 const {role, student} = req.body
 if(!id || !role || !student){
    res.status(400).json({error:"Role and student id are required.."})
 }
 try{
    const query =  `
    UPDATE role_student_map
    SET role =?,
    student =?
    WHERE id =?
    AND status = '1';
    `
 const updateMap = await post_database(query,[role, student, id] )
 res.json(updateMap)

 }
 catch(err){
    console.error("Error Updating role map details:", err);
    res.status(500).json({ error: "Error Updating role map details" });
 }

}

exports.delete_Role_student_map = async(req, res)=>{
    const id = req.query.id
    if(!id){
        res.status(400).json({error:"Id is required.."})
    }
    try{
        const query  =`
        UPDATE role_student_map
        SET status = '0'
        WHERE id =?
        ` 
        const deleteMap = await post_database(query, [id])
        res.json(deleteMap)
    }
    catch(err){
        console.error("Error Deleting role map details:", err);
        res.status(500).json({ error: "Error Deleting role map details" })
    }
}