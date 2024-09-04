import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HikingRoundedIcon from "@mui/icons-material/HikingRounded";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";
import AdminPanelSettingsSharpIcon from "@mui/icons-material/AdminPanelSettingsSharp";
import ReceiptLongSharpIcon from "@mui/icons-material/ReceiptLongSharp";
import WorkOffIcon from "@mui/icons-material/WorkOff";
import SchoolIcon from "@mui/icons-material/School";
import AddTaskIcon from '@mui/icons-material/AddTask';
import SummarizeTwoToneIcon from '@mui/icons-material/SummarizeTwoTone';
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../utils/axios";
import "./styles.css";

function getIconComponent(iconPath) {
  switch (iconPath) {
    case 'DashboardRoundedIcon':
      return <DashboardRoundedIcon style={{ color: '#f57d93' }} className="custom-sidebar-icon" />;
    case 'HikingRoundedIcon':
      return <HikingRoundedIcon style={{ color: '#3498db' }} className="custom-sidebar-icon" />;
    case 'CalendarMonthIcon':
      return <CalendarMonthIcon style={{ color: '#2eb7a2' }} className="custom-sidebar-icon" />;
    case 'DateRangeIcon':
      return <DateRangeIcon style={{ color: '#f39c12' }} className="custom-sidebar-icon" />;
    case 'ScheduleSendIcon':
      return <ScheduleSendIcon style={{ color: '#9b59b6' }} className="custom-sidebar-icon" />;
    case 'AdminPanelSettingsSharpIcon':
      return <AdminPanelSettingsSharpIcon style={{ color: '#1abc9c' }} className="custom-sidebar-icon" />;
    case 'ReceiptLongSharpIcon':
      return <ReceiptLongSharpIcon style={{ color: '#4fb33e' }} className="custom-sidebar-icon" />;
    case 'WorkOffIcon':
      return <WorkOffIcon style={{ color: '#95a5a6' }} className="custom-sidebar-icon" />;
    case 'SchoolIcon':
      return <SchoolIcon style={{ color: '#d158ff' }} className="custom-sidebar-icon" />;
    case 'AddTaskIcon':
      return <AddTaskIcon style={{ color: '#00a8fb' }} className="custom-sidebar-icon" />;
    case 'SummarizeTwoToneIcon':
      return <SummarizeTwoToneIcon style={{ color: '#00a8fb' }} className="custom-sidebar-icon" />;
    default:
      return null;
  }
}

function SideBar({ open, resource }) {
  const [activeItem, setActiveItem] = useState("");
  const [sidebarItems, setSidebarItems] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchSidebarItems = async () => {
      try {
        const encryptedGmail = Cookies.get("role");
        const bytes = CryptoJS.AES.decrypt(encryptedGmail, "secretKey123");
        const decryptedGmail = bytes.toString(CryptoJS.enc.Utf8);

        const response = await requestApi(
          "GET",
          `/auth/resources?role=${decryptedGmail}`
        );
        if (response.success) {
          setSidebarItems(response.data);
        } else {
          console.error("Error fetching sidebar items:", response.error);
        }
      } catch (error) {
        console.error("Error fetching sidebar items:", error);
      }
    };

    fetchSidebarItems();
  }, [resource]);

  useEffect(() => {
    const pathname = location.pathname;
    const activeItem = sidebarItems.find((item) => item.path === pathname);
    if (activeItem) {
      setActiveItem(activeItem.name);
    }
  }, [location, sidebarItems]);

  return (
    <div
      className={open ? "app-sidebar sidebar-open" : "app-sidebar"}
      style={{
        backgroundColor: "#2a3645",
        borderRight: "1px solid #f2f2f2",
      }}
    >
      <p style={{ color: 'white' }} className="app-name">ATTENDANCE</p>
      <ul className="list-div">
        {sidebarItems.map((item) => (
          <li
            key={item.path}
            className={`list-items ${activeItem === item.name ? "active" : ""}`}
            onClick={() => setActiveItem(item.name)}
          >
            <Link className="link" to={item.path}>
              {getIconComponent(item.icon_path)}
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
