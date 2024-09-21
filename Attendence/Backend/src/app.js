const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const passport = require("passport");
const session = require("express-session");
const passportConfig = require("./config/passport");
const cron = require('node-cron');
const {get_database} = require('./config/db_utils')
const authenticateGoogleJWT = require('./middleware/authenticate');
const { update_7_days } = require('./Controllers/attendence/biometric'); 
const {update_biometrics} = require('./Controllers/attendence/biometric')
const {get_AttendanceCount} = require('./Controllers/attendence/attendence')
const {get_attendance_details} = require('./Controllers/Percentage/percentage')
const {updateAttendanceForStudentArrear} = require('./Controllers/attendance_arrear/attendance_arrear')
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

//routes
const routes = require('./Routes/routes');
const auth_route = require('./Routes/auth/auth_routes');
const resources_route = require('./Routes/auth/res_route');

const morgan_config = morgan(
  ":method :url :status :res[content-length] - :response-time ms"
);

const app = express();
const port = process.env.PORT;

// session
app.use(
  session({
    secret: "this is my secrect code",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// cors
app.use(express.json());
const cors_config = {
    origin: "*",
};
app.use(cors(cors_config));
app.use(morgan_config);

// routes
app.use("/attendance/api/auth", resources_route);
app.use("/attendance/api/auth", auth_route);
app.use("/attendance/api",authenticateGoogleJWT,routes);


const processAttendanceForAllStudents = async () => {
  try {
    const studentsQuery = 'SELECT id FROM students';
    const students = await get_database(studentsQuery);

    if (students.length === 0) {
      console.log("No students found.");
      return;
    }

    for (const stud of students) {
      const studentId = stud.id;
      const student = stud.id
      await get_AttendanceCount(
        { query: { studentId } }, 
        { status: () => ({ json: () => {} }) }
      );
      await get_attendance_details(
        { query: { student} }, 
        { status: () => ({ json: () => {} }) }
      );
    }

    console.log("Attendance processing completed for all students.");
  } catch (error) {
    console.error("Error processing attendance for all students:", error);
  }
};


cron.schedule('0 0 * * 3', async () => {
    try {
        console.log('Executing update_7_days cron job...');
        await update_7_days();
    } catch (error) {
        console.error('Error during scheduled update_7_days:', error);
    }
});
cron.schedule('43 00 * * *', async () => {
  try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
  } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
  }
});

cron.schedule('27 15 * * *', async () => {
  try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
  } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
  }
});

// cron.schedule('52 09 * * *', async () => {
//   try {
//       console.log('Executing update_biometrics cron job...');
//       await update_biometrics();
//       await processAttendanceForAllStudents();
//   } catch (error) {
//       console.error('Error during scheduled update_biometrics:', error);
//   }
// });cron.schedule('0 18 * * *', async () => {
//   try {
//       console.log('Executing update_biometrics cron job...');
//       await update_biometrics();
//       await processAttendanceForAllStudents();
//   } catch (error) {
//       console.error('Error during scheduled update_biometrics:', error);
//   }
// });



// grafana 
const fetchArrearStudents = async () => {
  try {
      const query = `
          SELECT id, year 
          FROM students 
          WHERE type = 2 AND status = '1';
      `;

      const result = await get_database(query);
      
      console.log("Fetched students:", result);
      
      return Array.isArray(result) ? result : [];
  } catch (error) {
      console.error("Error fetching eligible students:", error);
      return [];
  }
};

const runAttendanceUpdate = async () => {
  try {
      const students = await fetchArrearStudents();

      if (!Array.isArray(students)) {
          throw new TypeError("Expected students to be an array.");
      }

      for (const student of students) {
          const { id: studentId, year } = student;

          await updateAttendanceForStudentArrear(studentId, year);
      }

      console.log("Attendance update completed.");
  } catch (error) {
      console.error("Error during attendance update:", error);
  }
};

cron.schedule('30 12 * * *', runAttendanceUpdate); 
cron.schedule('30 16 * * *', runAttendanceUpdate); 
cron.schedule('00 20 * * *', runAttendanceUpdate); 

console.log("Attendance updation  scheduled for 12:30 PM, 4:30 PM, and 8:00 PM.");

// listen port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
