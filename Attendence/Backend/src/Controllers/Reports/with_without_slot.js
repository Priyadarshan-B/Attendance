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

exports.getAttendanceByDate = async (req, res) => {
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
          s.id AS student_id,
          s.name AS student_name,
          s.register_number,
          s.gmail,
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN ts.session = 'FN' THEN ts.id END) = 
                 COUNT(DISTINCT CASE WHEN ts.session = 'FN' AND COALESCE(r.status, '0') = '1' THEN ts.id END)
            THEN 'PR' 
            ELSE 'AB' 
          END AS forenoon_status,
          CASE 
            WHEN COUNT(DISTINCT CASE WHEN ts.session = 'AN' THEN ts.id END) = 
                 COUNT(DISTINCT CASE WHEN ts.session = 'AN' AND COALESCE(r.status, '0') = '1' THEN ts.id END)
            THEN 'PR' 
            ELSE 'AB' 
          END AS afternoon_status
        FROM students s
        LEFT JOIN time_slots ts ON s.year = ts.year
        LEFT JOIN re_appear r ON s.id = r.student AND ts.id = r.slot AND DATE(r.att_session) = '${formatted_date}'
        WHERE s.type = 2 AND s.year = ${yearCondition}
        GROUP BY s.id, s.name, s.register_number, s.gmail;
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

        // Calculate present and absent days
        const attended_fn = student.forenoon_status === 'PR' ? 1 : 0;
        const attended_an = student.afternoon_status === 'PR' ? 1 : 0;

        if (attended_fn === 1 && attended_an === 1) {
          studentAttendanceMap[student.student_id].total_present += 1; 
        } else if (attended_fn === 0 && attended_an === 1) {
          studentAttendanceMap[student.student_id].total_absent += 0.5;
          studentAttendanceMap[student.student_id].total_present += 0.5;
        } else if (attended_fn === 1 && attended_an === 0) {
          studentAttendanceMap[student.student_id].total_absent += 0.5;
          studentAttendanceMap[student.student_id].total_present += 0.5;
        } else {
          studentAttendanceMap[student.student_id].total_absent += 1; 
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
    console.error("Error fetching slot only attendance status", err);
    res.status(500).json({ error: "Error fetching slot only attendance status" });
  }
};
