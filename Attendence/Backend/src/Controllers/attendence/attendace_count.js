const moment = require("moment");
const { get_database, post_database } = require("../../config/db_utils");


exports.checkAndInsertAttendance = async (req, res) => {
  const studentId = req.query.studentId;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID is required" });
  }

  try {
    const studentQuery = `
      SELECT year, type, register_number 
      FROM students 
      WHERE id = ?;
    `;
    const studentResult = await get_database(studentQuery, [studentId]);

    if (studentResult.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { year, type, register_number } = studentResult[0];
    console.log(year, type, register_number);

    const semDateQuery = `
      SELECT from_date, to_date 
      FROM sem_date 
      WHERE year = ? AND status = '1';
    `;
    const semDates = await get_database(semDateQuery, [year]);

    if (semDates.length === 0) {
      return res.status(404).json({ error: "Semester dates not found for the given year" });
    }

    const { from_date, to_date } = semDates[0];

    const startDate = moment("2024-09-04");
    const currentDate = moment();

    for (let date = startDate; date.isSameOrBefore(currentDate); date.add(1, "days")) {
      const formattedDate = date.format("YYYY-MM-DD");

      // Skip Sundays
      if (date.day() === 0) {
        continue; // 0 corresponds to Sunday
      }

      const noArrearQuery = `
        SELECT * 
        FROM no_arrear 
        WHERE student = ? 
        AND DATE(attendence) = ?;
      `;
      const noArrearResult = await get_database(noArrearQuery, [
        studentId,
        formattedDate,
      ]);

      const reAppearQuery = `
        SELECT * 
        FROM re_appear 
        WHERE student = ? 
        AND DATE(att_session) = ?;
      `;
      const reAppearResult = await get_database(reAppearQuery, [
        studentId,
        formattedDate,
      ]);

      if (noArrearResult.length === 0 && reAppearResult.length === 0) {
        const leaveQuery = `
          SELECT from_date, to_date 
          FROM \`leave\` 
          WHERE student = ? AND \`leave\` = 2 AND status = '1'
          AND ? BETWEEN from_date AND to_date;
        `;
        const leaveResult = await get_database(leaveQuery, [
          studentId,
          formattedDate,
        ]);

        if (leaveResult.length > 0) {
          const forenoon = "1";
          const afternoon = "1";

          const existingRecordQuery = `
            SELECT * FROM attendance 
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
      }

      if (type === 1) {
        const attendanceQuery = `
          SELECT DISTINCT DATE(attendence) as date, HOUR(attendence) as hour, MINUTE(attendence) as minute
          FROM no_arrear 
          WHERE student = ? AND DATE(attendence) = ?
          AND attendence BETWEEN ? AND ? 
          AND (
            (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
            OR 
            (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
          );
        `;
        const attendanceRecords = await get_database(attendanceQuery, [
          register_number,
          formattedDate,
          from_date,
          to_date,
        ]);

        let morningSession = false;
        let afternoonSession = false;

        attendanceRecords.forEach((record) => {
          if (record.hour === 8 && record.minute <= 45) {
            morningSession = true;
          } else if (
            record.hour === 12 ||
            (record.hour === 13 && record.minute <= 59)
          ) {
            afternoonSession = true;
          }
        });

        let forenoon = morningSession ? "1" : "0";
        let afternoon = afternoonSession ? "1" : "0";

        const existingRecordQuery = `
          SELECT * FROM attendance 
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

      if (type === 2) {
        const attendanceQuery = `
          SELECT DISTINCT DATE(attendence) as date, HOUR(attendence) as hour, MINUTE(attendence) as minute
          FROM no_arrear 
          WHERE student = ? AND DATE(attendence) = ?
          AND attendence BETWEEN ? AND ? 
          AND (
            (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
            OR 
            (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
          );
        `;
        const attendanceRecords = await get_database(attendanceQuery, [
          register_number,
          formattedDate,
          from_date,
          to_date,
        ]);

        if (attendanceRecords.length > 0) { 
          const forenoonSlotQuery = `
            SELECT id, start_time, end_time 
            FROM time_slots 
            WHERE year = ? 
            AND status = '1' 
            AND session = 'FN';
          `;
          const forenoonSlots = await get_database(forenoonSlotQuery, [year]);

          const afternoonSlotQuery = `
            SELECT id, start_time, end_time 
            FROM time_slots 
            WHERE year = ? 
            AND status = '1' 
            AND session = 'AN';
          `;
          const afternoonSlots = await get_database(afternoonSlotQuery, [year]);

          let forenoon = "0";
          let afternoon = "0";

          const forenoonSlotIds = forenoonSlots.map(slot => slot.id);
          const forenoonAttendanceQuery = `
            SELECT COUNT(DISTINCT slot) as attended_slots
            FROM re_appear 
            WHERE student = ? 
            AND DATE(att_session) = ?
            AND slot IN (${forenoonSlotIds.join(',')})
            AND status = '1';
          `;
          const forenoonAttendance = await get_database(forenoonAttendanceQuery, [studentId, formattedDate]);

          if (forenoonAttendance[0].attended_slots === forenoonSlotIds.length) {
            forenoon = "1";
          }

          const afternoonSlotIds = afternoonSlots.map(slot => slot.id);
          const afternoonAttendanceQuery = `
            SELECT COUNT(DISTINCT slot) as attended_slots
            FROM re_appear 
            WHERE student = ? 
            AND DATE(att_session) = ?
            AND slot IN (${afternoonSlotIds.join(',')})
            AND status = '1';
          `;
          const afternoonAttendance = await get_database(afternoonAttendanceQuery, [studentId, formattedDate]);

          if (afternoonAttendance[0].attended_slots === afternoonSlotIds.length) {
            afternoon = "1";
          }

          // Update or insert attendance records
          const existingRecordQuery = `
            SELECT * FROM attendance 
            WHERE student = ? AND date = ?;
          `;
          const existingRecord = await get_database(existingRecordQuery, [studentId, formattedDate]);

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
      }
    }

    return res.status(200).json({ message: "Attendance processed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while processing attendance" });
  }
};
