const mysql = require("mysql2/promise");

async function insertAttendance() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "attendance",
  });

  try {
    // Fetch students
    const [students] = await connection.execute(
      "SELECT id, register_number FROM students"
    );

    for (const student of students) {
      const studentId = student.id;
      const registerNumber = student.register_number;

      // Fetch all attendance records for this student
      const [attendanceRecords] = await connection.execute(
        `SELECT attendence 
FROM no_arrear 
WHERE student = ? 
AND attendence IS NOT NULL 
AND attendence BETWEEN '2024-09-04 00:00:00' AND '2024-09-28 23:59:59';
`,
        [registerNumber]
      );

      // Process each attendance record
      for (const record of attendanceRecords) {
        const attendenceTime = new Date(record.attendence);
        const date = attendenceTime.toISOString().split("T")[0]; // Extract date in YYYY-MM-DD format

        let forenoon = "0";
        let afternoon = "0";

        const hours = attendenceTime.getHours();
        const minutes = attendenceTime.getMinutes();

        // Check for forenoon slot (8:00 AM to 8:45 AM)
        if (hours === 8 && minutes >= 0 && minutes <= 45) {
          forenoon = "1";
        }

        // Check for afternoon slot (12:00 PM to 2:00 PM)
        else if (hours >= 12 && hours < 14) {
          afternoon = "1";
        }

        // Now check if a record already exists for the student and the date
        const [existingRecords] = await connection.execute(
          `SELECT id, forenoon, afternoon FROM attendance WHERE student = ? AND date = ?`,
          [studentId, date]
        );

        if (existingRecords.length > 0) {
          // If the record exists, update forenoon and afternoon fields only
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
          // If no record exists, insert a new one
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
