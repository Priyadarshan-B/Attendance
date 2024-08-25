const { get_database, post_database } = require("../../config/db_utils");

exports.get_leave_type = async(req, res)=>{
try{
const query = `
SELECT * FROM leave_type
WHERE status = '1';
`
const leave = await get_database(query)
res.json(leave)
}
catch(err){
    console.error("Error Fetching Leave type", err)
    res.status(500).json({error: "Error Fetching Leave type"})

}

}
exports.get_student_leave = async(req, res)=>{
    const student = req.query.student;
    try{
        const query = `
            SELECT leave_type.type, 
       \`leave\`.from_date, 
       \`leave\`.from_time, 
       \`leave\`.to_date, 
       \`leave\`.to_time, 
       \`leave\`.reason, 
       \`leave\`.status
FROM \`leave\`
INNER JOIN leave_type ON \`leave\`.\`leave\` = leave_type.id
WHERE \`leave\`.student = ?
  AND \`leave\`.\`status\` IN('1', '2', '3')
  ORDER BY from_date DESC
  ;
        `
        const get_leave = await get_database(query, [student])
        res.json(get_leave)

    }
    catch{
        console.error("Error Fetching Leave ")
    res.status(500).json({error: "Error Fetching Leave "})
    }
}

