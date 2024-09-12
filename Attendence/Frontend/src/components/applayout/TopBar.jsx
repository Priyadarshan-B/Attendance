import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import requestApi from "../utils/axios";
import Menu from "@mui/material/Menu";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Popup from "../popup/popup";
import CustomizedSwitches from './toggleTheme'
import "./styles.css";
import { getDecryptedCookie, removeEncryptedCookie } from "../utils/encrypt";

function TopBar({ scrollElement, sidebar, selectedSidebarItem }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const openMenu = Boolean(anchorEl);

  
  

  const name =  getDecryptedCookie("name");
  const profile =  getDecryptedCookie("profile");
  const gmail =  getDecryptedCookie("gmail");

  useEffect(() => {
    const scrollElementRef = scrollElement;

    if (!scrollElementRef) return;

    const handleScroll = () => {
      const scrollTop = scrollElementRef.scrollTop;
      setScrolled(scrollTop > 0);
    };

    scrollElementRef.addEventListener("scroll", handleScroll);

    return () => {
      scrollElementRef.removeEventListener("scroll", handleScroll);
    };
  }, [scrollElement]);

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
      await requestApi("POST", "/auth/logout");
      const cookiesToRemove = ["token", "name", "role", "id", "roll", "gmail", "profile", "allowedRoutes"];
          cookiesToRemove.forEach((key) => removeEncryptedCookie(key));
      navigate("/attendance/login");
    } catch (error) {
      console.error("Logout failed", error);
      navigate("/attendance/login");
    }
  };

  return (
    <div className={`app-topbar ${scrolled ? "scrolled" : ""}`}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div onClick={() => sidebar()} className="sidebar-menu">
        <MenuRoundedIcon sx={{ color: "var(--text)", cursor: "pointer" }} />
        </div> &nbsp;
        <div>
        {selectedSidebarItem && (
              <h3 className="selected-sidebar-item">{selectedSidebarItem}</h3>
            )}
      </div>
      </div>
    

      <div className="topbar-right-content">
        <CustomizedSwitches />
        <div className="user-info">
        <img src={profile} alt="User Profile" className="user-profile-pic" onClick={handleClick}/>

          <p className="user-name">{name}</p>
         
        </div>
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "var(--background-1)",
              border: "2px solid var(--border-color)",
              width: "250px",
              padding: "5px",
            },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Typography
              variant="p"
              sx={{
                color: "var(--text)",
                margin: "5px",
                marginTop: "0px",
                position: "absolute",
                top: "0px",
                backgroundColor: "var(--background-2)",
                width: "100%",
                padding: "10px 0px 50px 0px",
                display: "flex",
                justifyContent: "center",
                zIndex: "2",
                borderRadius: "3px",
                fontWeight: "var(--f-weight)",
              }}
            >
              {name}
            </Typography>
            {profile ? (
              <img
                src={profile}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  marginRight: "5px",
                  margin: "10px",
                  zIndex: "3",
                  marginTop: "30px",
                  backgroundColor: "white",
                }}
              />
            ) : (
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  backgroundColor: "#ccc",
                  borderRadius: "50%",
                  marginRight: "5px",
                }}
              />
            )}

            <Typography
              variant="body2"
              sx={{ color: "var(--text)", fontWeight: "var(--f-weight)" }}
            >
              {name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "var(--text)", marginBottom: "10px" }}
            >
              {gmail}
            </Typography>
          </Box>
          <button className="logout-button" onClick={handleLogoutClick}>
            LOGOUT
          </button>
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
