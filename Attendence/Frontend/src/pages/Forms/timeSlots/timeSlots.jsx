import React, { useState, useEffect } from "react";
import requestApi from "../../../components/utils/axios";
import Button from "../../../components/Button/Button";
import TextField from "@mui/material/TextField";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import format from "date-fns/format";
import Select from "react-select";
import customStyles from "../../../components/applayout/selectTheme";
import InputBox from "../../../components/TextBox/textbox";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
} from "@mui/material";
import "./timeSlots.css";

const TimeSlotForm = ({ onClose }) => {
  const [label, setLabel] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await requestApi("GET", "/time-slots");
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedStartTime = startTime ? format(startTime, "HH:mm:ss") : "";
    const formattedEndTime = endTime ? format(endTime, "HH:mm:ss") : "";

    try {
      await requestApi("POST", "/slots", {
        year:selectedYear.value,
        label,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      });
      console.log("Posted Successfully");
      setLabel("");
      setStartTime(null);
      setEndTime(null);
      const response = await requestApi("GET", "/time-slots");
      setTimeSlots(response.data);
    } catch (error) {
      console.error("Error saving time slot:", error);
    }
  };

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (slotId) => {
    try {
      await requestApi("PUT", `/time-slots?id=${slotId}`);
      // Update the timeSlots state after deletion
      setTimeSlots(timeSlots.filter((slot) => slot.id !== slotId));
    } catch (error) {
      console.error("Error deleting time slot:", error);
    }
  };

  const filteredTimeSlots = timeSlots.filter(
    (slot) =>
      slot.label.toLowerCase().includes(search.toLowerCase()) ||
      slot.year.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="time-slots">
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
                styles={customStyles}
                isClearable
              />
            </div>
            <div className="form-group">
              <InputBox
                id="label"
                type="text"
                value={label}
                placeholder="Eg.8.45AM - 9.45AM"
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
            <div>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  sx={{ width: "100%" }}
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                  slotProps={{ textField: { size: 'small' } }}

                />
              </LocalizationProvider>
            </div>
            <div>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time"
                  sx={{ width: "100%" }}
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                  slotProps={{ textField: { size: 'small' } }}

                />
              </LocalizationProvider>
            </div>
          </div>
          <Button type="submit" label="Add Time Slots" />
        </form>
      </div>
      <br />
      <div className="table-container">
        <InputBox
          placeholder="Search..."
          value={search}
          onChange={handleSearchChange}
        />
        <br /> <br />
        <Paper>
          <TableContainer>
            <Table
              stickyHeader
              aria-label="time slot table"
              className="custom-table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTimeSlots
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((slot, index) => (
                    <TableRow key={slot.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{slot.year}</TableCell>
                      <TableCell>{slot.label}</TableCell>
                      <TableCell>{slot.start_time}</TableCell>
                      <TableCell>{slot.end_time}</TableCell>
                      <TableCell>
                        <DeleteIcon
                          style={{ color: "#ff5858" }}
                          onClick={() => handleDelete(slot.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTimeSlots.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              backgroundColor: "var(--text)",
              ".MuiTablePagination-toolbar": {
                backgroundColor: "var(--background-1)",
              },
            }}
          />
        </Paper>
      </div>
    </div>
  );
};

export default TimeSlotForm;
