const mysql = require("mysql2/promise");

async function insertAttendance() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "attendance",
  });

  try {
    const [students] = await connection.execute(`SELECT id, register_number FROM students WHERE YEAR = 'III' AND TYPE = 2`);

    for (const student of students) {
      const studentId = student.id;
      const registerNumber = student.register_number;

      const [attendanceRecords] = await connection.execute(
        `SELECT no_arrear.attendence
         FROM no_arrear
         WHERE no_arrear.student = ?
         AND no_arrear.attendence IS NOT NULL
         AND DATE(no_arrear.attendence) BETWEEN '2024-10-02' AND '2024-10-05'`,
        [registerNumber] 
      );

      if (attendanceRecords.length === 0) {
        continue;
      }

      const attendanceByDate = {};
      for (const record of attendanceRecords) {
        const attendenceTime = new Date(record.attendence);
        const date = attendenceTime.toISOString().split('T')[0];

        if (!attendanceByDate[date]) {
          attendanceByDate[date] = [];
        }
        attendanceByDate[date].push(attendenceTime);
      }

      for (const date in attendanceByDate) {
        const recordsForDate = attendanceByDate[date];

        recordsForDate.sort((a, b) => a - b);

        let forenoon = "0";
        let afternoon = "0";

        let forenoonFound = false;
        let afternoonFound = false;

        for (const record of recordsForDate) {
          const hours = record.getHours();   
          const minutes = record.getMinutes();

          if (!forenoonFound && hours === 8 && minutes >= 0 && minutes <= 45) {
            forenoon = "1";
            forenoonFound = true;  
          }

          if (!afternoonFound && hours >= 12 && hours < 14) {
            afternoon = "1";  
            afternoonFound = true;  
          }

          if (forenoonFound && afternoonFound) {
            break;
          }
        }

        const [existingRecords] = await connection.execute(
          `SELECT id, forenoon, afternoon FROM attendance WHERE student = ? AND date = ?`,
          [studentId, date]
        );

        if (existingRecords.length > 0) {
          const existingRecord = existingRecords[0];
          let updateQuery = "";
          let queryParams = [];

          if (existingRecord.forenoon === "0" && forenoon === "1") {
            updateQuery += "forenoon = ?";
            queryParams.push(forenoon);
          }

          if (existingRecord.afternoon === "0" && afternoon === "1") {
            if (updateQuery) updateQuery += ", ";
            updateQuery += "afternoon = ?";
            queryParams.push(afternoon);
          }

          if (updateQuery) {
            queryParams.push(studentId, date);
            await connection.execute(
              `UPDATE attendance SET ${updateQuery} WHERE student = ? AND date = ?`,
              queryParams
            );
          }
        } else {
          await connection.execute(
            `INSERT INTO attendance (student, date, forenoon, afternoon, status)
             VALUES (?, ?, ?, ?, '1')`,
            [studentId, date, forenoon, afternoon]
          );
        }
      }
    }

    console.log("Attendance records inserted/updated successfully.");
  } catch (err) {
    console.error("Error inserting attendance records:", err);
  } finally {
    await connection.end();
  }
} 

insertAttendance();
