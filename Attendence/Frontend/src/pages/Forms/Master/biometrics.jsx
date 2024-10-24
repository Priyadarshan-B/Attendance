import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Typography
} from "@mui/material";
import moment from "moment";
import requestApi from "../../../components/utils/axios";

function Biometrics() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
        const response = await requestApi("POST", "/biometrics", { date: formattedDate });
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    const filtered = data.filter((row) =>
      row.student.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div>
      <div style={{display:'flex',flexWrap:'wrap', justifyContent:'center', alignItems:'center', gap:'20px'}}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              renderInput={(params) => <TextField {...params} />}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
          <TextField
            label="Search by Register Number"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginTop: "20px", marginBottom: "20px" }}
            size="small"
          />
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Student</b></TableCell>
              <TableCell><b>Attendance Time</b></TableCell>
              <TableCell><b>Place</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.student}</TableCell>
                    <TableCell>{moment(row.attendence).format("DD-MM-YYYY, h:mm:ss a")}</TableCell>
                    <TableCell>{row.place || "N/A"}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No records found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {filteredData.length > 0 && (
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>
    </div>
  );
}

export default Biometrics;
