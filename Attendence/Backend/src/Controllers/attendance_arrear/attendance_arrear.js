const { get_database, post_database } = require("../../config/db_utils");


const updateAttendanceForStudentArrear = async (studentId, year) => {
  try {
    const forenoonQuery = `
      SELECT s.register_number
      FROM re_appear r
      JOIN time_slots t ON r.slot = t.id
      JOIN students s ON r.student = s.id
      WHERE t.start_time >= '08:45:00' 
        AND t.end_time <= '13:00:00'
        AND DATE(r.att_session) = CURDATE() 
        AND s.id = ?
        AND r.status = '1'
      GROUP BY r.student
      HAVING COUNT(DISTINCT r.slot) = 
          (SELECT COUNT(*) FROM time_slots 
           WHERE year=? AND start_time >= '08:45:00' 
           AND end_time <= '13:00:00' AND status = '1');
    `;

    const afternoonQuery = `
      SELECT s.register_number
      FROM re_appear r
      JOIN time_slots t ON r.slot = t.id
      JOIN students s ON r.student = s.id
      WHERE t.start_time >= '13:00:00' 
        AND t.end_time <= '17:00:00'
        AND DATE(r.att_session) = CURDATE() 
        AND s.id = ?
        AND r.status = '1'
      GROUP BY r.student
      HAVING COUNT(DISTINCT r.slot) = 
          (SELECT COUNT(*) FROM time_slots 
           WHERE year=? AND start_time >= '13:00:00' 
           AND end_time <= '17:00:00' AND status = '1');
    `;

    const forenoonRows = await get_database(forenoonQuery, [studentId, year]);
    const afternoonRows = await get_database(afternoonQuery, [studentId, year]);

    console.log("Forenoon Rows:", forenoonRows);
    console.log("Afternoon Rows:", afternoonRows);

    const registerNumberForenoon = forenoonRows[0]?.register_number;
    const registerNumberAfternoon = afternoonRows[0]?.register_number;

    if (registerNumberForenoon || registerNumberAfternoon) {
      const query = `
        INSERT INTO attendance (register_number, date, forenoon, afternoon) 
        VALUES (?, CURRENT_DATE(), ?, ?) 
        ON DUPLICATE KEY UPDATE 
          forenoon = VALUES(forenoon), 
          afternoon = VALUES(afternoon);
      `;
      await post_database(query, [
        registerNumberForenoon || registerNumberAfternoon,
        registerNumberForenoon ? '1' : '0',
        registerNumberAfternoon ? '1' : '0'
      ], "db2");
    }

    console.log(`Attendance updated successfully for student ID: ${studentId}`);
  } catch (error) {
    console.error(`Error updating attendance for student ID: ${studentId}`, error);
  }
};

module.exports = { updateAttendanceForStudentArrear };