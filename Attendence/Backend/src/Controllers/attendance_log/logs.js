const { get_database } = require("../../config/db_utils");

exports.get_att_logs = async(req, res)=>{
const faculty = req.query.faculty
if(!faculty){
    return res.status(400).json({error:"Faculty id is required.."})
}
try{
    const query = `
    SELECT s.name,s.register_number, ts.label, re.att_session FROM re_appear re
JOIN students s
ON re.student = s.id
JOIN time_slots ts
ON re.slot = ts.id
WHERE DATE(re.att_session) = '2024-09-06'
AND re.faculty = ?
AND re.status = '1'
    `
    const get_logs = await get_database(query, [faculty])
    res.json(get_logs)
}
catch(err){
    console.error("Error Fetching Attendance Logs attendence",err)
     res.status(500).json({error:"Error fetching logs."})

}
}