import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import { useNavigate } from "react-router-dom";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../utils/axios";
import Popup from "../popup/popup";
import './styles.css'; 
import CustomizedSwitches from "./toggleTheme";
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Typography, Avatar, Box } from '@mui/material';

function TopBar(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate()
  const openMenu = Boolean(anchorEl);
  
  const name = Cookies.get('name');
  const deprofile = Cookies.get('profile')
  const secretKey = "secretKey123";
  const dename = CryptoJS.AES.decrypt(name, secretKey).toString(CryptoJS.enc.Utf8);
  const profile = CryptoJS.AES.decrypt(deprofile, secretKey).toString(CryptoJS.enc.Utf8)
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


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
};

const handleCloseMenu = () => {
  setAnchorEl(null);
};


  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleLogoutClick = () => {
    handleOpenModal();
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
      
      navigate('/attendance/login');
    } catch (error) {
      console.error("Logout failed", error);
      navigate('/attendance/login'); 
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
      <CustomizedSwitches/>
      <div className="user-info">
          <img 
            src={profile} 
            alt="User Profile" 
            className="user-profile-pic"
          />
          <p className="user-name">{dename}</p>
        </div>
        <div onClick={handleClick}>
          <LogoutIcon sx={{ color: "var(--text)", cursor: "pointer" }} />
        </div>
        <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleCloseMenu}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        sx={{
                            "& .MuiPaper-root": {
                                backgroundColor: "var(--background-1)", // Background color for the menu
                                border: "2px solid var(--border-color)", // Border color
                                width: "250px", // Adjusted width
                                padding: "5px", // Padding inside the menu
                            }
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                            <Typography variant="p" sx={{ color: "var(--text)", margin: "5px",marginTop:"0px", position:"absolute", top:"0px", backgroundColor:"var(--background-2)", width:"100%", padding:"10px 0px 50px 0px", display:"flex", justifyContent:"center", zIndex:"2", borderRadius:"3px", fontWeight:"var(--f-weight)" }}>
                                {dename}
                            </Typography>
                            {profile ? (
                                <img
                                    src={profile}
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                        marginRight: "5px",
                                        margin:"10px",
                                        zIndex:"3",
                                        marginTop:"30px",
                                        backgroundColor:"white"
                                    }}
                                />
                            ) : (
                                <div style={{ width: "35px", height: "35px", backgroundColor: "#ccc", borderRadius: "50%", marginRight: "5px" }} />
                            )}

                            <Typography variant="body2" sx={{ color: "var(--text)", fontWeight:"var(--f-weight)" }}>
                                {dename}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "var(--text)", marginBottom:"10px" }}>
                                gmail
                            </Typography>
                        </Box>
                        <button className="logout-button" onClick={handleLogoutClick}>LOGOUT</button>
                    </Menu>
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
