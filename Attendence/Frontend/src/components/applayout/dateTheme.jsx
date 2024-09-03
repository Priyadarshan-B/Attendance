import React, { useState, useEffect, createContext, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export const ThemeContext = createContext();

export const ThemeProviderComponent = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const preferredTheme = localStorage.getItem("preferredTheme");
        setDarkMode(preferredTheme === "dark");
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        const mode = newMode ? "dark" : "light";
        localStorage.setItem("preferredTheme", mode);
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#90caf9',
            },
            background: {
                paper: darkMode ? '#424242' : '#ffffff',
                default: darkMode ? '#303030' : '#f4f6fa',
            },
            text: {
                primary: darkMode ? '#ffffff' : '#011627',
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeToggle = () => useContext(ThemeContext);
