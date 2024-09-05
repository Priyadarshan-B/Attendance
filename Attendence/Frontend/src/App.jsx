import React, { useEffect, useState } from "react";
import AppLayout from "./components/applayout/AppLayout";
import './components/applayout/styles.css'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import Loader from "./components/Loader/loader";
import { ThemeProviderComponent } from "./components/applayout/dateTheme";
import { Toaster } from "react-hot-toast";

const ProtectedRoute = ({ children }) => {
  const secretKey = "secretKey123";
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const detoken = Cookies.get("token");
      const allowedRoutes = Cookies.get("allowedRoutes");

      if (detoken && allowedRoutes) {
        try {
          const token = CryptoJS.AES.decrypt(detoken, secretKey).toString(CryptoJS.enc.Utf8);
          const routes = JSON.parse(CryptoJS.AES.decrypt(allowedRoutes, secretKey).toString(CryptoJS.enc.Utf8));
          const currentPath = window.location.pathname;

          if (token && routes.includes(currentPath)) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Token or route decryption error:', error);
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
      navigate('/attendance/error'); 
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <Loader/>; 
  }

  return isAuthenticated ? children : null;
};


function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a delay for loading the app
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Example delay of 2 seconds

    return () => clearTimeout(timer); 
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ThemeProviderComponent>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/attendance/error" element={<Error />} />
          <Route path="/attendance" element={<Login />} />
          <Route path="/attendance/login" element={<Login />} />
          <Route path="/attendance/welcome" element={<Welcome />} />
          <Route
            path="/attendance/*"
            element={
              <ProtectedRoute>
                <AppLayout body={<Routes>
                  <Route path="attendance" element={<Attendence />} />
                  <Route path="role_attendance" element={<RoleAttendance />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="mdashboard" element={<Mdashboard />} />
                  <Route path="placement" element={<Placement />} />
                  <Route path="student" element={<Student />} />
                  <Route path="approval" element={<Approvals />} />
                  <Route path="add" element={<Dashboard />} />
                  <Route path="dashboard" element={<StuDashboard />} />
                  <Route path="timetable" element={<TimeUpload />} />
                  <Route path="mentor_map" element={<MentorMapping />} />
                  <Route path="holidays" element={<Holidays />} />
                  <Route path="sem-dates" element={<SemDates />} />
                  <Route path="leave_approval" element={<LeaveDetails />} />
                  <Route path="change-type" element={<Nip />} />
                  <Route path="map-student" element={<MapStudent />} />
                  <Route path="leave" element={<Leave />} />
                  <Route path="mstudent" element={<MStudent />} />
                  <Route path="report" element={<AbReport />} />
                </Routes>} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProviderComponent>
  );
}

export default App;
