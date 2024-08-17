const { get_database, post_database } = require("../../config/db_utils");

exports.get_type1 = async(req, res)=>{
    try{
        const query = `
        SELECT * FROM students
        WHERE type = 1
        AND status = '1';
        `
        const getType1 = await get_database(query)
        res.json(getType1)
    }
    catch(err){
        console.error("Error Fetching Student type1", err);
    res.status(500).json({ error: "Error Fetching Student type1" });
    }
}


exports.get_type2 = async(req, res)=>{
    try{
        const query = `
        SELECT * FROM students
        WHERE type = 2
        AND status = '1';
        `
        const getType2 = await get_database(query)
        res.json(getType2)
    }
    catch(err){
        console.error("Error Fetching Student type2", err);
    res.status(500).json({ error: "Error Fetching Student type2" }); 
    }
}

exports.post_changeStu_type2 = async (req, res) => {
    const ids = req.body; 
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Student ids are required" });
    }
    try {
        const query = `
        UPDATE students
        SET type = 2
        WHERE id IN (?) AND status = '1';
        `;
        const changeType = await post_database(query, [ids]);
        res.json(changeType);
    } catch (err) {
        console.error("Error Updating Student type2", err);
        res.status(500).json({ error: "Error Updating Student type2" });
    }
};

exports.post_changeStu_type1 = async (req, res)=>{
    const ids = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Student ids are required" });
    }
      try{
        const query = `
        UPDATE students
        SET type = 1
        WHERE id = (?)
        AND status = '1';
        `
        const changeType = await post_database(query, [ids])
        res.json(changeType)
      }
      catch(err){
        console.error("Error Updating Student type1", err);
    res.status(500).json({ error: "Error Updating Student type1" });
      }
}
