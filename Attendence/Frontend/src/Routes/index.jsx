import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/utils/protectedRoute";
import AppLayout from "../components/applayout/AppLayout";
import Attendence from "../pages/Attendance/attendance";
import RoleAttendance from "../pages/Attendance/roleAttendance";
import AdminDashboard from "../pages/Admin_Dashboard/admin_dashboard";
import Mdashboard from "../pages/mDashbord/mdashboard";
import Placement from "../pages/Placement/placement";
import Student from "../pages/Students/student";
import Approvals from "../pages/Approvals/approval";
import Dashboard from "../pages/Forms/dashboard";
import StuDashboard from "../pages/Stu_Dashboard/stu_dashboard";
import MentorMapping from "../pages/Forms/mentor/mentor";
import Holidays from "../pages/Holidays/holidays";
import SemDates from "../pages/Forms/semDates/sem_dates";
import LeaveDetails from "../pages/Approvals/leave_approval";
import Nip from "../pages/Forms/nip/nip";
import MapStudent from "../pages/Forms/mapStudent/mapStudent";
import Leave from "../pages/Leave/leave";
import MStudent from "../pages/mDashbord/m_students";
import Report from "../pages/Reports/report";
import Login from "../pages/auth/Login/Login";
import Error from "../pages/error";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/attendance/error" element={<Error />} />
      <Route path="/attendance" element={<Login />} />
      <Route path="/attendance/login" element={<Login />} />
      <Route
        path="/attendance/*"
        element={
          <ProtectedRoute>
            <AppLayout
              body={
                <Routes>
                  <Route path="attendance" element={<Attendence />} />
                  <Route path="role_attendance" element={<RoleAttendance />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="mdashboard" element={<Mdashboard />} />
                  <Route path="placement" element={<Placement />} />
                  <Route path="student" element={<Student />} />
                  <Route path="approval" element={<Approvals />} />
                  <Route path="add" element={<Dashboard />} />
                  <Route path="dashboard" element={<StuDashboard />} />
                  <Route path="mentor_map" element={<MentorMapping />} />
                  <Route path="holidays" element={<Holidays />} />
                  <Route path="sem-dates" element={<SemDates />} />
                  <Route path="leave_approval" element={<LeaveDetails />} />
                  <Route path="change-type" element={<Nip />} />
                  <Route path="map-student" element={<MapStudent />} />
                  <Route path="leave" element={<Leave />} />
                  <Route path="mstudent" element={<MStudent />} />
                  <Route path="report" element={<Report />} />
                </Routes>
              }
            />
             </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
