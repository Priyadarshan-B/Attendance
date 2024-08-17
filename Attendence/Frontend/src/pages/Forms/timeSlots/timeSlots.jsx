import React, { useState } from "react";
import requestApi from "../../../components/utils/axios";
import '../style.css';

const TimeSlotForm = ({ onClose }) => {
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("1");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestApi("POST", "/slots", { label, start_time: startTime, end_time: endTime, status });
      alert("Time slot added successfully!");
    
    } catch (error) {
      console.error("Error saving time slot:", error);
    }
  };

  return (
    <div className="time-slot-form-container">
      <form onSubmit={handleSubmit}>
        <h2>Add Time Slot</h2>
        <div className="form-group">
          <label htmlFor="label">Label</label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="start_time">Start Time</label>
          <input
            id="start_time"
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="end_time">End Time</label>
          <input
            id="end_time"
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
    
        <button type="submit" className="submit-button">
          Add Time Slot
        </button>
      </form>
    </div>
  );
};

export default TimeSlotForm;
