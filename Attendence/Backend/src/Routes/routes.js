const express = require('express')
const mentor = require('../Controllers/mentor/mentor')
const student = require('../Controllers/student/student')
const bio_attendence = require('../Controllers/attendence/biometric')
const attendence_details = require('../Controllers/attendence/attendence')
const student_details = require('../Controllers/student/student')
const uploadTime = require('../Controllers/arr_time_uploads/time_upload')
const arrear_attendence = require('../Controllers/attendence/arrear')
const slots = require('../Controllers/Slots/slot')
const session = require('../Controllers/Slots/session')
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
const roleMap = require('../Controllers/Roles/roles')
const placement = require('../Controllers/placement/placement')
const favorites = require ('../Controllers/mentor/favourite')
const mDash = require('../Controllers/mentor_dashboard/mdashboard')
const mdashboard = require('../Controllers/mentor_dashboard/mdashboard')
const report = require('../Controllers/Reports/absent')
const reportPresent = require('../Controllers/Reports/present')
const reportStudent = require('../Controllers/Reports/student')
const consolidate = require('../Controllers/Reports/consolidate')
const Log = require('../Controllers/attendance_log/logs')
const attProgress = require('../Controllers/attProgress/attProgress')
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
router.put('/mentor-map', mentor.delete_mentorMap)
router.get('/sub-mentor', mentor.get_sub_students)
router.get('/regular', mentor.get_type1_mentor)
router.get('/type2', mentor.get_type2_mentor)


//student
router.get('/student-year', student.get_all_students)
router.get('/student', student.get_student_details)


//bio-att
router.put("/att-approve",bio_attendence.mentor_att_approve)
router.put("/att-disapprove",bio_attendence.mentor_no_att_approve)
router.put('/nxt-wed', bio_attendence.update_next_wed)

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
router.get('/slot-year', slots.get_slotsYear)
router.post('/slots', slots.post_slots)
router.put('/slots', slots.update_slots)
router.get('/time-slots',slots.get_time_slots)
router.put('/time-slots', slots.delete_slots)
router.get('/session',session.get_session)


// leave
router.get('/leave-type', leave.get_leave_type)
router.get('/leave-student',leave.get_student_leave)

// holidays
router.get('/dates',dates.get_dates)
router.post('/dates',dates.post_dates)

//semDates
router.get('/sem-dates', semDates.get_sem_dates)
router.post('/sem-dates',semDates.post_sem_dates)
router.put('/sem-dates', semDates.update_dates)
router.put('/sem-date',semDates.delete_dates)
//percentage
router.get('/percent',percentage.get_attendance_details)

//chage type
router.get('/get-type1', change.get_type1)
router.get('/get-type2', change.get_type2)
router.put('/change-type2', change.post_changeStu_type2)
router.put('/change-type1', change.post_changeStu_type1)

//nip/re_appear att
router.get('/type2_attendence', nip_att.get_att_slots)
router.get('/role-attendance', nip_att.get_role_slots)

//mapStudent
router.get('/map-role-select',map_role.get_map_role)
router.post('/map-role', map_role.post_map_role)
router.get('/role-student',map_role.get_role_student_map)
router.put('/role-student', map_role.delete_Role_student_map)

//count
router.post('/att-count', attendance.checkAndInsertAttendance)

//role_student
router.get('/mapped-student', role_student.get_role_student)
router.post('/role-student', role_student.post_attendance)
// router.put('/role-student', role_student.delete_role_stu_att)//removed..

//dashboard
router.get('/dashboard',dashboard.get_dashboard_details)

// role amp
router.get('/role-map', roleMap.get_all_roles_map)

//placement
router.get('/placement', placement.get_placement)
router.get('/placementSub', placement.get_placement_subMentor)
router.get('/placement-student', placement.get_stu_placement)

//favourites
router.get('/favourites', favorites.get_favorites)
router.post('/favourites', favorites.post_favourites)

// mentor dashbord
router.get('/mdash', mDash.get_mdashboard)
router.get('/mdashboard', mdashboard.dashboard)

// report
router.get('/ab-report', report.get_absent_reports)
router.get('/abs-report', report.get_absent_slot)
router.get('/pre-report', reportPresent.get_present_reports)
router.get('/pres-report',reportPresent.get_present_slot)
router.get('/student-report', reportStudent.get_student_report)
router.get('/consolidate', consolidate.get_attendance_status)
// logs
router.get('/logs', Log.get_att_logs)

// att progress
router.get('/att-progress', attProgress.get_att_progress)

module.exports = router