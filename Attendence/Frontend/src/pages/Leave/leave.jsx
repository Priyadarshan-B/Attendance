import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { TextField } from "@mui/material";
import Button from "../../components/Button/Button";
import Select from "react-select";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../../components/utils/axios";
import { format } from 'date-fns';
import toast from "react-hot-toast";
import './leave.css';

function Leave() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AppLayout body={<Body />} />
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
    const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8)
    const navigate = useNavigate()

    useEffect(() => {
        requestApi("GET", '/leave-type').then(response => setLeaveTypes(response.data));
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
                toast.success(`${selectedLeaveType?.label} Applied successfully!`);

                navigate('/attendance/dashboard')
            })
            .catch(error => {
                console.error("Error applying leave:", error);
                toast.error(`${selectedLeaveType?.label} Failed to Apply`);
            });
    };

    return (
        <div >
            <div><h3>Apply OD</h3></div>
            <div className="leave-form">
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
                    {/* <button type="submit">Submit</button> */}
                    <Button 
                    type="submit"
                    label="Submit"
                    />
                </form>
            </div>
        </div>
    );
}

export default Leave;
