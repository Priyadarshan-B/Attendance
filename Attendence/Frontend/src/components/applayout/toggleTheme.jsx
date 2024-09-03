import React, { useEffect } from "react";
import IconButton from '@mui/material/IconButton';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { useThemeToggle } from "../../components/applayout/dateTheme"; // Ensure the path is correct

const lightModeProperties = {
    "--background-1": "#f4f6fa",
    "--background-2": "#ffffff",
    "--text": "#011627",
    "--table-hover": "#f4f6fa",
    "--l-app": "#e6fff2",
    "--border": "1px solid #5775e441",
    "--button-hover": "#9fa4a8",
    "--datepicker": "#ffffff",
    "--date": "light",
};

const darkModeProperties = {
    "--background-1": "#1e2631",
    "--background-2": "#2a3645",
    "--text": "#ffffff",
    "--table-hover": "#1e2631",
    "--l-app": "#19623c",
    "--border": "1px solid #5775e441",
    "--button-hover": "#2a3645",
    "--datepicker": "#78818e",
    "--date": "dark",
};

const setCustomProperties = (mode) => {
    const root = document.documentElement;
    const properties = mode === "dark" ? darkModeProperties : lightModeProperties;
    Object.entries(properties).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
};

export default function CustomizedSwitches() {
    const { darkMode, toggleDarkMode } = useThemeToggle(); // Use the theme toggle from the context

    useEffect(() => {
        const preferredTheme = localStorage.getItem("preferredTheme") || "light";
        setCustomProperties(preferredTheme);
    }, []);

    const handleToggle = () => {
        toggleDarkMode(); 
        const newMode = darkMode ? "light" : "dark";
        setCustomProperties(newMode);
        localStorage.setItem("preferredTheme", newMode);
    };

    return (
        <IconButton sx={{ ml: 1 }} onClick={handleToggle} color="inherit">
            {darkMode ? <WbSunnyIcon sx={{ color: "#6c7293" }} /> : <NightsStayIcon sx={{ color: "#6c7293" }} />}
        </IconButton>
    );
}
