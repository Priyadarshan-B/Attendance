const mysql = require("mysql2/promise");
const moment = require("moment");

// Database Configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "attendance",
};

// Helper function to execute queries
async function get_database(query, params = []) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(query, params);
    await connection.end();
    return rows;
  } catch (error) {
    console.error("Error in get_database:", error.message);
    throw error;
  }
}

async function post_database(query, params = []) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(query, params);
    await connection.end();
    return result;
  } catch (error) {
    console.error("Error in post_database:", error.message);
    throw error;
  }
}

exports.processAttendanceForAllStudents = async (req, res) => {
  const startDate = moment("2024-09-18");
  const endDate = moment("2024-11-15");

  try {
    console.log("Fetching students with year III and type = 2...");
    const studentsQuery = `
      SELECT id, register_number, year
      FROM students
      WHERE year = 'III' AND type = 2 AND status = '1';
    `;
    const students = await get_database(studentsQuery);

    if (students.length === 0) {
      console.log("No students found.");
      return res.status(404).json({ error: "No students found for processing" });
    }

    console.log(`Found ${students.length} students to process.`);

    let currentDate = startDate;
    while (currentDate.isSameOrBefore(endDate)) {
      const formattedDate = currentDate.format("YYYY-MM-DD");
      console.log(`Processing attendance for date: ${formattedDate}`);

      for (const student of students) {
        const studentId = student.id;

        console.log(`Processing student ID: ${studentId}, Register No: ${student.register_number}`);

        // Fetch forenoon and afternoon slots
        const forenoonSlotQuery = `
          SELECT id 
          FROM time_slots 
          WHERE year = ? AND status = '1' AND session = 'FN';
        `;
        const forenoonSlots = await get_database(forenoonSlotQuery, [student.year]);

        const afternoonSlotQuery = `
          SELECT id 
          FROM time_slots 
          WHERE year = ? AND status = '1' AND session = 'AN';
        `;
        const afternoonSlots = await get_database(afternoonSlotQuery, [student.year]);

        const forenoonSlotIds = forenoonSlots.map(slot => slot.id);
        const afternoonSlotIds = afternoonSlots.map(slot => slot.id);

        console.log(`Forenoon slots: ${forenoonSlotIds}`);
        console.log(`Afternoon slots: ${afternoonSlotIds}`);

        // Check for no_arrear attendance
        const noArrearForenoonQuery = `
          SELECT * 
          FROM no_arrear 
          WHERE student = ? 
          AND DATE(attendence) = ? 
          AND HOUR(attendence) = 8 
          AND MINUTE(attendence) BETWEEN 0 AND 45;
        `;
        const noArrearForenoon = await get_database(noArrearForenoonQuery, [
          student.register_number,
          formattedDate,
        ]);

        const noArrearAfternoonQuery = `
          SELECT * 
          FROM no_arrear 
          WHERE student = ? 
          AND DATE(attendence) = ? 
          AND (
            (HOUR(attendence) = 12) 
            OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59)
          );
        `;
        const noArrearAfternoon = await get_database(noArrearAfternoonQuery, [
          student.register_number,
          formattedDate,
        ]);

        console.log(`No Arrear Forenoon: ${noArrearForenoon.length}`);
        console.log(`No Arrear Afternoon: ${noArrearAfternoon.length}`);

        // Check re_appear attendance
        const reAppearForenoonQuery = `
          SELECT COUNT(DISTINCT slot) as attended_slots 
          FROM re_appear 
          WHERE student = ? 
          AND DATE(att_session) = ? 
          AND slot IN (${forenoonSlotIds.join(",")}) 
          AND status = '1';
        `;
        const forenoonAttendance = await get_database(reAppearForenoonQuery, [
          studentId,
          formattedDate,
        ]);

        const reAppearAfternoonQuery = `
          SELECT COUNT(DISTINCT slot) as attended_slots 
          FROM re_appear 
          WHERE student = ? 
          AND DATE(att_session) = ? 
          AND slot IN (${afternoonSlotIds.join(",")}) 
          AND status = '1';
        `;
        const afternoonAttendance = await get_database(reAppearAfternoonQuery, [
          studentId,
          formattedDate,
        ]);

        console.log(`Re-Appear Forenoon Attendance: ${forenoonAttendance[0]?.attended_slots}`);
        console.log(`Re-Appear Afternoon Attendance: ${afternoonAttendance[0]?.attended_slots}`);

        let forenoon = "0";
        let afternoon = "0";

        if (
          noArrearForenoon.length > 0 &&
          forenoonAttendance[0]?.attended_slots === forenoonSlotIds.length
        ) {
          forenoon = "1";
        }

        if (
          noArrearAfternoon.length > 0 &&
          afternoonAttendance[0]?.attended_slots === afternoonSlotIds.length
        ) {
          afternoon = "1";
        }

        console.log(`Attendance for Student ${studentId} on ${formattedDate} - Forenoon: ${forenoon}, Afternoon: ${afternoon}`);

        // Update or insert attendance record
        const existingRecordQuery = `
          SELECT * 
          FROM attendance 
          WHERE student = ? AND date = ?;
        `;
        const existingRecord = await get_database(existingRecordQuery, [
          studentId,
          formattedDate,
        ]);

        if (existingRecord.length > 0) {
          const updateAttendanceQuery = `
            UPDATE attendance 
            SET forenoon = ?, afternoon = ? 
            WHERE student = ? AND date = ?;
          `;
          await post_database(updateAttendanceQuery, [
            forenoon,
            afternoon,
            studentId,
            formattedDate,
          ]);
        } else {
          const insertAttendanceQuery = `
            INSERT INTO attendance (student, date, forenoon, afternoon) 
            VALUES (?, ?, ?, ?);
          `;
          await post_database(insertAttendanceQuery, [
            studentId,
            formattedDate,
            forenoon,
            afternoon,
          ]);
        }
      }

      // Move to the next date
      currentDate.add(1, "days");
    }

    res.status(200).json({ message: "Attendance processed successfully for all students" });
  } catch (error) {
    console.error("Error processing attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
