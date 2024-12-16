const moment = require("moment");
const { get_database, post_database } = require("../../config/db_utils");

exports.AttendanceCalc = async (studentId, register_number, year) => {
    console.log("Processing attendance for:", { studentId, register_number, year });

    try {
        const currentDate = moment().format("YYYY-MM-DD");
        console.log("Current date:", currentDate);

        let forenoon = "0";
        let afternoon = "0";

        // Fetch forenoon attendance
        const noArrearFNQuery = `
                SELECT DISTINCT attendence
    FROM no_arrear
    WHERE student = '7376221CS269' AND DATE(attendence) = '2024-12-16' AND STATUS = '1'
    AND (
        (HOUR(attendence) = 8 AND MINUTE(attendence) <= 44 AND SECOND(attendence) <= 59)
    )
    ORDER BY attendence ASC`;
        const noArrearFN = await get_database(noArrearFNQuery, [register_number, currentDate]);

        console.log("Forenoon attendance data:", noArrearFN);

        if (noArrearFN.length > 0) {
            const forenoonSlotsQuery = `
                SELECT id 
                FROM time_slots 
                WHERE year = ? AND session = 'FN' AND status = '1'`;
            const forenoonSlots = await get_database(forenoonSlotsQuery, [year]);

            if (forenoonSlots.length > 0) {
                const forenoonSlotIds = forenoonSlots.map((slot) => slot.id).join(",");

                const forenoonSlotAttendanceQuery = `
                    SELECT COUNT(DISTINCT slot) as attended_slots 
                    FROM re_appear 
                    WHERE student = ? AND DATE(att_session) = ? 
                    AND slot IN (${forenoonSlotIds}) AND status = '1'`;
                const forenoonSlotAttendance = await get_database(forenoonSlotAttendanceQuery, [studentId, currentDate]);

                console.log("Forenoon slot attendance:", forenoonSlotAttendance);

                if (forenoonSlotAttendance[0].attended_slots >= forenoonSlots.length - 1) {
                    forenoon = "1";
                }
            }
        }

        // Fetch afternoon attendance
        const noArrearANQuery = `
            SELECT DISTINCT attendence 
            FROM no_arrear 
            WHERE student = ? AND DATE(attendence) = ? AND status = '1' 
            AND (
                (HOUR(attendence) = 12 OR (HOUR(attendence) = 13 AND MINUTE(attendence) <= 59))
            ) 
            ORDER BY attendence ASC`;
        const noArrearAN = await get_database(noArrearANQuery, [register_number, currentDate]);

        console.log("Afternoon attendance data:", noArrearAN);

        if (noArrearAN.length > 0) {
            const afternoonSlotsQuery = `
                SELECT id 
                FROM time_slots 
                WHERE year = ? AND session = 'AN' AND status = '1'`;
            const afternoonSlots = await get_database(afternoonSlotsQuery, [year]);

            if (afternoonSlots.length > 0) {
                const afternoonSlotIds = afternoonSlots.map((slot) => slot.id).join(",");

                const afternoonSlotAttendanceQuery = `
                    SELECT COUNT(DISTINCT slot) as attended_slots 
                    FROM re_appear 
                    WHERE student = ? AND DATE(att_session) = ? 
                    AND slot IN (${afternoonSlotIds}) AND status = '1'`;
                const afternoonSlotAttendance = await get_database(afternoonSlotAttendanceQuery, [studentId, currentDate]);

                console.log("Afternoon slot attendance:", afternoonSlotAttendance);

                if (afternoonSlotAttendance[0].attended_slots >= afternoonSlots.length - 1) {
                    afternoon = "1";
                }
            }
        }

        // Check existing attendance record
        const existingRecordQuery = `
            SELECT * FROM attendance 
            WHERE student = ? AND date = ?`;
        const existingRecord = await get_database(existingRecordQuery, [studentId, currentDate]);

        if (existingRecord.length > 0) {
            await post_database(
                `UPDATE attendance SET forenoon = ?, afternoon = ? WHERE student = ? AND date = ?`,
                [forenoon, afternoon, studentId, currentDate]
            );
            console.log(`Updated attendance for Student ID: ${studentId} on ${currentDate}`);
        } else {
            await post_database(
                `INSERT INTO attendance (student, date, forenoon, afternoon) VALUES (?, ?, ?, ?)`,
                [studentId, currentDate, forenoon, afternoon]
            );
            console.log(`Inserted attendance for Student ID: ${studentId} on ${currentDate}`);
        }
    } catch (error) {
        console.error("Error processing attendance:", error);
    }
};
