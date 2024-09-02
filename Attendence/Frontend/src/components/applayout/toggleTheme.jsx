import React, { useState, useEffect } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import IconButton from '@mui/material/IconButton';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
// Define the theme 
const theme = createTheme({
    palette: {
        mode: "light", // Initially set to light mode
    },
});

const lightModeProperties = {
   "--background-1":"#f4f6fa",
   "--background-2":"#ffffff",
   "--text":"#011627",
   "--text":"#011627"

};

const darkModeProperties = {
   "--background-1":"#4b5159",
   "--background-2":"#2a3645",
   "--text":"#ffffff"
};

// Set custom properties based on theme mode
const setCustomProperties = (mode) => {
    const root = document.documentElement;
    root.style.cssText = Object.entries(
        mode === "dark" ? darkModeProperties : lightModeProperties
    )
        .map(([key, value]) => `${key}:${value};    `)
        .join("");
};

// Styled switch

export default function CustomizedSwitches() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check if the user has a preference for theme stored in local storage
        const preferredTheme = localStorage.getItem("preferredTheme");
        if (preferredTheme) {
            setDarkMode(preferredTheme === "dark");
            setCustomProperties(preferredTheme);
        }
        // If not, set initial mode to light and update custom properties
        else {
            setCustomProperties("light");
        }
    }, []); // Run only on initial render

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        const mode = newMode ? "dark" : "light";
        setCustomProperties(mode); // Update custom properties based on theme mode
        localStorage.setItem("preferredTheme", mode); // Store user preference for theme
    };

    return (
        <ThemeProvider theme={theme}>
            <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode} color="inherit">
                {darkMode ? <WbSunnyIcon sx={{ color: "#6c7293" }} /> : <NightsStayIcon sx={{ color: "#6c7293" }} />}
            </IconButton>
        </ThemeProvider>
    );
}