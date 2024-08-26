import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TablePagination } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import requestApi from "../../../components/utils/axios";
import Select from "react-select"; 
import Button from "../../../components/Button/Button";
import toast from "react-hot-toast";
import InputBox from "../../../components/TextBox/textbox";
import './mapStudent.css'

function MapStudent() {
  return <Body />;
}

function Body() {
  const [roles, setRoles] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [roleStudentData, setRoleStudentData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentOptions, setStudentOptions] = useState([]);

  useEffect(() => {
    requestApi("GET", "/map-role-select")
      .then((response) => {
        const formattedRoles = response.data.map((role) => ({
          value: role.id,
          label: role.name,
        }));
        setRoles(formattedRoles);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  }, []);

  useEffect(() => {
    fetchRoleStudentData();
  }, []);

  const fetchStudents = (inputValue) => {
    if (inputValue.length >= 3 && selectedYear) {
      requestApi("GET", `/all-students?year=${selectedYear.value}&search=${inputValue}`)
        .then((response) => {
          const formattedStudents = response.data.map((student) => ({
            value: student.id,
            label: `${student.name} - ${student.register_number}`,
          }));
          setStudentOptions(formattedStudents);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
        });
    } else {
      setStudentOptions([]);
    }
  };

  const fetchRoleStudentData = () => {
    requestApi("GET", "/role-student")
      .then((response) => {
        setRoleStudentData(response.data);

      })
      .catch((error) => {
        console.error("Error fetching role-student data:", error);
      });
  };

  const handleSubmit = () => {
    const payload = {
      roleId: selectedRole?.value,
      studentIds: selectedStudents.map((student) => student.value),
    };

    requestApi("POST", "/map-role", payload)
      .then((response) => {
        console.log("Mapping successful:", response.data);
        toast.success("Role Mapped successfully!");

        setSelectedRole(null);
        setSelectedStudents([]);
        setSelectedYear(null);
        fetchRoleStudentData();
      })
      .catch((error) => {
        console.error("Error in mapping students to role:", error);
        toast.error("Error in mapping students to role");
      });
  };

  const handleDelete = (id) => {
    requestApi("PUT", `/role-student?id=${id}`)
      .then(() => {
        toast.success("Mapping deleted successfully!");
        fetchRoleStudentData();
      })
      .catch((error) => {
        console.error("Error deleting role-student mapping:", error);
        toast.error("Error deleting  mapping");
      });
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = roleStudentData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery) ||
    item.register_number.toLowerCase().includes(searchQuery) ||
    item.role.toLowerCase().includes(searchQuery)
  );
 

  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  return (
    <div className="map-student-container">
      <h3>Map Students to Other Role</h3>
      <div className="map-student">
        <div className="form-group">
          <label htmlFor="role-select">Select Role</label>
          <Select
            id="role-select"
            options={roles}
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder="Select Role"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role-select">Select Year</label>
          <Select
            id="role-select"
            options={yearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
            placeholder="Select Year"
          />
        </div>
        <div className="form-group">
          <label htmlFor="students-select">Select Students</label>
          <Select
            id="students-select"
            options={studentOptions}
            value={selectedStudents}
            onChange={setSelectedStudents}
            placeholder="Select students"
            isMulti
            onInputChange={fetchStudents}
            noOptionsMessage={({ inputValue }) => 
              !selectedYear
                ? "Please select a year first"
                : inputValue.length > 0 
                  ? inputValue.length < 3 
                    ? "Type at least 3 characters to search" 
                    : "No students found" 
                  : "Type to search..."}
          />
        </div>
        <Button onClick={handleSubmit} label="Submit" />
      </div>
      <div className="map-table">
        <h4>Mapped Students</h4>
        <div>
          <InputBox
            label="Search"
            onChange={handleSearch}
            placeholder="Search.."
          />
        </div>
        <br />
        <div>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Role</b></TableCell>
                    <TableCell><b>Student Name</b></TableCell>
                    <TableCell><b>Register Number</b></TableCell>
                    <TableCell><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.role}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.register_number}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleDelete(row.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default MapStudent;
