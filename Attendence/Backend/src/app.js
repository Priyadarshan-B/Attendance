const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const passport = require("passport");
const session = require("express-session");
const passportConfig = require("./config/passport");
const cron = require('node-cron');
const {get_database, post_database} = require('./config/db_utils')
const { update_7_days } = require('./Controllers/attendence/biometric'); 
const {update_biometrics} = require('./Controllers/attendence/biometric')
const {get_AttendanceCount} = require('./Controllers/attendence/attendence')

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
app.use("/attendance/api",routes);

const processAttendanceForAllStudents = async () => {
  try {
    const studentsQuery = 'SELECT id FROM students';
    const students = await get_database(studentsQuery);

    if (students.length === 0) {
      console.log("No students found.");
      return;
    }

    for (const student of students) {
      const studentId = student.id;
      await get_AttendanceCount(
        { query: { studentId } }, 
        { status: () => ({ json: () => {} }) }
      );
    }

    console.log("Attendance processing completed for all students.");
  } catch (error) {
    console.error("Error processing attendance for all students:", error);
  }
};


cron.schedule('8 0 * * 3', async () => {
    try {
        console.log('Executing update_7_days cron job...');
        await update_7_days();
    } catch (error) {
        console.error('Error during scheduled update_7_days:', error);
    }
});
cron.schedule('22 10 * * *', async () => {
  try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
  } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
  }
});

cron.schedule('28 12 * * *', async () => {
  try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
  } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
  }
});

cron.schedule('0 15 * * *', async () => {
  try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
  } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
  }
});cron.schedule('0 18 * * *', async () => {
  try {
      console.log('Executing update_biometrics cron job...');
      await update_biometrics();
      await processAttendanceForAllStudents();
  } catch (error) {
      console.error('Error during scheduled update_biometrics:', error);
  }
});
// listen port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
