const { get_database } = require("../../config/db_utils");

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

exports.get_attendance_status = async (req, res) => {
  try {
    const { from_date, to_date, year } = req.body;

    if (!from_date || !to_date || !year) {
      return res.status(400).json({ error: "from_date, to_date, and year are required" });
    }

    let current_date = new Date(from_date);
    const end_date = new Date(to_date);

    const all_results = [];

    while (current_date <= end_date) {
      const formatted_date = formatDate(current_date); 

      const yearCondition = isNaN(year) ? `'${year}'` : year;

      const query = `
        WITH SlotRequirements AS (
            SELECT DISTINCT
                ts.year AS student_year,
                ts.id AS slot_id
            FROM time_slots ts
        ),

        StudentAttendance AS (
            SELECT 
                s.id AS student_id,
                s.name AS student_name,
                s.register_number,
                s.gmail,
                sr.slot_id,
                COALESCE(r.status, '0') AS attendance_status
            FROM students s
            JOIN SlotRequirements sr ON s.year = sr.student_year
            LEFT JOIN re_appear r
                ON s.id = r.student
                AND sr.slot_id = r.slot
                AND DATE(r.att_session) = '${formatted_date}'
            WHERE s.type = 2
            AND s.year = ${yearCondition}  -- Filter students by year
        ),

        AttendanceSummary AS (
            SELECT
                sa.student_id,
                sa.student_name,
                sa.register_number,
                sa.gmail,
                COUNT(DISTINCT sr.slot_id) AS total_slots,
                SUM(CASE WHEN sa.attendance_status = '1' THEN 1 ELSE 0 END) AS attended_slots
            FROM StudentAttendance sa
            JOIN SlotRequirements sr ON sa.slot_id = sr.slot_id
            GROUP BY sa.student_id, sa.student_name, sa.register_number, sa.gmail
        ),

        FinalStatus AS (
            SELECT
                a.student_id,
                a.student_name,
                a.register_number,
                a.gmail,
                CASE
                    WHEN a.total_slots = a.attended_slots THEN 'PR'        
                    ELSE 'AB'
                END AS STATUS
            FROM AttendanceSummary a
        )

        SELECT
            student_id,
            student_name,
            register_number,
            gmail,
            STATUS
        FROM FinalStatus
        ORDER BY student_id;
      `;

      const attendanceStatus = await get_database(query);
      all_results.push({ date: formatted_date, attendance: attendanceStatus });

      current_date = addDays(current_date, 1);
    }

    res.json(all_results);
  } catch (err) {
    console.error("Error fetching attendance status", err);
    res.status(500).json({ error: "Error fetching attendance status" });
  }
};
