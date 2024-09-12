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
import { getDecryptedCookie } from "../../components/utils/encrypt";

function Logs() {
  return <Body />;
}

function Body() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);


  const facultyId = getDecryptedCookie("id")

  const fetchStudents = async () => {
    try {
      const response = await requestApi("GET", `/logs?faculty=${facultyId}`);
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
  }, []);

  return (
    <div>
      <h3>Logged Attendance</h3>
      <br />
      <div>
        <InputBox
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search.."
          style={{ width: "300px" }}
        />
      </div>
      <br />
      <div className="table-container">
        <Paper>
          <TableContainer>
            <Table className="custom-table">
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Register Number</TableCell>
                  <TableCell>Session</TableCell>
                  <TableCell>Logged Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.register_number}</TableCell>
                      <TableCell>{student.label}</TableCell>
                      <TableCell>
                        {moment(student.att_session).format("DD-MM-YYYY HH:mm:ss")}
                      </TableCell> 
                    </TableRow>
                  ))}
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
