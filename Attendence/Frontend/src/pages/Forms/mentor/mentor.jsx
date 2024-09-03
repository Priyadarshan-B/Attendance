import React, { useEffect, useState } from "react";
import requestApi from "../../../components/utils/axios";
import Select from "react-select";
import InputBox from "../../../components/TextBox/textbox";
import Buttons from "../../../components/Button/Button";
import toast from "react-hot-toast";
import {  Delete } from "@mui/icons-material";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  IconButton,
} from "@mui/material";
import "./mentor.css";
import Popup from "../../../components/popup/popup";

function MentorMapping() {
  return <Body />;
}

function Body() {
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentorOptions, setMentorOptions] = useState([]);
  const [subMentorOptions, setSubMentorOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSubMentor, setSelectedSubMentor] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMentorList, setShowMentorList] = useState(false);
  const [mentorList, setMentorList] = useState([]);
  const [filteredMentorList, setFilteredMentorList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [openPopup, setOpenPopup] = useState(false); 
  const [deleteId, setDeleteId] = useState(null); 
  

  const fetchMentors = (inputValue) => {
    if (inputValue.length >= 3) {
      requestApi("GET", `/all-mentors?search=${inputValue}`)
        .then((response) => {
          const formattedMentors = response.data.map((mentor) => ({
            value: mentor.id,
            label: mentor.name,
          }));
          setMentorOptions(formattedMentors);
        })
        .catch((error) => {
          console.error("Error fetching mentors:", error);
        });
    } else {
      setMentorOptions([]);
    }
  };
  const fetchSubMentors = (inputValue) => {
    if (inputValue.length >= 3) {
      requestApi("GET", `/all-mentors?search=${inputValue}&exclude=${selectedMentor?.value || ''}`)
        .then((response) => {
          const formattedSubMentors = response.data.map((mentor) => ({
            value: mentor.id,
            label: mentor.name,
          }));
          setSubMentorOptions(formattedSubMentors);
        })
        .catch((error) => {
          console.error("Error fetching sub-mentors:", error);
        });
    } else {
      setSubMentorOptions([]);
    }
  };

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


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await requestApi("POST", `/mentor-mapping`, {
        mentor: selectedMentor?.value,
        subMentor: selectedSubMentor?.value,
        student: selectedStudents.map((student) => student.value),
      });
  
      if (response.status === 409) {
        toast.error("Mentor-Student already mapped!!");
      } else {
        toast.success("Mentor Mapped successfully!");
        setSelectedMentor(null);
        setSelectedSubMentor(null);
        setSelectedStudents([]);
        setSelectedYear(null);
        console.log("Mapping saved successfully:", response.data);
      }
    } catch (error) {
      console.error("Error saving mapping:", error);
      toast.error("Mentor Mapping Failed");
    }
  };
  
  const handleShowMentorList = async () => {
    setShowMentorList(!showMentorList);
    if (!showMentorList) {
      try {
        const response = await requestApi("GET", "/mentor-map");
        setMentorList(response.data);
        setFilteredMentorList(response.data);
      } catch (error) {
        console.error("Error fetching mentor list:", error);
      }
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id); 
    setOpenPopup(true); 
  };

  const handleConfirmDelete = async () => {
    try {
      await requestApi("PUT", `/mentor-map?id=${deleteId}`);
      setMentorList((prevList) =>
        prevList.filter((mentor) => mentor.id !== deleteId)
      );
      toast.success("Mentor Mapping Deleted successfully!");
      handleShowMentorList();
    } catch (error) {
      console.error("Error deleting mentor:", error);
      toast.error("Error deleting Mentor Mapping");
    } finally {
      setOpenPopup(false); 
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];


  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = mentorList.filter(
      (student) =>
        student.mentor.toLowerCase().includes(value) ||
        student.student.toLowerCase().includes(value) ||
        student.register_number.toLowerCase().includes(value)
    );
    setFilteredMentorList(filtered);
  };

  return (
    <div>
      <h3>Mentor - Student Mapping</h3>
      <br />

      <div className="mentor-mapping-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mentor-select"> Faculty(Mentor):</label>
            <Select
              id="mentor-select"
              options={mentorOptions}
              onChange={setSelectedMentor}
              value={selectedMentor}
              onInputChange={fetchMentors}
              isClearable
              noOptionsMessage={({ inputValue }) => 
                inputValue.length > 0 
                  ? inputValue.length < 3 
                    ? "Type at least 3 characters to search" 
                    : "No mentors found" 
                  : "Type to search..."}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sub-mentor-select"> Sub-Faculty(Mentor):</label>
            <Select
              id="sub-mentor-select"
              options={subMentorOptions}
              onChange={setSelectedSubMentor}
              value={selectedSubMentor}
              onInputChange={fetchSubMentors}
              isClearable
              noOptionsMessage={({ inputValue }) => 
                inputValue.length > 0 
                  ? inputValue.length < 3 
                    ? "Type at least 3 characters to search" 
                    : "No sub-mentors found" 
                  : "Type to search..."}
            />
          </div>
          <div className="form-group">
            <label htmlFor="year-select"> Year:</label>
            <Select
              id="year-select"
              options={yearOptions}
              onChange={setSelectedYear}
              value={selectedYear}
            />
          </div>
          <div className="form-group">
            <label htmlFor="students-select">Students:</label>
            <Select
              id="students-select"
              options={studentOptions}
              onChange={setSelectedStudents}
              value={selectedStudents}
              onInputChange={fetchStudents}
              isMulti
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
          <Buttons type="submit" label="Submit Mapping" />
        </form>
      </div>

      <div style={{ display: "flex", justifyContent: "right" }}>
        <Buttons
          onClick={handleShowMentorList}
          label={
            showMentorList ? "Hide Mentor List" : "Show Mentor Mapping List"
          }
        />
      </div>

      {showMentorList && (
        <div>
          <div>
            <InputBox
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search.."
            />
          </div>
          <br />
          <div className="table-container">
            <Paper>
              <TableContainer>
                <Table className="custom-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>ID</b>
                      </TableCell>
                      <TableCell>
                        <b>Mentor</b>
                      </TableCell>
                      <TableCell>
                        <b>Sub-Mentor</b>
                      </TableCell>
                      <TableCell>
                        <b>Student</b>
                      </TableCell>
                      <TableCell>
                        <b>Register Number</b>
                      </TableCell>
                      <TableCell>
                        <b>Actions</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMentorList
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.mentor}</TableCell>
                          <TableCell>{row.sub_mentor || "N/A"}</TableCell>
                          <TableCell>{row.student}</TableCell>
                          <TableCell>{row.register_number}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleDelete(row.id)}
                              sx={{
                                color: "red",
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={mentorList.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  backgroundColor: 'var(--text)',
                  '.MuiTablePagination-toolbar': {
                    backgroundColor: 'var(--background-1)',
                  },
                }}
              />
            </Paper>
          </div>
        </div>
      )}

      <Popup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        onConfirm={handleConfirmDelete}
        text="Are you sure you want to delete this mentor mapping?"
      />
    </div>
  );
}

export default MentorMapping;
