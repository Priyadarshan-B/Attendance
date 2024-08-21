import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Button from "../Button/Button";
import LogoutIcon from '@mui/icons-material/Logout';
import QueryStatsTwoToneIcon from '@mui/icons-material/QueryStatsTwoTone';
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../utils/axios";


function TopBar(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const name = Cookies.get('name');
  const secretKey = "secretKey123";
  const dename= CryptoJS.AES.decrypt(name, secretKey).toString(CryptoJS.enc.Utf8)
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const logout = async () => {
    try {
      await requestApi("POST",`/auth/logout`);
      
      Cookies.remove("token");
      console.log(Cookies.get('token'));
      window.location.href = "/attendance/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div
      className="app-topbar"
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        padding: "10px 10px",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        borderBottom:"1px solid #f2f2f2"
      }}
    >
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
        <div className="app-name">ATTENDANCE</div>
      </div>
      <div className="topbar-right-content">
        <div>
          <p className="user-name">{dename}</p>
        </div>
        <div onClick={handleOpenModal}>
          <LogoutIcon sx={{ color: "#1c0c6a", cursor: "pointer" }} />
        </div>
      </div>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="model"
        sx={{border:"none"}}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "5px",
            width: "30%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color:"#493d88",
            border:"none",
            minWidth:"350px"
          }}
        >
          <h3 id="modal-modal-description">
            Are you sure you want to logout?
          </h3>
          <div className="logout-buttons">
            <Button onClick={handleCloseModal} label="CANCEL" />
            <Button
              onClick={logout}
              label="LOGOUT"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TopBar;
