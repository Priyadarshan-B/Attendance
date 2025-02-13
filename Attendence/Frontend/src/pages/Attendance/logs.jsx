import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import moment from "moment";
import requestApi from "../../components/utils/axios";
import InputBox from "../../components/TextBox/textbox";
import "./attendance.css";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { decryptData } from "../../components/utils/encrypt";
import TextField from "@mui/material/TextField";

function Logs() {
  return <Body />;
}

function Body() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [reqDate, setReqDate] = useState(moment());

  const encryptedData = localStorage.getItem("D!");
  const decryptedData = decryptData(encryptedData);
  const { id: facultyId } = decryptedData;

  const fetchStudents = async () => {
    try {
      const formattedDate = reqDate.format("YYYY-MM-DD");
      const response = await requestApi(
        "GET",
        `/logs?faculty=${facultyId}&att_session=${formattedDate}`
      );
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (err) {
      console.error("Error Fetching Students:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(value) ||
        student.register_number.toLowerCase().includes(value)
    );
    setFilteredStudents(filtered);
  };

  useEffect(() => {
    fetchStudents();
  }, [reqDate]);

  return (
    <div>
      <h3>Logged Attendance</h3>
      <br />
      <div className="date-search">
        <div>
          <InputBox
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search.."
            style={{ width: "300px" }}
          />
        </div>
        <br />
        <div>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={reqDate.toDate()}
              onChange={(newValue) => setReqDate(moment(newValue))}
              renderInput={(params) => <TextField {...params} />}
              slotProps={{ textField: { size: "small" } }}
              format="dd-MM-yyyy"
              maxDate={new Date()}
            />
          </LocalizationProvider>
        </div>
      </div>
      <br />
      <div className="table-container">
        <Paper>
          <TableContainer>
            <Table className="custom-table">
              <TableHead sx={{ whiteSpace: "nowrap" }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Register Number</TableCell>
                  <TableCell>Session</TableCell>
                  <TableCell>Logged Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ whiteSpace: "nowrap" }}>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No records
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.register_number}</TableCell>
                        <TableCell>{student.label}</TableCell>
                        <TableCell>
                          {moment(student.att_session).format(
                            "DD-MM-YYYY HH:mm:ss"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              backgroundColor: "var(--text)",
              ".MuiTablePagination-toolbar": {
                backgroundColor: "var(--background-1)",
              },
              ".MuiTablePagination-actions svg": {
                color: "var(--text)",
              },
              ".MuiSelect-icon": {
                color: "var(--text)",
              },
            }}
          />
        </Paper>
      </div>
    </div>
  );
}

export default Logs;
