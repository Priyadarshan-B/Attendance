const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',       
  user: 'root',   
  password: 'root', 
  database: 'attendance'   
};

const executeSelectQuery = async (query, params) => {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute(query, params);
  await connection.end();
  return rows;
};

const updateAttendanceForStudentArrear = async (studentId, year, date, registerNumber) => {
  try {
    const attendanceTimeCheckQuery = `
      SELECT DISTINCT DATE(attendence) as date, HOUR(attendence) as hour, MINUTE(attendence) as minute
      FROM no_arrear 
      WHERE student = ?
      AND DATE(attendence) = ?
      AND attendence BETWEEN ? AND ?
      AND (
        (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
        OR 
        (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
      );
    `;

    const forenoonAttendanceRows = await executeSelectQuery(attendanceTimeCheckQuery, [
      registerNumber, 
      date, 
      `${date} 08:00:00`, 
      `${date} 08:45:00`
    ]);

    const afternoonAttendanceRows = await executeSelectQuery(attendanceTimeCheckQuery, [
      registerNumber, 
      date, 
      `${date} 12:00:00`, 
      `${date} 13:59:59`
    ]);

    let forenoonStatus = '0';
    let afternoonStatus = '0';

    if (forenoonAttendanceRows.length > 0) {
      forenoonStatus = '1';
    }

    if (afternoonAttendanceRows.length > 0) {
      afternoonStatus = '1';
    }

    const checkExistingAttendanceQuery = `
      SELECT forenoon, afternoon 
      FROM attendance 
      WHERE student = ? 
      AND date = ?;
    `;

    const existingAttendance = await executeSelectQuery(checkExistingAttendanceQuery, [studentId, date]);

    if (existingAttendance.length > 0) {
      const currentForenoon = existingAttendance[0].forenoon;
      const currentAfternoon = existingAttendance[0].afternoon;

      if (forenoonStatus !== currentForenoon || afternoonStatus !== currentAfternoon) {
        const updateAttendanceQuery = `
          UPDATE attendance 
          SET forenoon = ?, afternoon = ?
          WHERE student = ? AND date = ?;
        `;
        await executeSelectQuery(updateAttendanceQuery, [
          forenoonStatus, 
          afternoonStatus, 
          studentId, 
          date
        ]);
        console.log(`Attendance updated for student register_number: ${registerNumber} on date: ${date}`);
      } else {
        console.log(`No updates required for student register_number: ${registerNumber} on date: ${date}`);
      }
    } else {
      const insertAttendanceQuery = `
        INSERT INTO attendance (student, date, forenoon, afternoon) 
        VALUES (?, ?, ?, ?);
      `;
      await executeSelectQuery(insertAttendanceQuery, [
        studentId, 
        date, 
        forenoonStatus, 
        afternoonStatus
      ]);
      console.log(`Attendance inserted for student register_number: ${registerNumber} on date: ${date}`);
    }

  } catch (error) {
    console.error(`Error updating attendance for student register_number: ${registerNumber} on date: ${date}`, error);
  }
};

const updateAllType2Students = async () => {
  try {
    const query = `
      SELECT id, year, register_number
      FROM students
      WHERE type = 2 AND status = '1';
    `;

    const students = await executeSelectQuery(query);

    if (students.length === 0) {
      console.log('No students found with type 2.');
      return;
    }

    const startDate = new Date('2024-10-07');
    const endDate = new Date('2024-10-18');
 
    for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const formattedDate = currentDate.toISOString().slice(0, 10); // Format date as YYYY-MM-DD

      for (const student of students) {
        const { id, year, register_number } = student;
        console.log(`Updating attendance for student register_number: ${register_number}, Year: ${year}, Date: ${formattedDate}`);
        await updateAttendanceForStudentArrear(id, year, formattedDate, register_number);
      }
    }

    console.log('Attendance update completed for all type 2 students.');
  } catch (error) {
    console.error('Error fetching students with type 2:', error);
  }
};

updateAllType2Students();
