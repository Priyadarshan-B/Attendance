const { get_database } = require("../../config/db_utils");

exports.get_att_progress = async(req, res)=>{
    const {student, date, year} = req.query
    if(!student || !date || !year){
        return res.status(400).json({error:"Student id, date and year are required.."
        })
    }
    try{
        const query = `
         SELECT 
    t.id AS slot_id, 
    t.label AS slot_time, 
    GROUP_CONCAT(m.name SEPARATOR ', ') AS faculty,
    CASE 
        WHEN COUNT(r.id) > 0 THEN 1 
        ELSE 0 
    END AS is_present
FROM time_slots t
LEFT JOIN re_appear r ON r.slot = t.id 
AND r.student = ?
 AND DATE(r.att_session) = ? 
 AND r.status = '1'
LEFT JOIN mentor m ON r.faculty = m.id
WHERE t.year = ?
GROUP BY t.id, t.label
ORDER BY t.id;
        `
        const attProgress = await get_database(query, [student, date, year])
    res.json(attProgress)
}catch(err){
    console.error("Error Fetching AttProgress", err);
        res.status(500).json({ error: "Error Fetching AttProgress" }); 
}
    }
    