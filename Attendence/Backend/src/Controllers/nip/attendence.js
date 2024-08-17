const { get_database, post_database } = require("../../config/db_utils");

exports.get_att_slots = async(req, res) =>{
    const student = req.query.student
    if(!student){
        res.status(400).json({error:"Student id is reqiured.."})
    }
    try{
        const query = `
        SELECT mentor.name, time_slots.label, att_session
        FROM re_appear
        INNER JOIN mentor
        ON re_appear.faculty = mentor.id
        INNER JOIN time_slots
        ON re_appear.slot = time_slots.id
        WHERE student = ?
         AND time_slots.status = '1'
        AND re_appear.status = '1';
        `
        const get_att = await get_database(query, [student])
        res.json(get_att)
    }
    catch(err){
        console.error("Error Fetching Student Attendence nip", err);
        res.status(500).json({ error: "Error Fetching Student Attendence nip" });
    }
}