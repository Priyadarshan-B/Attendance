const cron = require('node-cron');
const {get_database} = require('../config/db_utils');
// const { update_7_days, update_biometrics } = require('../Controllers/attendence/biometric'); 
// const { get_AttendanceCount } = require('../Controllers/attendence/attendence');
const { get_attendance_details } = require('../Controllers/Percentage/percentage');
// const { updateAttendanceForStudentArrear } = require('../Controllers/attendance_arrear/attendance_arrear');
// const {checkAndInsertAttendance} = require('../Controllers/attendence/attendace_count')
const {AttendanceCalc} = require('../Controllers/attendence/attendance_calc')

const processAttendanceForAllStudents = async () => {
  try {
    const studentsQuery = 'SELECT id FROM students';
    const students = await get_database(studentsQuery);

    if (students.length === 0) {
      console.log("No students found.");
      return;
    }

    for (const stud of students) {
      // const studentId = stud.id;
      const student = stud.id;
      // await checkAndInsertAttendance(
      //   { query: { studentId } }, 
      //   { status: () => ({ json: () => {} }) }
      // );
      // await get_AttendanceCount(
      //   { query: { studentId } }, 
      //   { status: () => ({ json: () => {} }) }
      // );
      await get_attendance_details(
        { query: { student } }, 
        { status: () => ({ json: () => {} }) }
      );
    }

    console.log("Attendance processing completed for all students.");
  } catch (error) {
    console.error("Error processing attendance for all students:", error);
  }
}; 

const fetchArrearStudents = async () => {
  try {
    const query = `SELECT id,register_number, year FROM students WHERE type = 2 AND status = '1';`;
    const result = await get_database(query);
    console.log("Fetched students:", result);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error fetching eligible students:", error);
    return [];
  }
};

// const runAttendanceUpdate = async () => {
//   try {
//     const students = await fetchArrearStudents();

//     if (!Array.isArray(students)) {
//       throw new TypeError("Expected students to be an array.");
//     }

//     for (const student of students) {
//       const { id: studentId, year } = student;
//       await updateAttendanceForStudentArrear(studentId, year);
//     }

//     console.log("Attendance update completed.");
//   } catch (error) {
//     console.error("Error during attendance update:", error);
//   }
// };

const Attendance_FN_AN = async () => {
  try {
    const students = await fetchArrearStudents();

    if (!Array.isArray(students)) {
      throw new TypeError("Expected students to be an array.");
    }

    for (const student of students) {
      const { id: studentId,register_number, year } = student;
      await AttendanceCalc(studentId,register_number, year);
    }

    console.log("Attendance update completed.");
  } catch (error) {
    console.error("Error during attendance update:", error);
  }
};
const scheduleCronJobs = () => {
  cron.schedule('00 21 * * *', async () => {
    try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
    } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
    }
  });
  cron.schedule('00 17 * * *', async () => {
    try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
    } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
    }
  });

  // cron.schedule('00 23 * * *', runAttendanceUpdate); 

cron.schedule("30 16 * * *", Attendance_FN_AN);
cron.schedule("0 0 * * *", Attendance_FN_AN);
// cron.schedule("54  13 * * *", Attendance_FN_AN);

  console.log("Cron jobs scheduled for update_7_days, biometrics, and attendance update.");
};

module.exports = { scheduleCronJobs };
