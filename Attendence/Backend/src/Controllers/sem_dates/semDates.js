const {get_database,post_database} = require('../../config/db_utils')

exports.get_sem_dates = async(req, res)=>{
    try{
        const query = `
        SELECT id, year, from_date, to_date
        FROM sem_date
        WHERE status = '1';
        `
        const sem_dates = await get_database(query)
        res.json(sem_dates)
    }
    catch(err){
        console.error("Error fetching Sem dates", err);
      res.status(500).json({ error: "Error fetching Sem dates" });
    }
}

const convertDateToMySQLFormat = (dateStr) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
};

exports.post_sem_dates = async (req, res) => {
    try {
        const { from_date, to_date, year } = req.body;

        const formattedFromDate = convertDateToMySQLFormat(from_date);
        const formattedToDate = convertDateToMySQLFormat(to_date);

        const query = `
            INSERT INTO sem_date (year, from_date, to_date)
            VALUES (?, ?, ?);
        `;

        await post_database(query, [year, formattedFromDate, formattedToDate]);

        res.status(200).json({ message: "Semester dates saved successfully" });
    } catch (error) {
        console.error("Error Inserting Sem dates:", error);
        res.status(500).json({ error: "Error saving semester dates" });
    }
};

exports.update_dates = async(req, res)=>{
    const {id, from_date, to_date} = req.body
    if(!id || !from_date || !to_date){
        res.status(400).json({error: "Id and dates are required.."})
    }
    try{
        const query = `
        UPDATE sem_date
        SET from_date = ?,
        to_date = ?
        WHERE id = ? AND 
        status = '1'
        `
        const updateDate = await post_database(query, [from_date,to_date, id])
        res.json(updateDate)
    }
    catch(err){
        console.error("Error Updating Sem dates:", err);
        res.status(500).json({ error: "Error Updating semester dates" });
    }

}
exports.delete_dates = async(req, res)=>{
    const {id }= req.body
    if(!id ){
        res.status(400).json({error: "Id required.."})
    }
    try{
        const query = `
        UPDATE sem_date
        SET status = '0'
        WHERE id = ? AND 
        status = '1'
        `
        const updateDate = await post_database(query, [id])
        res.json(updateDate)
    }
    catch(err){
        console.error("Error Updating Sem dates:", err);
        res.status(500).json({ error: "Error Updating semester dates" });
    }

}