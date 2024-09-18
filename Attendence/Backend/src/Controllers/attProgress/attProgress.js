const { get_database, post_database } = require("../../config/db_utils");

exports.get_att_progress = async(req, res)=>{
    const {student, date, year} = req.query
    if(!student || !date || !year){
        return res.status(400).json({error:"Student id, date and year are required.."
        })
    }
    try{
        const query = `
        SELECT 
    ts.id AS slot_id,
    ts.label AS slot_time,
    COALESCE(
        MAX(CASE WHEN ra.student = s.id AND DATE(ra.att_session) = ? THEN 1 ELSE 0 END), 0
    ) AS is_present
FROM 
    time_slots ts
LEFT JOIN students s ON ts.year = s.year
LEFT JOIN re_appear ra ON ra.slot = ts.id AND ra.student = s.id
WHERE 
    s.id = ?
    AND ts.year = ?
    AND ts.status = '1' 
GROUP BY 
    ts.id, ts.label
ORDER BY 
    ts.id;
        `
        const attProgress = await get_database(query, [date, student, year])
    res.json(attProgress)
}catch(err){
    console.error("Error Fetching AttProgress", err);
        res.status(500).json({ error: "Error Fetching AttProgress" }); 
}
    }
    