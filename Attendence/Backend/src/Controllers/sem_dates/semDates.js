const {get_database,post_database} = require('../../config/db_utils')

exports.get_sem_dates = async(req, res)=>{
    try{
        const query = `
        SELECT year, from_date, to_date
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
