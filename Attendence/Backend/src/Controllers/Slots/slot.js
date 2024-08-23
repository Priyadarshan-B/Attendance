const { get_database, post_database } = require("../../config/db_utils");

exports.get_slots = async (req, res) => {
    try {
        const updateQuery = `
            SELECT * FROM time_slots  WHERE
                 CURRENT_TIME >= start_time AND CURRENT_TIME <= end_time OR
                                 CURRENT_TIME > end_time
        `;
        const slots = await get_database(updateQuery);

        res.json(slots);
    } catch (err) {
        console.error("Error Fetching Slots", err);
        res.status(500).json({ error: "Error fetching Slots" });
    }
};


exports.update_slots = async(req, res)=>{
    const {id, label, start_time, end_time} = req.body
    if(!id || !label || !start_time || !end_time){
        return res.status(400).json({Error: "Feilds are required.."})
    }
    try{
        const query =`
        UPDATE time_slots
        SET label = ?,start_time = ?, end_time = ? 
        WHERE id = ?;
        `
        const updateSlots = await post_database(query, [label, start_time, end_time, id])
        res.json(updateSlots);
    }
    catch(err){
        console.error("Error Updating Slots", err);
    res.status(500).json({ error: "Error Updating Slots.." });
    }
}

exports.post_slots = async(req, res) =>{
    const {label,start_time, end_time} = req.body
    if( !label || !start_time || !end_time){
        return res.status(400).json({Error: "Feilds are required.."})
    }
    try{
        const query = `
        INSERT INTO time_slots (label, start_time,end_time)
        VALUES (?,?,?);
        `
        const postSlots = await post_database(query,[label, start_time, end_time])
        res.json(postSlots)
    }
    catch(err){
        console.error("Error Updating Slots", err);
    res.status(500).json({ error: "Error Updating Slots.." });
    }
}