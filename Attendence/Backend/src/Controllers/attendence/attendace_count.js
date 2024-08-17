const moment = require("moment");
const { get_database, post_database } = require("../../config/db_utils");

exports.checkAndInsertAttendance = async (req, res) => {
  const { studentId, roll } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID is required" });
  }

  try {
    const studentQuery = `
      SELECT year, type 
      FROM students 
      WHERE id = ?;
    `;
    const studentResult = await get_database(studentQuery, [studentId]);

    if (studentResult.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { year, type } = studentResult[0];

    const semDateQuery = `
      SELECT from_date, to_date 
      FROM sem_date 
      WHERE year = ? AND status = '1';
    `;
    const semDates = await get_database(semDateQuery, [year]);

    if (semDates.length === 0) {
      return res
        .status(404)
        .json({ error: "Semester dates not found for the given year" });
    }

    const { from_date, to_date } = semDates[0];

    let forenoon = "0",
      afternoon = "0";

    // Define a function to process OD leaves
    const processLeaves = async (studentId, from_date, to_date) => {
      const leaveQuery = `
        SELECT from_date, to_date 
        FROM \`leave\` 
        WHERE student = ? AND \`leave\` = 2 AND status = '1'
        AND from_date <= ? AND to_date >= ?;
      `;
      const odLeaves = await get_database(leaveQuery, [
        studentId,
        to_date,
        from_date,
      ]);

      if (odLeaves.length > 0) {
        for (const leave of odLeaves) {
          const leaveStart = moment(leave.from_date);
          const leaveEnd = moment(leave.to_date);

          let current = leaveStart;

          while (current <= leaveEnd) {
            const dateStr = current.format("YYYY-MM-DD");

            const noArrearQuery = `
              SELECT * 
              FROM no_arrear 
              WHERE student = ? 
              AND DATE(attendence) = ?;
            `;
            const noArrearResult = await get_database(noArrearQuery, [
              studentId,
              dateStr,
            ]);

            const reAppearQuery = `
              SELECT * 
              FROM re_appear 
              WHERE student = ? 
              AND DATE(att_session) = ?;
            `;
            const reAppearResult = await get_database(reAppearQuery, [
              studentId,
              dateStr,
            ]);

            // If no conflicting records, mark as present
            if (noArrearResult.length === 0 && reAppearResult.length === 0) {
              forenoon = "1";
              afternoon = "1";

              const existingRecordQuery = `
                SELECT * FROM attendance 
                WHERE student = ? AND date = ?;
              `;
              const existingRecord = await get_database(existingRecordQuery, [
                studentId,
                dateStr,
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
                  dateStr,
                ]);
              } else {
                const insertAttendanceQuery = `
                  INSERT INTO attendance (student, date, forenoon, afternoon) 
                  VALUES (?, ?, ?, ?);
                `;
                await post_database(insertAttendanceQuery, [
                  studentId,
                  dateStr,
                  forenoon,
                  afternoon,
                ]);
              }
            }

            current = current.add(1, "days");
          }
        }
      }
    };

    // Handle type 1 (regular student with OD leave validation)
    if (type === 1) {
      const attendanceQuery = `
        SELECT DISTINCT DATE(attendence) as date, HOUR(attendence) as hour, MINUTE(attendence) as minute
        FROM no_arrear 
        WHERE student = ?
        AND attendence BETWEEN ? AND ?
        AND (
          (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
          OR 
          (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
        );
      `;
      const attendanceRecords = await get_database(attendanceQuery, [
        roll,
        from_date,
        to_date,
      ]);

      let morningSession = false;
      let afternoonSession = false;
      let attendanceDates = [];

      attendanceRecords.forEach((record) => {
        if (record.hour === 8 && record.minute <= 45) {
          morningSession = true;
          attendanceDates.push(moment(record.date).format("YYYY-MM-DD"));
        } else if (
          record.hour === 12 ||
          (record.hour === 13 && record.minute <= 59)
        ) {
          afternoonSession = true;
          attendanceDates.push(moment(record.date).format("YYYY-MM-DD"));
        }
      });

      if (morningSession && afternoonSession) {
        forenoon = "1";
        afternoon = "1";
      } else {
        forenoon = morningSession ? "1" : "0";
        afternoon = afternoonSession ? "1" : "0";
      }

      for (let date of attendanceDates) {
        const existingRecordQuery = `
          SELECT * FROM attendance 
          WHERE student = ? AND date = ?;
        `;
        const existingRecord = await get_database(existingRecordQuery, [
          studentId,
          date,
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
            date,
          ]);
        } else {
          const insertAttendanceQuery = `
            INSERT INTO attendance (student, date, forenoon, afternoon) 
            VALUES (?, ?, ?, ?);
          `;
          await post_database(insertAttendanceQuery, [
            studentId,
            date,
            forenoon,
            afternoon,
          ]);
        }
      }

      await processLeaves(studentId, from_date, to_date);
    }

    // Handle type 2 (re-appear + OD leave + role_student_map validation)
    if (type === 2) {
      const noArrearQuery = `
        SELECT DISTINCT DATE(attendence) as date, HOUR(attendence) as hour, MINUTE(attendence) as minute
        FROM no_arrear 
        WHERE student = ?
        AND attendence BETWEEN ? AND ?
        AND (
          (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
          OR 
          (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
        );
      `;
      const attendanceRecords = await get_database(noArrearQuery, [
        roll,
        from_date,
        to_date,
      ]);

      let morningSession = false;
      let afternoonSession = false;
      let attendanceDates = [];

      attendanceRecords.forEach((record) => {
        if (record.hour === 8 && record.minute <= 45) {
          morningSession = true;
          attendanceDates.push(moment(record.date).format("YYYY-MM-DD"));
        } else if (
          record.hour === 12 ||
          (record.hour === 13 && record.minute <= 59)
        ) {
          afternoonSession = true;
          attendanceDates.push(moment(record.date).format("YYYY-MM-DD"));
        }
      });

      if (morningSession && afternoonSession) {
        for (let date of attendanceDates) {
          const reAppearQuery = `
            SELECT DATE(att_session) AS present_day
            FROM re_appear
            WHERE student = ?
            AND DATE(att_session) = ?
            AND status = '1'
            GROUP BY DATE(att_session)
            HAVING COUNT(DISTINCT slot) = (SELECT COUNT(*) FROM time_slots WHERE status = '1');
          `;
          const slotRecords = await get_database(reAppearQuery, [
            studentId,
            date,
          ]);

          if (slotRecords.length > 0) {
            forenoon = "1";
            afternoon = "1";
          } else {
            forenoon = "0";
            afternoon = "0";
          }

          // Additional check for students in role_student_map
          const roleMapQuery = `
            SELECT id 
            FROM role_student_map 
            WHERE student = ? AND status = '1';
          `;
          const roleMapResult = await get_database(roleMapQuery, [studentId]);
          console.log(roleMapResult);

          if (roleMapResult.length > 0) {
            const roleStudentId = roleMapResult[0].id;
            const roleStudentQuery = `
            SELECT DATE(attendance) AS present_day
            FROM roles_student
            WHERE student_map = ?
            AND DATE(attendance) = ?
            AND status = '1'
            GROUP BY DATE(attendance)
            HAVING COUNT(DISTINCT slot) = (SELECT COUNT(*) FROM time_slots WHERE status = '1');
            `;
            const roleStudentRecords = await get_database(roleStudentQuery, [
              roleStudentId,
              date,
            ]);
            console.log(roleStudentRecords);
            if (roleStudentRecords.length > 0) {
              forenoon = "1";
              afternoon = "1";
            } else {
              forenoon = "0";
              afternoon = "0";
            }
          }

          const existingRecordQuery = `
            SELECT * FROM attendance 
            WHERE student = ? AND date = ?;
          `;
          const existingRecord = await get_database(existingRecordQuery, [
            studentId,
            date,
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
              date,
            ]);
          } else {
            const insertAttendanceQuery = `
              INSERT INTO attendance (student, date, forenoon, afternoon) 
              VALUES (?, ?, ?, ?);
            `;
            await post_database(insertAttendanceQuery, [
              studentId,
              date,
              forenoon,
              afternoon,
            ]);
          }
        }
      }

      await processLeaves(studentId, from_date, to_date);
    }

    res.status(200).json({ message: "Attendance processed successfully" });
  } catch (error) {
    console.error("Error processing attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
