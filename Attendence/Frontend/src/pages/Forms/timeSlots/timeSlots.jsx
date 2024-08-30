import React, { useState } from "react";
import requestApi from "../../../components/utils/axios";
import Button from "../../../components/Button/Button";
import TextField from '@mui/material/TextField';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import format from 'date-fns/format';
import Select from 'react-select';
import './timeSlots.css';

const TimeSlotForm = ({ onClose }) => {
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
    // { value: "All", label: "All" }

];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format the time to hh:mm:ss
    const formattedStartTime = startTime ? format(startTime, 'HH:mm:ss') : '';
    const formattedEndTime = endTime ? format(endTime, 'HH:mm:ss') : '';

    try {
      await requestApi("POST", "/slots", { label, start_time: formattedStartTime, end_time: formattedEndTime });
      console.log("Posted Successfully");
      setLabel("");
      setStartTime(null);
      setEndTime(null);
    } catch (error) {
      console.error("Error saving time slot:", error);
    }
  };

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption);
};
  return (
    <div className="time-slot-form-container">
      <form onSubmit={handleSubmit} className="time-form">
        <h2>Add Time Slot</h2>
        <div className="time-flex">
        <div className="react-select">
          <Select
                              options={yearOptions}
                              value={selectedYear}
                              onChange={handleYearChange}
                              placeholder="Select Year"
                              className="year-dropdown"
                              isClearable
                          />
        </div>
        {/* <label htmlFor="label">Label</label> */}
          <div className="form-group">
            <input
              id="label"
              type="text"
              value={label}
              placeholder="Eg.8.45AM - 9.45AM"
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>
          <div >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Start Time"
                    sx={{ width: "100%" }}
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </div>
          <div >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="End Time"
                sx={{ width: "100%" }}
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </div>
        </div>

        <Button
        type="submit"
        label="Add Time Slots"
        />
      </form>
    </div>
  );
};

export default TimeSlotForm;
