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
            SELECT leave_type.type, from_date, from_time, to_date, to_time
            FROM \`leave\`
            INNER JOIN leave_type ON \`leave\`.\`leave\` = leave_type.id
            WHERE student = ?
            AND \`leave\`.\`status\` = '1'; 
        `
        const get_leave = await get_database(query, [student])
        res.json(get_leave)

    }
    catch{
        console.error("Error Fetching Leave ", err)
    res.status(500).json({error: "Error Fetching Leave "})
    }
}

