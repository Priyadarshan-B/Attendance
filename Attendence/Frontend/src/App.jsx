import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import requestApi from "./components/utils/axios";
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
import Error from "./pages/error";
import CryptoJS from "crypto-js";
import { Toaster } from "react-hot-toast";


const decryptData = (encryptedData, secretKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const secretKey = "secretKey123"; 
  const encryptedToken = Cookies.get("token");
  const encryptedRole = Cookies.get("role");
  const encryptedGmail = Cookies.get('gmail');

  const token = decryptData(encryptedToken, secretKey);
  const roleId = decryptData(encryptedRole, secretKey);
  const gmail = decryptData(encryptedGmail, secretKey)

  useEffect(() => {
    if (!token || !roleId) {
      setLoading(false);
      return;
    }

    const fetchAllowedRoutes = async () => {
      try {
        const response = await requestApi("GET", `/auth/resources?role=${roleId}`);
        
        console.log("Allowed Routes Response:", response.data);

        const routes = response.data.map((route) => route.path);
        setAllowedRoutes(routes);

        console.log("Allowed Routes After State Update:", routes);
      } catch (error) {
        console.error("Failed to fetch allowed routes", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchAllowedRoutes();
  }, [roleId, token]);

  // console.log("Allowed Routes:", allowedRoutes);

  if (loading) return <div>Loading...</div>;

  if (location.pathname === "/attendance/welcome") {
    return children;
  }

  if (!token || !roleId) {
    return <Navigate to="/attendance/login" />;
  }

  console.log("Current Location:", location.pathname);

  if (allowedRoutes.length > 0 && allowedRoutes.includes(location.pathname)) {
    return children;
  }

  return <Navigate to="/attendance/error" />;
};

function App() {
  return (
    
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>

        <Route path="*" element={<Error />} />
        <Route path="/attendance" element={<Login />} />
        <Route path="/attendance/login" element={<Login />} />
        <Route
          path="/attendance/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
