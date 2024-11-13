import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, TablePagination, FormControl
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import requestApi from "../../../components/utils/axios";

function SlotAttendance() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 

  const fetchAttendanceData = async () => {
    try {
      const response = await requestApi("GET", "/arr-attendence");
      setData(response.data);
      setFilteredData(response.data); 
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = data.filter((item) =>
      item.name.toLowerCase().includes(value) ||
      item.register_number.toLowerCase().includes(value)
    );

    if (selectedDate) {
      const filteredByDate = filtered.filter((item) =>
        new Date(item.date).toLocaleDateString() === selectedDate.toLocaleDateString()
      );
      setFilteredData(filteredByDate);
    } else {
      setFilteredData(filtered);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    
    const filteredByDate = data.filter((item) =>
      new Date(item.dbDate).toLocaleDateString() === newDate?.toLocaleDateString()
    );

    if (searchTerm) {
      const filteredBySearchAndDate = filteredByDate.filter((item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.register_number.toLowerCase().includes(searchTerm)||
        item.label.toLowerCase().includes(searchTerm)
      );
      setFilteredData(filteredBySearchAndDate);
    } else {
      setFilteredData(filteredByDate);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); 
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <div>
      <h3>Slot Attendance</h3>
      <br />

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search by Name or Register Number"
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
        />
      </FormControl>

      <FormControl  sx={{ marginBottom: 2 }}>
        <DatePicker
          label="Filter by Date"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params}  />}
          slotProps={{ textField: { size: 'small' } }}

        />
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Register Number</TableCell>
              <TableCell>Slot</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          { filteredData.length >0 ? ( <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.register_number}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.dbDate}</TableCell>
                  <TableCell>{item.time}</TableCell>
                </TableRow>
              ))}
          </TableBody>)
          :(
            <h4>No Records</h4>
          )
          }
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
    </LocalizationProvider>
  );
}

export default SlotAttendance;