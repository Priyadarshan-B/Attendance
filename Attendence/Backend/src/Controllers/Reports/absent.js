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
        const total_absent_students = get_report_ab.length; 
    res.json({ total_absent_students, students: get_report_ab });
        // res.json(get_report_ab);
    } catch(err) {
        console.error("Error Fetching Ab Report List", err);
        res.status(500).json({ error: "Error fetching Ab Report List" }); 
    }
};


exports.get_absent_slot = async (req, res) => {
    const { year, slot, date } = req.query;
    
    if (!year || !slot || !date) {
      return res.status(400).json({ error: "Fields are required." });
    }
  
    try {
      let detailsQuery, countQuery;
      let detailsParams, countParams;  

      if (slot === "All") {
        detailsQuery = `
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
LEFT JOIN mentor_student ms
    ON s.id = ms.student 
    AND ms.status = '1'
LEFT JOIN mentor m
    ON ms.mentor = m.id
LEFT JOIN time_slots ts
    ON s.year = ts.year
LEFT JOIN re_appear ra
    ON s.id = ra.student
    AND DATE(ra.att_session) = ?
    AND ts.id = ra.slot
WHERE ra.id IS NULL
    AND s.type = '2'
    AND s.year = ?
    AND ts.status = '1';
        `;
        
        countQuery = `
          SELECT COUNT(DISTINCT s.id) AS count
FROM students s
LEFT JOIN time_slots ts
    ON s.year = ts.year
LEFT JOIN re_appear ra
    ON s.id = ra.student
    AND DATE(ra.att_session) = ?
    AND ts.id = ra.slot
WHERE ra.id IS NULL
    AND s.type = '2'
    AND s.year = ?
    AND ts.status = '1';
        `;
        
        detailsParams = [date, date, year];
        countParams = [date, year]
  
      } 
      else if(slot ==='AllSlots'){
        detailsQuery=`
        SELECT 
    s.id AS student_id,
    s.name AS student_name,
    s.register_number,
    s.gmail AS mail,
    m.name AS mentor_name,
    GROUP_CONCAT(ts.label SEPARATOR ', ') AS slot
FROM 
    students s
CROSS JOIN time_slots ts
LEFT JOIN re_appear r
    ON s.id = r.student 
    AND r.slot = ts.id
    AND DATE(r.att_session) = ?
LEFT JOIN mentor_student ms
    ON s.id = ms.student 
    AND ms.status = '1'
LEFT JOIN mentor m
    ON ms.mentor = m.id
WHERE s.year = ?
AND s.type = '2'
AND ts.status = '1'
AND ts.year = s.year 
AND r.id IS NULL 
GROUP BY 
    s.id, s.name, s.register_number, s.gmail, m.name;

        `
        countQuery=`
        SELECT 
    COUNT(DISTINCT s.id) AS count
FROM 
    students s
CROSS JOIN time_slots ts
ON ts.year = ?
LEFT JOIN re_appear r
    ON s.id = r.student 
    AND r.slot = ts.id
    AND DATE(r.att_session) = ?
LEFT JOIN mentor_student ms
    ON s.id = ms.student 
    AND ms.status = '1'
WHERE s.year = ?
AND s.type = '2'
AND r.id IS NULL;
        `
        detailsParams = [ date, year]
        countParams = [year ,date, year]

      }
      else {
        detailsQuery = `
          SELECT DISTINCT 
    s.id AS student_id,
    s.name AS student_name,
    s.register_number,
    s.gmail AS mail,
    m.name AS mentor_name,
    ts.label AS slot
FROM students s
LEFT JOIN mentor_student ms
    ON s.id = ms.student 
    AND ms.status = '1'
LEFT JOIN mentor m
    ON ms.mentor = m.id
LEFT JOIN time_slots ts
    ON ts.id = ?
LEFT JOIN re_appear r
    ON s.id = r.student 
    AND DATE(r.att_session) = ?
    AND r.slot = ts.id 
WHERE r.id IS NULL
  AND s.type = '2'
  AND s.year = ?
  AND ts.year = ?;
        `;
        
        countQuery = `
          SELECT COUNT(DISTINCT s.id) AS count
FROM students s
LEFT JOIN mentor_student ms
    ON s.id = ms.student 
    AND ms.status = '1'
LEFT JOIN mentor m
    ON ms.mentor = m.id
LEFT JOIN time_slots ts
    ON ts.id = ?
LEFT JOIN re_appear r
    ON s.id = r.student 
    AND DATE(r.att_session) = ?
    AND r.slot = ts.id  
WHERE r.id IS NULL
  AND s.type = '2'
  AND s.year = ?
  AND ts.year = ?;
        `;
        
        detailsParams = [slot, date, year, year];
        countParams = [slot, date, year, year];
      }
  
      const [studentDetails, [countResult]] = await Promise.all([
        get_database(detailsQuery, detailsParams),
        get_database(countQuery, countParams)
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
  