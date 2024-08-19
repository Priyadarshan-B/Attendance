const { get_database } = require("../../config/db_utils");

exports.get_attendance_details = async (req, res) => {
  const student = req.query.student;
  try {
    // Fetch student's year
    const studentQuery = `SELECT year FROM students WHERE id = ?`;
    const studentData = await get_database(studentQuery, [student]);
    if (!studentData.length) {
      return res.status(404).json({ error: "Student not found" });
    }
    const studentYear = studentData[0].year;

    // Fetch semester dates for the student's year
    const semQuery = `
      SELECT from_date, to_date 
      FROM sem_date 
      WHERE year = ? AND status = '1'`;
    const semDates = await get_database(semQuery, [studentYear]);
    if (!semDates.length) {
      return res.status(404).json({ error: "Semester dates not found" });
    }
    const { from_date, to_date } = semDates[0];

    // Fetch holidays
    const holidaysQuery = `SELECT dates FROM holidays WHERE status = '1'`;
    const holidaysData = await get_database(holidaysQuery);
    const holidays = holidaysData.map((holiday) => holiday.dates);

    // Prepare placeholders for the holidays array
    const placeholders = holidays.map(() => '?').join(',');

    // Calculate total days from from_date to to_date excluding Sundays and holidays
    const totalDaysQuery = `
      SELECT COUNT(*) AS total_days
      FROM (
        SELECT 
          (DATE(?) + INTERVAL seq DAY) AS date
        FROM (
          SELECT a.N + b.N * 10 + c.N * 100 AS seq
          FROM 
            (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a,
            (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b,
            (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c
        ) AS numbers
        WHERE (DATE(?) + INTERVAL seq DAY) BETWEEN ? AND ?
      ) AS dates
      WHERE DAYOFWEEK(date) != 1 
      AND date NOT IN (${placeholders})
    `;
    const totalDaysData = await get_database(totalDaysQuery, [
      from_date,
      from_date,
      from_date,
      to_date,
      ...holidays,
    ]);
    const totalDays = totalDaysData[0].total_days;

    // Calculate the number of days from from_date to the current date excluding Sundays and holidays
    const currentDate = new Date().toISOString().split('T')[0];
    const currentDaysQuery = `
      SELECT COUNT(*) AS current_days
      FROM (
        SELECT 
          (DATE(?) + INTERVAL seq DAY) AS date
        FROM (
          SELECT a.N + b.N * 10 + c.N * 100 AS seq
          FROM 
            (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a,
            (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b,
            (SELECT 0 AS N UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c
        ) AS numbers
        WHERE (DATE(?) + INTERVAL seq DAY) BETWEEN ? AND ?
      ) AS dates
      WHERE DAYOFWEEK(date) != 1
      AND date NOT IN (${placeholders})
    `;
    const currentDaysData = await get_database(currentDaysQuery, [
      from_date,
      from_date,
      from_date,
      currentDate,
      ...holidays,
    ]);
    const currentDays = currentDaysData[0].current_days;

    // Fetch attendance data for the student
    const attendanceQuery = `
      SELECT 
        SUM(CASE WHEN forenoon = '1' AND afternoon = '1' THEN 1
                 WHEN forenoon = '1' OR afternoon = '1' THEN 0.5
                 ELSE 0 END) AS present_days,
        COUNT(*) AS counted_days
      FROM attendance
      WHERE student = ? 
      AND date BETWEEN ? AND ? 
      AND status = '1'
    `;
    const attendanceData = await get_database(attendanceQuery, [
      student,
      from_date,
      currentDate,
    ]);
    const { present_days, counted_days } = attendanceData[0];

    const absentDays = currentDays - counted_days;
    const attendancePercentage = (present_days / currentDays) * 100;

    const presentAbsent = `
    SELECT forenoon,afternoon
    FROM attendance
    WHERE student =? AND
    date = CURRENT_DATE()
    AND status ='1';
    `
    const preAb = await get_database(presentAbsent, [student])
    res.json({
      present_days,
      absent_days: absentDays,
      total_days: totalDays,
      current_days: currentDays,
      attendance_percentage: attendancePercentage.toFixed(2),
      present_absent:preAb,
    });
  } catch (err) {
    console.error("Error calculating attendance details", err);
    res.status(500).json({ error: "Error calculating attendance details" });
  }
};
