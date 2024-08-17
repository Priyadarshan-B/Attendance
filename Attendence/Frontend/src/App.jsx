// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import requestApi from "./components/utils/axios";
import Login from "./pages/auth/Login/Login";
import Welcome from "./pages/welcome/welcome";
import Attendence from "./pages/Attendence/attendence";
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
import Error from "./pages/error";

const ProtectedRoute = ({ children }) => {
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const token = Cookies.get("token");
  const roleId = Cookies.get("role");

  useEffect(() => {
    const fetchAllowedRoutes = async () => {
      try {
        {
          const response = await requestApi("GET", `/auth/resources?role=${roleId}`);
          const routes = response.data.map((route) => route.path);
          setAllowedRoutes(routes);
        }
      } catch (error) {
        console.error("Failed to fetch allowed routes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllowedRoutes();
  }, [roleId, token]);

  if (loading) return <div>Loading...</div>;
if (location.pathname === "/welcome"){
  return children
}

  if ( token &&  allowedRoutes.includes(location.pathname)) {
    return children;
  }

  return <Navigate to="/attendace/error" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Error />} />
        <Route path="/attendance" element={<Login />} />
        <Route path="/attendance/login" element={<Login />} />
        <Route
          path="attendance/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/attendence"
          element={
            <ProtectedRoute>
              <Attendence />
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
