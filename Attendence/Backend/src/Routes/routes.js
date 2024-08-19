const express = require('express')
const mentor = require('../Controllers/mentor/mentor')
const bio_attendence = require('../Controllers/attendence/biometric')
const attendence_details = require('../Controllers/attendence/attendence')
const student_details = require('../Controllers/student/student')
const uploadTime = require('../Controllers/arr_time_uploads/time_upload')
const arrear_attendence = require('../Controllers/attendence/arrear')
const slots = require('../Controllers/Slots/slot')
const leave = require('../Controllers/leave/leave')
const dates = require('../Controllers/holidays/holidays')
const semDates = require('../Controllers/sem_dates/semDates')
const percentage = require('../Controllers/Percentage/percentage')
const change = require('../Controllers/student/nip')
const nip_att = require('../Controllers/nip/attendence')
const map_role = require('../Controllers/mapStudent/mapStudent')
const attendance = require('../Controllers/attendence/attendace_count')
const role_student = require('../Controllers/mapStudent/mapAttendance')
const dashboard = require('../Controllers/Dashboard/dashboard')

const router = express.Router()

router.get("/mentor-students",mentor.get_students)
router.get("/students-no-att", mentor.update_students_no_att)
router.get("/students-arr",mentor.get_students_type_2)
router.get("/all-mentors", mentor.get_mentor)
router.get('/mentor-map', mentor.get_mentor_map)
router.post("/mentor-mapping",mentor.post_mentor_map)
router.get('/leave', mentor.get_leave)
router.put('/leave', mentor.update_leave)
router.put('/reject-leave', mentor.update_reject_leave)


//bio-att
router.put("/att-approve",bio_attendence.mentor_att_approve)
router.put("/att-disapprove",bio_attendence.mentor_no_att_approve)

//att_details
router.get('/att-details',attendence_details.get_attendence_n_arrear)
router.post('/attendance', attendence_details.get_AttendanceCount)

//stu_details
router.get('/student-details', student_details.get_student_details)
router.get('/all-students', student_details.get_all_students)
router.post('/leave', student_details.post_leave)

//time upload
router.post('/time-upload',uploadTime.add_attendance_records)

//arrear-attendence
router.get('/arr-attendence', arrear_attendence.get_arrear_att)
router.post('/arr-attendence', arrear_attendence.post_arrear_stu_att)
router.put('/arr-attendence',arrear_attendence.delete_arrear_stu_att)

//slots
router.get('/slots', slots.get_slots)
router.post('/slots', slots.post_slots)
router.put('/slots', slots.update_slots)

// leave
router.get('/leave', leave.get_leave_type)
router.get('/leave-student',leave.get_student_leave)

// holidays
router.get('/dates',dates.get_dates)
router.post('/dates',dates.post_dates)

//semDates
router.get('/sem-dates', semDates.get_sem_dates)
router.post('/sem-dates',semDates.post_sem_dates)

//percentage
router.get('/percent',percentage.get_attendance_details)

//chage type
router.get('/get-type1', change.get_type1)
router.get('/get-type2', change.get_type2)
router.put('/change-type2', change.post_changeStu_type2)
router.put('/change-type1', change.post_changeStu_type1)

//nip/re_appear att
router.get('/type2_attendence', nip_att.get_att_slots)

//mapStudent
router.get('/map-role',map_role.get_map_role)
router.post('/map-role', map_role.post_map_role)

//count
router.post('/att-count', attendance.checkAndInsertAttendance)

//role_student
router.get('/role-student', role_student.get_role_student)
router.post('/role-student', role_student.post_attendance)
router.put('/role-student', role_student.delete_role_stu_att)

//dashboard
router.get('/dashboard',dashboard.get_dashboard_details)

module.exports = router