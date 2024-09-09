const { get_database } = require("../../config/db_utils");

exports.get_present_reports = async (req, res) => {
  const { year, date } = req.query;
  if (!year || !date) {
    return res.status(400).json({ error: "Year is required.." });
  }

  try {
    let query;
    let params = [date];

    if (year === "All") {
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
    } else if (
      year === "I" ||
      year === "II" ||
      year === "III" ||
      year === "IV"
    ) {
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
      return res.status(400).json({ error: "Invalid year specified." });
    }

    const get_report_pre = await get_database(query, params);
    res.json(get_report_pre);
  } catch (err) {
    console.error("Error Fetching Pre Report List", err);
    res.status(500).json({ error: "Error fetching Pre Report List" });
  }
};
exports.get_present_slot = async (req, res) => {
  const { year, slot, date } = req.query;
  if (!year || !slot || !date) {
    return res.status(400).json({ error: "Fields are required.." });
  }

  try {
    let detailsQuery, countQuery, queryParams;

    if (slot === "All") {
      detailsQuery = `
               SELECT DISTINCT 
                   s.id AS student_id,
                   s.name AS student_name,
                   s.register_number,
                   s.gmail AS mail,
                   m.name AS mentor_name
               FROM students s
               LEFT JOIN (
                   SELECT r.student
                   FROM re_appear r
                   JOIN time_slots ts ON ts.id = r.slot 
                   WHERE DATE(r.att_session) = ? 
                   AND ts.year = ?
                   AND ts.status = '1'
                   GROUP BY r.student
                   HAVING COUNT(DISTINCT r.slot) = (
                       SELECT COUNT(DISTINCT id) 
                       FROM time_slots 
                       WHERE year = ? 
                       AND status = '1'
                   )
               ) AS present_students ON s.id = present_students.student
               LEFT JOIN mentor_student ms
                   ON s.id = ms.student 
                   AND ms.status = '1'
               LEFT JOIN mentor m
                   ON ms.mentor = m.id
               WHERE present_students.student IS NOT NULL 
                           AND s.type = '2'
               AND s.year = ?
            `;

      countQuery = `
               SELECT COUNT(DISTINCT s.id) AS count
               FROM students s
               LEFT JOIN (
                   SELECT r.student
                   FROM re_appear r
                   JOIN time_slots ts ON ts.id = r.slot 
                   WHERE DATE(r.att_session) = ? 
                   AND ts.year = ?
                   AND ts.status = '1'
                   GROUP BY r.student
                   HAVING COUNT(DISTINCT r.slot) = (
                       SELECT COUNT(DISTINCT id) 
                       FROM time_slots 
                       WHERE year = ? 
                       AND status = '1'
                   )
               ) AS present_students ON s.id = present_students.student
               WHERE present_students.student IS NOT NULL 
               AND s.year = ?
            `;

      queryParams = [date, year, year, year];
    } else {
      detailsQuery = `
               SELECT DISTINCT 
    s.id AS student_id,
    s.name AS student_name,
    s.register_number,
    s.gmail AS mail,
    m.name AS mentor_name,  
    mf.name AS attendance_taken 
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
LEFT JOIN mentor mf  
    ON r.faculty = mf.id
WHERE r.id IS NOT NULL 
AND s.type = '2'
AND s.year = ?
            `;

      countQuery = `
               SELECT COUNT(DISTINCT s.id) AS count
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
               WHERE r.id IS NOT NULL 
                AND s.type = '2'
               AND s.year = ?
            `;

      queryParams = [date, slot, year];
    }

    const [studentDetails, [countResult]] = await Promise.all([
      get_database(detailsQuery, queryParams),
      get_database(countQuery, queryParams),
    ]);

    const totalPresentStudents = countResult.count;

    res.json({
      total_present_students: totalPresentStudents,
      students: studentDetails,
    });
  } catch (err) {
    console.error("Error Fetching Present Slot Report List", err);
    res.status(500).json({ error: "Error fetching Present Slot Report List" });
  }
};
