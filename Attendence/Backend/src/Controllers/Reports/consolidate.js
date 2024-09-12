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

// Function to calculate total non-Sunday days
function calculateTotalDaysWithoutSundays(fromDate, toDate) {
  let current_date = new Date(fromDate);
  const end_date = new Date(toDate);
  let total_days = 0;

  while (current_date <= end_date) {
    if (current_date.getDay() !== 0) { // Skip Sundays
      total_days++;
    }
    current_date = addDays(current_date, 1);
  }

  return total_days;
}

exports.get_attendance_status = async (req, res) => {
  try {
    const { from_date, to_date, year } = req.query;

    if (!from_date || !to_date || !year) {
      return res.status(400).json({ error: "from_date, to_date, and year are required" });
    }

    let current_date = new Date(from_date);
    const end_date = new Date(to_date);

    // Calculate total days excluding Sundays
    const total_days = calculateTotalDaysWithoutSundays(from_date, to_date);

    const all_results = [];
    const studentAttendanceMap = {};

    while (current_date <= end_date) {
      // Skip Sundays
      if (current_date.getDay() === 0) { // 0 is Sunday
        current_date = addDays(current_date, 1);
        continue;
      }

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
            AND s.year = ${yearCondition} 
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

      attendanceStatus.forEach(student => {
        if (!studentAttendanceMap[student.student_id]) {
          studentAttendanceMap[student.student_id] = {
            student_id: student.student_id,
            student_name: student.student_name,
            register_number: student.register_number,
            gmail: student.gmail,
            total_present: 0,
            total_absent: 0,
            total_days: total_days // Total number of days excluding Sundays
          };
        }
        if (student.STATUS === 'PR') {
          studentAttendanceMap[student.student_id].total_present++;
        } else {
          studentAttendanceMap[student.student_id].total_absent++;
        }
      });

      all_results.push({ date: formatted_date, attendance: attendanceStatus });

      // Move to the next day
      current_date = addDays(current_date, 1);
    }

    const attendanceDetails = Object.values(studentAttendanceMap).map(student => {
      const percentage_present = ((student.total_present / student.total_days) * 100).toFixed(2);
      return {
        ...student,
        percentage_present
      };
    });

    res.json({
      attendance_details: all_results,
      student_summary: attendanceDetails
    });
  } catch (err) {
    console.error("Error fetching attendance status", err);
    res.status(500).json({ error: "Error fetching attendance status" });
  }
};
