const { get_database, post_database } = require("../../config/db_utils");

exports.get_slots = async (req, res) => {
    const { year } = req.query; 
    try {
        const query = `
            SELECT * FROM time_slots 
            WHERE year = ? 
            AND (
                (CURRENT_TIME >= start_time AND CURRENT_TIME <= end_time) OR
                (CURRENT_TIME > end_time)
            )
            AND status = '1'
        `;
        const slots = await get_database(query, [year]);

        res.json(slots);
    } catch (err) {
        console.error("Error Fetching Slots", err);
        res.status(500).json({ error: "Error fetching Slots" });
    }
};

exports.get_slotsYear = async (req, res) => {
    const  year  = req.query.year; 
    try {
        const query = `
            SELECT * FROM time_slots 
            WHERE year = ? 
            AND status = '1'
        `;
        const slotsYear = await get_database(query, [year]);

        res.json(slotsYear);
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
exports.delete_slots = async(req, res)=>{
    const id = req.query.id
    if(!id){
        return res.status(400).json({Error: "Feilds are required.."})
    }
    try{
        const query =`
        UPDATE time_slots
        SET status = '0'
        WHERE id = ?;
        `
        const deleteSlots = await post_database(query, [id])
        res.json(deleteSlots);
    }
    catch(err){
        console.error("Error Deleting Slots", err);
    res.status(500).json({ error: "Error Deleting Slots.." });
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

exports.get_time_slots = async(req, res) =>{
    try{
        const query = `
        SELECT * FROM time_slots WHERE status = '1';
        `
        const get_time = await get_database(query)
        res.json(get_time)
    }
    catch(err){
        console.error("Error Fetching timeSlots", err);
        res.status(500).json({ error: "Error Fetching time Slots.." });
    }
}