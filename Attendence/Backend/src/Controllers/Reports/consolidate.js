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

async function getHolidays(year) {
  const query = `
    SELECT dates 
    FROM holidays 
    WHERE year = '${year}' 
    AND status = '1'
  `;
  const holidays = await get_database(query);
  console.log(holidays)
  return holidays.map(row => new Date(row.dates));
}

async function calculateTotalDaysWithoutSundaysAndHolidays(fromDate, toDate, holidays) {
  let current_date = new Date(fromDate);
  const end_date = new Date(toDate);
  let total_days = 0;

  while (current_date <= end_date) {
    if (current_date.getDay() !== 0 && !holidays.some(holiday => holiday.getTime() === current_date.getTime())) {
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

    const holidays = await getHolidays(year);

    const total_days = await calculateTotalDaysWithoutSundaysAndHolidays(from_date, to_date, holidays);

    const all_results = []; 
    const studentAttendanceMap = {};

    while (current_date <= end_date) {
      if (current_date.getDay() === 0 || holidays.some(holiday => holiday.getTime() === current_date.getTime())) {
        current_date = addDays(current_date, 1);
        continue;
      }

      const formatted_date = formatDate(current_date); 
      const yearCondition = isNaN(year) ? `'${year}'` : year;

      const query = `
        SELECT 
          final.student_id,
          final.student_name,
          final.register_number,
          final.gmail,
          MAX(final.attended_fn) AS attended_fn,
          MAX(final.attended_an) AS attended_an,
          CASE
            WHEN MAX(final.attended_fn) = 0 THEN 'AB' ELSE 'PR'
          END AS forenoon_status,
          CASE
            WHEN MAX(final.attended_an) = 0 THEN 'AB' ELSE 'PR'
          END AS afternoon_status
        FROM (
          SELECT
            s.id AS student_id,
            s.name AS student_name,
            s.register_number,
            s.gmail,
            CASE 
              WHEN ts.session = 'FN' THEN 
                (CASE WHEN COALESCE(r.status, '0') = '1' THEN 1 ELSE 0 END)
              ELSE 0
            END AS attended_fn,
            CASE 
              WHEN ts.session = 'AN' THEN 
                (CASE WHEN COALESCE(r.status, '0') = '1' THEN 1 ELSE 0 END)
              ELSE 0
            END AS attended_an
          FROM students s
          JOIN (
            SELECT DISTINCT ts.year AS student_year, ts.id AS slot_id, ts.session
            FROM time_slots ts
          ) ts ON s.year = ts.student_year
          LEFT JOIN re_appear r
            ON s.id = r.student
            AND ts.slot_id = r.slot
            AND DATE(r.att_session) = '${formatted_date}'
          WHERE s.type = 2
            AND s.year = ${yearCondition}
        ) AS final
        GROUP BY final.student_id, final.student_name, final.register_number, final.gmail
        ORDER BY final.student_id;
      `;

      const attendanceStatus = await get_database(query);

      if (!attendanceStatus) {
        console.error('No attendance data fetched for the date:', formatted_date);
        continue;
      }

      attendanceStatus.forEach(student => {
        if (!studentAttendanceMap[student.student_id]) {
          studentAttendanceMap[student.student_id] = {
            student_id: student.student_id,
            student_name: student.student_name,
            register_number: student.register_number,
            gmail: student.gmail,
            total_present: 0,
            total_absent: 0,
            total_days: total_days * 1 
          };
        }

        // Forenoon and Afternoon session logic
        const attended_fn = student.attended_fn;
        const attended_an = student.attended_an;

        if (attended_fn > 0 && attended_an > 0) {
          studentAttendanceMap[student.student_id].total_present += 1; 
        } 
        else if (attended_fn != attended_an) {
          studentAttendanceMap[student.student_id].total_absent += 0.5;
          studentAttendanceMap[student.student_id].total_present += 0.5;
        } 
        else {
          studentAttendanceMap[student.student_id].total_absent += 1; // Both FN and AN absent, count as full day absent
        }
      });

      all_results.push({ date: formatted_date, attendance: attendanceStatus });

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
