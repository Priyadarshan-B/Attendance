const { get_database, post_database } = require("../../config/db_utils");

exports.get_session = async (req, res) =>{
try{
    const query = `
    SELECT id , session AS Attendance FROM session  WHERE status = '1';
    `
    const session = await get_database(query)
    res.json(session)
}
catch(err){
    console.error("Error Fetching Session", err);
        res.status(500).json({ error: "Error fetching Session" });        
}

}