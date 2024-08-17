import React, { useEffect, useState } from "react";
import AppLayout from "../../../components/applayout/AppLayout";
import "../../../components/applayout/styles.css";
import requestApi from "../../../components/utils/axios";
import Select from "react-select";
import Cookies from "js-cookie";
import Buttons from "../../../components/Button/Button";
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
} from "@mui/material";
import "./mentor.css";

function MentorMapping() {
  return <Body/>
}

function Body() {
  const [mentors, setMentors] = useState([]);
  const id = Cookies.get("id");
  const [students, setStudents] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMentorList, setShowMentorList] = useState(false);
  const [mentorList, setMentorList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const mentorResponse = await requestApi("GET", "/all-mentors");
        setMentors(mentorResponse.data);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedYear) {
        try {
          const studentResponse = await requestApi(
            "GET",
            `/all-students?year=${selectedYear.value}`
          );
          setStudents(studentResponse.data);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      } else {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [selectedYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await requestApi("POST", `/mentor-mapping`, {
        mentor: `${id}`,
        student: selectedStudents.map((student) => student.value),
      });
      console.log("Mapping saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving mapping:", error);
    }
  };

  const handleShowMentorList = async () => {
    setShowMentorList(!showMentorList);
    if (!showMentorList) {
      try {
        const response = await requestApi("GET", "/mentor-map");
        setMentorList(response.data);
      } catch (error) {
        console.error("Error fetching mentor list:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await requestApi("DELETE", `/mentor/${id}`);
      setMentorList((prevList) => prevList.filter((mentor) => mentor.id !== id));
    } catch (error) {
      console.error("Error deleting mentor:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const mentorOptions = mentors.map((mentor) => ({
    value: mentor.id,
    label: mentor.name,
  }));

  const studentOptions = students.map((student) => ({
    value: student.id,
    label: `${student.name} - ${student.register_number}`,
  }));

  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  return (
    <div>
      <h3>Mentor - Student Mapping</h3>
      <br />

      <div className="mentor-mapping-container">
        <form onSubmit={handleSubmit}>
          {/* <div className="form-group">
            <label htmlFor="mentor-select">Select Faculty(Mentor):</label>
            <Select
              id="mentor-select"
              options={mentorOptions}
              onChange={setSelectedMentor}
              value={selectedMentor}
            />
          </div> */}
          <div className="form-group">
            <label htmlFor="year-select">Select Year:</label>
            <Select
              id="year-select"
              options={yearOptions}
              onChange={setSelectedYear}
              value={selectedYear}
            />
          </div>
          <div className="form-group">
            <label htmlFor="students-select">Select Students:</label>
            <Select
              id="students-select"
              options={studentOptions}
              onChange={setSelectedStudents}
              value={selectedStudents}
              isMulti
            />
          </div>
        <Buttons
        type="submit"
        label="Submit Mapping"
        />
        </form>
      </div>

      <div style={{
        display:'flex',
        justifyContent:'right'
      }}>
        <Buttons
        onClick={handleShowMentorList}
        label={showMentorList ? "Hide Mentor List" : "Show Mentor Mapping List"}
        />
      </div>

      {showMentorList && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>ID</b></TableCell>
                  <TableCell><b>Mentor</b></TableCell>
                  <TableCell><b>Student</b></TableCell>
                  <TableCell><b>Register Number</b></TableCell>
                  <TableCell><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mentorList
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{index+1}</TableCell>
                      <TableCell>{row.mentor}</TableCell>
                      <TableCell>{row.student}</TableCell>
                      <TableCell>{row.register_number}</TableCell>
                      <TableCell>
                        <Button
                          // variant="contained"
                          // color="secondary"
                          onClick={() => handleDelete(row.id)}
                        >
                          Delete
                        </Button>
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
          />
        </Paper>
      )}
    </div>
  );
}

export default MentorMapping;
