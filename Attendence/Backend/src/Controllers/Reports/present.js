const { get_database } = require("../../config/db_utils");

exports.get_present_reports = async(req, res) => {
    const {year, date} = req.query;
    if(!year || !date){
        return res.status(400).json({error:"Year is required.."});
    }

    try {
        let query;
        let params = [date];

        if(year === 'All'){
            query = `
                SELECT 
                    s.id AS student_id, 
                    s.name,
                    s.register_number, 
                    s.year, 
                    s.department,
                    s.gmail
                FROM 
                    students s
                LEFT JOIN 
                    attendance a 
                    ON s.id = a.student 
                    AND a.date = ?
                WHERE 
                    a.id IS NOT NULL  
                    OR a.forenoon = '1' 
                    OR a.afternoon = '1';
            `;
        } else if (year === 'I' || year === 'II' || year === 'III' || year === 'IV') {
            query = `
                SELECT 
                    s.id AS student_id, 
                    s.name,
                    s.register_number, 
                    s.year, 
                    s.department,
                    s.gmail
                FROM 
                    students s
                LEFT JOIN 
                    attendance a 
                    ON s.id = a.student 
                    AND a.date = ?
                WHERE 
                    (a.id IS NOT NULL  
                    OR a.forenoon = '1' 
                    OR a.afternoon = '1')
                    AND s.year = ?;
            `;
            params.push(year);
        } else {
            return res.status(400).json({error: "Invalid year specified."});
        }

        const get_report_pre = await get_database(query, params);
        res.json(get_report_pre);
    } catch(err) {
        console.error("Error Fetching Pre Report List", err);
        res.status(500).json({ error: "Error fetching Pre Report List" }); 
    }
};
