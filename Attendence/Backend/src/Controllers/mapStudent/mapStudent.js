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

exports.post_map_role = async (req, res) => {
    const { roleId, studentIds } = req.body;

    if (!roleId || !studentIds || studentIds.length === 0) {
        return res.status(400).json({ error: "Role ID and student IDs are required" });
    }

    try {
        const query = `
            INSERT INTO role_student_map(role, student) 
            VALUES (?, ?);
        `;

        for (const studentId of studentIds) {
            await post_database(query, [roleId, studentId]);
        }

        res.status(200).json({ message: "Role mapping successful" });
    } catch (err) {
        console.error("Error inserting role map details:", err);
        res.status(500).json({ error: "Error inserting role map details" });
    }
};
