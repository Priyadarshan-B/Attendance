import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select as MuiSelect, TextField, TablePagination
} from '@mui/material';
import Select from 'react-select'; 
import customStyles from "../../../components/applayout/selectTheme";
import requestApi from "../../../components/utils/axios"; 
import Button from "../../../components/Button/Button";

function RoleChange() {
  const [selectedUserType, setSelectedUserType] = useState(""); 
  const [data, setData] = useState([]); 
  const [roles, setRoles] = useState([]); 
  const [open, setOpen] = useState(false); 
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredData, setFilteredData] = useState([]); 
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(10); 

  const handleUserTypeChange = async (option) => {
    setSelectedUserType(option.value);
    setPage(0);
    if (option.value === "faculty") {
      await fetchMentors();
    } else if (option.value === "student") {
      await fetchStudents();
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await requestApi("GET", "/all-mentors");
      setData(response.data);
      setFilteredData(response.data); 
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await requestApi("GET", "/student-year");
      setData(response.data);
      setFilteredData(response.data); 
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await requestApi("GET", "/auth/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleEditClick = (person) => {
    setSelectedPerson(person); 
    fetchRoles();
    setOpen(true); 
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value); 
  };

  const handleClose = () => {
    setOpen(false); 
    setSelectedPerson(null); 
    setSelectedRole(""); 
  };

  const handleSubmit = async () => {
    try {
      const response = await requestApi("POST", "/auth/role-change", {
        role: selectedRole,
        gmail: selectedPerson.gmail
      });
      if (response.status === 200) {
        if (selectedUserType === "faculty") {
          await fetchMentors();
        } else {
          await fetchStudents();
        }
        handleClose();
      }
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const userOptions = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' }
  ];

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (selectedUserType === "faculty") {
      setFilteredData(data.filter(mentor => 
        mentor.name.toLowerCase().includes(value.toLowerCase()) ||
        // mentor.staff_id.toLowerCase().includes(value.toLowerCase()) ||
        mentor.role.toLowerCase().includes(value.toLowerCase())
      ));
    } else if (selectedUserType === "student") {
      setFilteredData(data.filter(student => 
        student.name.toLowerCase().includes(value.toLowerCase()) ||
        student.register_number.toLowerCase().includes(value.toLowerCase()) ||
        student.role.toLowerCase().includes(value.toLowerCase())
      ));
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
    <div>
      <h3>Role Change</h3>
      <br />
      <FormControl fullWidth sx={{zIndex:'400'}}>
        <Select 
          options={userOptions} 
          onChange={handleUserTypeChange} 
          placeholder="Select User Type"
          styles={customStyles}
        />
      </FormControl>
      <br />
      
      {selectedUserType && (
        <TextField
          fullWidth
          variant="outlined"
          label={`Search ${selectedUserType === "faculty" ? "Faculty" : "Student"}`}
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ marginTop: 2 }}
        />
      )}
      
      {selectedUserType === "faculty" && filteredData.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Staff ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell>{mentor.name}</TableCell>
                    <TableCell>{mentor.staff_id || '--'}</TableCell>
                    <TableCell>{mentor.gmail}</TableCell>
                    <TableCell>{mentor.role}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditClick(mentor)} label="Edit Role" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
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
        </>
      )}

      {selectedUserType === "student" && filteredData.length > 0 && (
        <>
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Register Number</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.register_number}</TableCell>
                    <TableCell>{student.role}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEditClick(student)} label="Edit Role" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
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
        </>
      )}
      
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Edit Role for {selectedPerson?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <MuiSelect
              value={selectedRole}
              onChange={handleRoleChange}
              displayEmpty
              size="small"
              fullWidth
            >
              <MenuItem value="" disabled>Select Role</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </MuiSelect>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} label="Cancel" />
          <Button onClick={handleSubmit} label="Submit" />
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default RoleChange;
