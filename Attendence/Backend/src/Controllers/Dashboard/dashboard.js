const { get_database } = require("../../config/db_utils");
const moment = require("moment");

exports.get_dashboard_details = async (req, res) => {
  try {
    const studentCountQuery = `
      SELECT COUNT(name) AS students 
      FROM students;
    `;
    const studentResult = await get_database(studentCountQuery);

    const attendanceCountQuery = `
     SELECT 
    DATE(DATE) AS attendanceDate, 
    COUNT(*) AS attendanceCount 
FROM 
    attendance 
WHERE 
    DATE(DATE) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY 
    DATE(DATE)
ORDER BY 
    DATE(DATE);
    `;
    const attendanceResult = await get_database(attendanceCountQuery);

    const formattedAttendanceResult = attendanceResult.map((record) => {
      return {
        attendanceDate: moment(record.attendanceDate).format("YYYY-MM-DD"),
        attendanceCount: record.attendanceCount
      };
    });

    const previousDateQuery = `
      SELECT COUNT(*) AS previousDateCount
      FROM attendance 
      WHERE DATE(date) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY);
    `;
    const previousCount = await get_database(previousDateQuery);

    const todayDateQuery = `
    SELECT COUNT(*) AS todayDateCount
    FROM attendance 
    WHERE DATE(date) = CURRENT_DATE();
  `;
  const todayCount = await get_database(todayDateQuery);
    const dashboard = {
      students: studentResult[0].students,
      attendanceByDate: formattedAttendanceResult, 
      previousDateCount: previousCount[0].previousDateCount,
      todayDateCount: todayCount[0].todayDateCount
    };

    res.json(dashboard);
  } catch (err) {
    console.error("Error Fetching Dashboard data", err);
    res.status(500).json({ error: "Error Fetching Dashboard data" });
  }
};
