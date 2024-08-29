import React, { useState } from "react";
import requestApi from "../../../components/utils/axios";
import Button from "../../../components/Button/Button";
import './timeSlots.css';

const TimeSlotForm = ({ onClose }) => {
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestApi("POST", "/slots", { label, start_time: startTime, end_time: endTime });
      console.log("Posted Successfully")
      setLabel("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error saving time slot:", error);
    }
  };

  return (
    <div className="time-slot-form-container">
      <form onSubmit={handleSubmit} className="time-form">
        <h2>Add Time Slot</h2>
        <div className="form-group">
          <label htmlFor="label">Label</label>
          <input
            id="label"
            type="text"
            value={label}
            placeholder="Eg.8.45AM - 9.45AM"
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
            placeholder="Eg.8.45AM"
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="end_time">End Time</label>
          <input
            id="end_time"
            type="text"
            placeholder="Eg.9.45AM"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
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
