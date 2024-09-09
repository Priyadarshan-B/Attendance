const { get_database } = require("../../config/db_utils");

exports.get_absent_reports = async(req, res) => {
    const {year, date} = req.query;
    if(!year || !year){
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
                    AND a.date = ?
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


exports.get_absent_slot = async (req, res) => {
    const { year, slot, date } = req.query;
    if (!year || !slot || !date) {
        return res.status(400).json({ error: "Fields are required.." });
    }

    try {
        const detailsQuery = `
            SELECT DISTINCT 
                s.id AS student_id,
                s.name AS student_name,
                s.register_number,
                s.gmail AS mail,
                m.name AS mentor_name
            FROM students s
            LEFT JOIN re_appear r
                ON s.id = r.student 
                AND DATE(r.att_session) = ?
                AND r.slot = ?
            LEFT JOIN mentor_student ms
                ON s.id = ms.student 
                AND ms.status = '1'
            LEFT JOIN mentor m
                ON ms.mentor = m.id
            WHERE r.id IS NULL 
            AND s.type = '2'
            AND s.year = ?;
        `;
        
        const countQuery = `
            SELECT COUNT(*) AS count
            FROM students s
            LEFT JOIN re_appear r
                ON s.id = r.student 
                AND DATE(r.att_session) = ?
                AND r.slot = ?
            LEFT JOIN mentor_student ms
                ON s.id = ms.student 
                AND ms.status = '1'
            LEFT JOIN mentor m
                ON ms.mentor = m.id
            WHERE r.id IS NULL
            AND s.type = '2'
            AND s.year = ?;
        `;

        const [studentDetails, [countResult]] = await Promise.all([
            get_database(detailsQuery, [date, slot, year]),
            get_database(countQuery, [date, slot, year])
        ]);

        const totalAbsentStudents = countResult.count;

        res.json({
            total_absent_students: totalAbsentStudents,
            students: studentDetails
        });
    } catch (err) {
        console.error("Error Fetching Absent Slot Report List", err);
        res.status(500).json({ error: "Error fetching Absent Slot Report List" });
    }
};
