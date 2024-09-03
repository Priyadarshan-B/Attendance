const { get_database } = require("../../config/db_utils");

exports.get_absent_reports = async(req, res) => {
    const year = req.query.year;
    if(!year){
        return res.status(400).json({error:"Year is required.."});
    }

    try {
        let query;
        let params = [];

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
                    AND a.date = CURDATE()
                WHERE 
                    a.id IS NULL  
                    OR a.forenoon = '0' 
                    OR a.afternoon = '0';
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
                    AND a.date = CURDATE()
                WHERE 
                    (a.id IS NULL  
                    OR a.forenoon = '0' 
                    OR a.afternoon = '0')
                    AND s.year = ?;
            `;
            params.push(year);
        } else {
            return res.status(400).json({error: "Invalid year specified."});
        }

        const get_report_ab = await get_database(query, params);
        res.json(get_report_ab);
    } catch(err) {
        console.error("Error Fetching Ab Report List", err);
        res.status(500).json({ error: "Error fetching Ab Report List" }); 
    }
};
