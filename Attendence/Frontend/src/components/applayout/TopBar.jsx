import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import { useNavigate } from "react-router-dom";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../utils/axios";
import Popup from "../popup/popup";
import './styles.css'; // New CSS file for dynamic styles

function TopBar(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate()
  
  const name = Cookies.get('name');
  const secretKey = "secretKey123";
  const dename = CryptoJS.AES.decrypt(name, secretKey).toString(CryptoJS.enc.Utf8);

  useEffect(() => {
    const scrollElement = props.scrollElement;

    if (!scrollElement) return; 

    const handleScroll = () => {
      const scrollTop = scrollElement.scrollTop;
      setScrolled(scrollTop > 0); 
    };

    scrollElement.addEventListener("scroll", handleScroll);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [props.scrollElement]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const logout = async () => {
    try {
      await requestApi("POST", `/auth/logout`);
      Cookies.remove("token");
      Cookies.remove("name");
      Cookies.remove("role");
      Cookies.remove("id");
      Cookies.remove("gmail");
      Cookies.remove("roll");
      Cookies.remove('allowedRoutes');
      
      navigate('/attendance/login'); // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
      navigate('/attendance/login'); // Redirect to login page on error
    }
  };
  return (
    <div className={`app-topbar ${scrolled ? "scrolled" : ""}`}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div onClick={props.sidebar} className="sidebar-menu">
          <MenuRoundedIcon sx={{ color: "#472d2d", cursor: "pointer" }} />
        </div>
      </div>
      <div className="topbar-right-content">
        <div>
          <p className="user-name">{dename}</p>
        </div>
        <div onClick={handleOpenModal}>
          <LogoutIcon sx={{ color: "#1c0c6a", cursor: "pointer" }} />
        </div>
      </div>
      <Popup
        open={modalOpen}
        onClose={handleCloseModal}
        title="Logout"
        text="Are You Sure want to logout!"
        onConfirm={logout}      
     />
    </div>
  );
}

export default TopBar;
