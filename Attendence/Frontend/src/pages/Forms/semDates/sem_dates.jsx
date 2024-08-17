import React, { useState } from "react";
import AppLayout from "../../../components/applayout/AppLayout";
import '../../../components/applayout/styles.css';
import requestApi from "../../../components/utils/axios";
import {  TextField, MenuItem } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import Buttons from "../../../components/Button/Button";
import './sem_dates.css';

function SemDates() {
    return <Body/>
}

function Body() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [year, setYear] = useState("");

    const years = [
        { value: "I", label: "I" },
        { value: "II", label: "II" },
        { value: "III", label: "III" },
        { value: "IV", label: "IV" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedStartDate = startDate ? format(startDate, 'dd-MM-yyyy') : null;
        const formattedEndDate = endDate ? format(endDate, 'dd-MM-yyyy') : null;

        console.log("Data to be sent:", {
            from_date: formattedStartDate,
            to_date: formattedEndDate,
            year: year,
        });

        try {
            const response = await requestApi("POST", "/sem-dates", {
                from_date: formattedStartDate,
                to_date: formattedEndDate,
                year: year,
            });
            console.log("Semester dates saved successfully:", response.data);
        } catch (error) {
            console.error("Error saving semester dates:", error);
        }
    };

    return (
        <div>
            <h3>Semester End Dates</h3>
<br />
            <div className="sem-dates-container">
                <form onSubmit={handleSubmit} className="sem-dates-form">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TextField
                            select
                            label="Year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="sem-select"
                        >
                            {years.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <Buttons type="submit" 
                            label="Submit" 
                    />
                </form>
            </div>
        </div>
    );
}

export default SemDates;
