const mysql = require("mysql2/promise");
const moment = require("moment");
const cron = require("node-cron");

const pool = mysql.createPool({
  host: "localhost",
  user: "root", 
  password: "root", 
  database: "attendance", 
  waitForConnections: true,
  connectionLimit: 10,
});

const processAttendance = async () => {
  try {
    const startDate = moment("2024-09-18");
    const endDate = moment("2024-11-15");

    const [students] = await pool.query(
      `SELECT id, register_number FROM students WHERE type = 2 AND year = 'III'`
    );

    for (const student of students) {
      const { id: studentId, register_number } = student;

      for (
        let date = startDate.clone();
        date.isSameOrBefore(endDate);
        date.add(1, "day")
      ) {
        const currentDate = date.format("YYYY-MM-DD");
        let forenoon = "0";
        let afternoon = "0";

        const [noArrearFN] = await pool.query(
          `SELECT DISTINCT attendence 
           FROM no_arrear 
           WHERE student = ? AND DATE(attendence) = ? AND status = '1'
           AND (
             (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
           )`,
          [register_number, currentDate]
        );

        if (noArrearFN.length > 0) {
          const [forenoonSlots] = await pool.query(
            `SELECT id FROM time_slots WHERE year = 'III' AND session = 'FN' AND status = '1'`
          );
          const forenoonSlotIds = forenoonSlots.map((slot) => slot.id).join(",");

          const [forenoonSlotAttendance] = await pool.query(
            `SELECT COUNT(DISTINCT slot) as attended_slots 
             FROM re_appear 
             WHERE student = ? AND DATE(att_session) = ? 
             AND slot IN (${forenoonSlotIds}) AND status = '1'`,
            [studentId, currentDate]
          );

          if (forenoonSlotAttendance[0].attended_slots === forenoonSlots.length) {
            forenoon = "1";
          }
          else if (forenoonSlotAttendance[0].attended_slots === forenoonSlots.length-1) {
            forenoon = "1";
          } else {
            forenoon = "0";  
          }
        } else {
          forenoon = "0"; 
        }

        const [noArrearAN] = await pool.query(
          `SELECT DISTINCT attendence 
           FROM no_arrear 
           WHERE student = ? AND DATE(attendence) = ? AND status = '1'
           AND (
             (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
           )`,
          [register_number, currentDate]
        );

        if (noArrearAN.length > 0) {
          const [afternoonSlots] = await pool.query(
            `SELECT id FROM time_slots WHERE year = 'III' AND session = 'AN' AND status = '1'`
          );
          const afternoonSlotIds = afternoonSlots.map((slot) => slot.id).join(",");

          const [afternoonSlotAttendance] = await pool.query(
            `SELECT COUNT(DISTINCT slot) as attended_slots 
             FROM re_appear 
             WHERE student = ? AND DATE(att_session) = ? 
             AND slot IN (${afternoonSlotIds}) AND status = '1'`,
            [studentId, currentDate]
          );

          if (afternoonSlotAttendance[0].attended_slots === afternoonSlots.length) {
            afternoon = "1";
          }
          else if(afternoonSlotAttendance[0].attended_slots === afternoonSlots.length-1){
            afternoon = '1'
          }        
            else {
            afternoon = "0";  
          }
        } else {
          afternoon = "0"; 
        }

        const [existingRecord] = await pool.query(
          `SELECT * FROM attendance WHERE student = ? AND date = ?`,
          [studentId, currentDate]
        );

        if (existingRecord.length > 0) {
          await pool.query(
            `UPDATE attendance SET forenoon = ?, afternoon = ? WHERE student = ? AND date = ?`,
            [forenoon, afternoon, studentId, currentDate]
          );
        } else {
          await pool.query(
            `INSERT INTO attendance (student, date, forenoon, afternoon) VALUES (?, ?, ?, ?)`,
            [studentId, currentDate, forenoon, afternoon]
          );
        }
      }
    }
  } catch (error) {
    console.error("Error processing attendance:", error);
  }
};

cron.schedule("00 09 * * *", async () => {
  console.log("Starting attendance processing for all students...");
  await processAttendance();
  console.log("Attendance processing completed for all students.");
});

console.log("Cron job for attendance processing scheduled.");
