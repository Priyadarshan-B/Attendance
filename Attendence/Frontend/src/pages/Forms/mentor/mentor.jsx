import React, { useEffect, useState } from "react";
import requestApi from "../../../components/utils/axios";
import Select from "react-select";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import InputBox from "../../../components/TextBox/textbox";
import Buttons from "../../../components/Button/Button";
import toast from "react-hot-toast";
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
  // const deid = Cookies.get("id");
  // const secretKey = "secretKey123";
  // const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8)
  const [students, setStudents] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMentorList, setShowMentorList] = useState(false);
  const [mentorList, setMentorList] = useState([]);
  const [filteredMentorList, setFilteredMentorList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");


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
        mentor: selectedMentor.value,
        student: selectedStudents.map((student) => student.value),
      });
      console.log("Mapping saved successfully:", response.data);
      toast.success("Mentor Mapped successfully!");
      setSelectedMentor(null)
      setSelectedStudents([])
      setSelectedYear([])


    } catch (error) {
      console.error("Error saving mapping:", error);
      toast.error("Mentor Mapped is Failed");

    }
  };

  const handleShowMentorList = async () => {
    setShowMentorList(!showMentorList);
    if (!showMentorList) {
      try {
        const response = await requestApi("GET", "/mentor-map");
        setMentorList(response.data);
        setFilteredMentorList(response.data)

        
      } catch (error) {
        console.error("Error fetching mentor list:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await requestApi("PUT", `/mentor-map?id=${id}`);
      setMentorList((prevList) => prevList.filter((mentor) => mentor.id !== id));
      toast.success("Mentor Mapped Deleted successfully!");
      handleShowMentorList()

    } catch (error) {
      console.error("Error deleting mentor:", error);
      toast.error("Error deleting Mentor Mapping");

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
        <div>
          <div>
          <InputBox
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search.."
          />
                </div>
                <br />
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
                  {filteredMentorList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index+1}</TableCell>
                        <TableCell>{row.mentor}</TableCell>
                        <TableCell>{row.student}</TableCell>
                        <TableCell>{row.register_number}</TableCell>
                        <TableCell>
                          <Button
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
        </div>
      )}
    </div>
  );
}

export default MentorMapping;
