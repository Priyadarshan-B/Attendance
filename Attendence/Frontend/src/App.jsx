import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate,useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Login from "./pages/auth/Login/Login";
import Welcome from "./pages/welcome/welcome";
import Attendence from "./pages/Attendance/attendance";
import RoleAttendance from "./pages/Attendance/roleAttendance";
import Approvals from "./pages/Approvals/approval";
import StuDashboard from "./pages/Stu_Dashboard/stu_dashboard";
import TimeUpload from "./pages/Time_Upload/time_upload";
import Dashboard from "./pages/Forms/dashboard";
import Leave from "./pages/Leave/leave";
import MentorMapping from "./pages/Forms/mentor/mentor";
import Holidays from "./pages/Holidays/holidays";
import SemDates from "./pages/Forms/semDates/sem_dates";
import Nip from "./pages/Forms/nip/nip";
import MapStudent from "./pages/Forms/mapStudent/mapStudent";
import Student from "./pages/Students/student";
import AdminDashboard from "./pages/Admin_Dashboard/admin_dashboard";
import LeaveDetails from "./pages/Approvals/leave_approval";
import Placement from "./pages/Placement/placement";
import CryptoJS from "crypto-js";
import Mdashboard from "./pages/mDashbord/mdashboard";
import MStudent from "./pages/mDashbord/m_students";
import AbReport from "./pages/Reports/report";
import Error from "./pages/error";
import { Toaster } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const secretKey = "secretKey123";
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const detoken = Cookies.get("token");
      if (detoken) {
        try {
          const token = CryptoJS.AES.decrypt(detoken, secretKey).toString(CryptoJS.enc.Utf8);
          if (token) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Token decryption error:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [secretKey]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/attendance/login'); 
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return isAuthenticated ? children : null;
};


function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="*" element={<Error />} />
        <Route path="/attendance" element={<Login />} />
        <Route path="/attendance/login" element={<Login />} />
        <Route path="/attendance/welcome" element={<Welcome />} />
        <Route
          path="/attendance/attendance"
          element={
            <ProtectedRoute>
              <Attendence />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/role_attendance"
          element={
            <ProtectedRoute>
              <RoleAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/mdashboard"
          element={
            <ProtectedRoute>
              <Mdashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/placement"
          element={
            <ProtectedRoute>
              <Placement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/student"
          element={
            <ProtectedRoute>
              <Student />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/approval"
          element={
            <ProtectedRoute>
              <Approvals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/add"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/dashboard"
          element={
            <ProtectedRoute>
              <StuDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/timetable"
          element={
            <ProtectedRoute>
              <TimeUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/mentor_map"
          element={
            <ProtectedRoute>
              <MentorMapping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/holidays"
          element={
            <ProtectedRoute>
              <Holidays />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/sem-dates"
          element={
            <ProtectedRoute>
              <SemDates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/leave_approval"
          element={
            <ProtectedRoute>
              <LeaveDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/change-type"
          element={
            <ProtectedRoute>
              <Nip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/map-student"
          element={
            <ProtectedRoute>
              <MapStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/leave"
          element={
            <ProtectedRoute>
              <Leave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/mstudent"
          element={
            <ProtectedRoute>
              <MStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/report"
          element={
            <ProtectedRoute>
              <AbReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
