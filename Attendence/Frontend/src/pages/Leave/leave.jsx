import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField, Button } from "@mui/material";
import Select from "react-select";
import Cookies from "js-cookie";
import requestApi from "../../components/utils/axios";
import { format } from 'date-fns';
import './leave.css';

function Leave() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AppLayout rId={6} body={<Body />} />
        </LocalizationProvider>
    );
}

function Body() {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [fromTime, setFromTime] = useState(null);
    const [toTime, setToTime] = useState(null);
    const id = Cookies.get('id');
    const navigate = useNavigate()

    useEffect(() => {
        requestApi("GET", '/leave').then(response => setLeaveTypes(response.data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            student :parseInt(id),
            leave: selectedLeaveType ? selectedLeaveType.value : null,
            from_date: fromDate ? format(fromDate, 'dd/MM/yyyy') : null,
            from_time: fromTime ? format(fromTime, 'HH:mm') : null,
            to_date: toDate ? format(toDate, 'dd/MM/yyyy') : null,
            to_time: toTime ? format(toTime, 'HH:mm') : null
        };
        console.log(data);

        requestApi("POST", `/leave?student=${id}`, data)
            .then(response => {
                console.log("Leave applied successfully:", response.data);
                navigate('/dashboard')
            })
            .catch(error => {
                console.error("Error applying leave:", error);
            });
    };

    return (
        <div>
            <div><h3>Apply Leave</h3></div>
            <form onSubmit={handleSubmit} className="form-container">
                <div style={{
                    zIndex:'1000'
                }}>
                    <Select
                        options={leaveTypes.map(leave => ({ value: leave.id, label: leave.type }))}
                        value={selectedLeaveType}
                        onChange={setSelectedLeaveType}
                        placeholder="Select Leave Type"
                    />
                </div>
                <div>
                    <DatePicker
                        label="From Date"
                        value={fromDate}
                        onChange={(newValue) => setFromDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        inputFormat="dd/MM/yyyy"
                    />
                </div>
                <div>
                    <TimePicker
                        label="From Time"
                        value={fromTime}
                        onChange={(newValue) => setFromTime(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </div>
                <div>
                    <DatePicker
                        label="To Date"
                        value={toDate}
                        onChange={(newValue) => setToDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                        inputFormat="dd/MM/yyyy"
                    />
                </div>
                <div>
                    <TimePicker
                        label="To Time"
                        value={toTime}
                        onChange={(newValue) => setToTime(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </div>
                <Button type="submit" variant="contained" color="primary">Submit</Button>
            </form>
        </div>
    );
}

export default Leave;
