const { get_database, post_database } = require("../../config/db_utils");

exports.get_attendence_n_arrear = async (req, res) => {
    const student = req.query.student;
    if (!student) {
        return res.status(400).json({ error: "Student register number is required" });
    }
    try {
        const query = `
            SELECT attendence 
            FROM no_arrear 
            WHERE student = ?
            AND status = '1'
            ORDER BY attendence DESC;

        `;
        const biometric_details = await get_database(query, [student]);

        if (biometric_details.length > 0) {
            const formattedDetails = biometric_details.map(detail => {
                const date = new Date(detail.attendence);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours24 = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                const hours12 = hours24 % 12 || 12; 
                const period = hours24 < 12 ? 'AM' : 'PM';

                const formattedDate = `${day} / ${month} / ${year}`;
                const formattedTime = `${String(hours12).padStart(2, '0')}:${minutes}:${seconds} ${period}`;

                return {
                    date: formattedDate,
                    time: formattedTime
                };
            });

            res.json(formattedDetails);
        } 
        else {
            res.json({ error: "No attendance data found for the specified student", data: [] });
        }
    } catch (err) {
        console.error("Error fetching Biometric Details", err);
        res.status(500).json({ error: "Error fetching Biometric Details" });
    }
};


// correct att_count
const moment = require("moment");



exports.get_AttendanceCount = async (req, res) => {
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
      return res
        .status(404)
        .json({ error: "Semester dates not found for the given year" });
    }

    const { from_date, to_date } = semDates[0];

    const currentDate = moment().format("YYYY-MM-DD");

    // First, check if the student has a record in no_arrear or re_appear for the current date
    const noArrearQuery = `
      SELECT * 
      FROM no_arrear 
      WHERE student = ? 
      AND DATE(attendence) = ?;
    `;
    const noArrearResult = await get_database(noArrearQuery, [
      studentId,
      currentDate,
    ]);
 
    const reAppearQuery = `
      SELECT * 
      FROM re_appear 
      WHERE student = ? 
      AND DATE(att_session) = ?;
    `;
    const reAppearResult = await get_database(reAppearQuery, [
      studentId,
      currentDate,
    ]);

    // If the student does not have records in no_arrear or re_appear, check the leave records
    if (noArrearResult.length === 0 && reAppearResult.length === 0) {
      const leaveQuery = `
        SELECT from_date, to_date 
        FROM \`leave\` 
        WHERE student = ? AND \`leave\` = 2 AND status = '1'
        AND ? BETWEEN from_date AND to_date;
      `;
      const leaveResult = await get_database(leaveQuery, [
        studentId,
        currentDate,
      ]);

      if (leaveResult.length > 0) {
        const forenoon = "1";
        const afternoon = "1";

        // Check if an attendance record already exists for the current date
        const existingRecordQuery = `
          SELECT * FROM attendance 
          WHERE student = ? AND date = ?;
        `;
        const existingRecord = await get_database(existingRecordQuery, [
          studentId,
          currentDate,
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
            currentDate,
          ]);
        } else {
          const insertAttendanceQuery = `
            INSERT INTO attendance (student, date, forenoon, afternoon) 
            VALUES (?, ?, ?, ?);
          `;
          await post_database(insertAttendanceQuery, [
            studentId,
            currentDate,
            forenoon,
            afternoon,
          ]);
        }
      }
    }

    // Handle type 1 (regular student with OD leave validation)
    if (type === 1) {
        const attendanceQuery = `
          SELECT DISTINCT DATE(attendence) as date, HOUR(attendence) as hour, MINUTE(attendence) as minute
          FROM no_arrear 
          WHERE student = ?
          AND DATE(attendence) = CURDATE()
          AND attendence BETWEEN ? AND ?
          AND (
            (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
            OR 
            (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
          );
        `;
        const attendanceRecords = await get_database(attendanceQuery, [
          register_number,
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
      
        let forenoon = morningSession ? "1" : "0";
        let afternoon = afternoonSession ? "1" : "0";
      
        // Check role mapping
        const roleMapQuery = `
            SELECT id 
            FROM role_student_map 
            WHERE student = ? AND status = '1';
          `;
          const roleMapResults = await get_database(roleMapQuery, [studentId]);
          console.log(roleMapResults);

          let allRolesHaveDistinctAttendance = true;

          for (const roleMapResult of roleMapResults) {
            const roleStudentId = roleMapResult.id;
            const roleStudentQuery = `
              SELECT DATE(attendance) AS present_day
              FROM roles_student
              WHERE student_map = ?
              AND DATE(attendance) = CURRENT_DATE()
              AND status = '1'
              GROUP BY DATE(attendance)
              HAVING COUNT(DISTINCT session) = (SELECT COUNT(*) FROM session WHERE status = '1');
            `;
            const roleStudentRecords = await get_database(roleStudentQuery, [roleStudentId]);

            if (roleStudentRecords.length === 0) {
              allRolesHaveDistinctAttendance = false;
              break; 
            }
          }

          if (allRolesHaveDistinctAttendance) {
            forenoon = "1";
            afternoon = "1";
          } else {
            forenoon = "0";
            afternoon = "0";
          }

        // Update or insert attendance records
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
        AND DATE(attendence) = CURDATE()
        AND attendence BETWEEN ? AND ?
        AND (
          (HOUR(attendence) = 8 AND MINUTE(attendence) BETWEEN 0 AND 45) 
          OR 
          (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
        );
      `;
      const attendanceRecords = await get_database(noArrearQuery, [
        register_number,
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
            SELECT COUNT(DISTINCT slot) AS distinct_slot_count
            FROM re_appear
            WHERE student = ?
            AND DATE(att_session) = CURRENT_DATE()
            AND status = '1';
          `;
          const slotRecords = await get_database(reAppearQuery, [studentId]);
        
          const availableSlotQuery = `
            SELECT COUNT(*) AS available_slot_count
            FROM time_slots
            WHERE year = ?
            AND status = '1'; 
          `;
          const availableSlotRecords = await get_database(availableSlotQuery, [year]);
        
          const distinctSlotCount = slotRecords.length > 0 ? slotRecords[0].distinct_slot_count : 0;
          const availableSlotCount = availableSlotRecords.length > 0 ? availableSlotRecords[0].available_slot_count : 0;
        
          if (distinctSlotCount !== availableSlotCount) {
            forenoon = "0";
            afternoon = "0";
          } else {
            forenoon = "1";
            afternoon = "1";
        
            const roleMapQuery = `
              SELECT id 
              FROM role_student_map 
              WHERE student = ? AND status = '1';
            `;
            const roleMapResults = await get_database(roleMapQuery, [studentId]);
        
            let allRolesHaveDistinctAttendance = true;
        
            for (const roleMapResult of roleMapResults) {
              const roleStudentId = roleMapResult.id;
              const roleStudentQuery = `
                SELECT DATE(attendance) AS present_day
                FROM roles_student
                WHERE student_map = ?
                AND DATE(attendance) = CURRENT_DATE()
                AND status = '1'
                GROUP BY DATE(attendance)
                HAVING COUNT(DISTINCT session) = (SELECT COUNT(*) FROM session WHERE status = '1');
              `;
              const roleStudentRecords = await get_database(roleStudentQuery, [roleStudentId]);
        
              if (roleStudentRecords.length === 0) {
                allRolesHaveDistinctAttendance = false;
                break; // If any role doesn't have distinct attendance, break out of the loop
              }
            }
        
            if (allRolesHaveDistinctAttendance) {
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
        
        await processLeaves(studentId, from_date, to_date);
      }
    }

    res.status(200).json({ message: "Attendance processed successfully" });
  } catch (error) {
    console.error("Error processing attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

