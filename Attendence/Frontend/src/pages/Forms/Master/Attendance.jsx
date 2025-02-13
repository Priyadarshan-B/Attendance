import React, { useState, useEffect } from "react";
import requestApi from "../../../components/utils/axios";
import InputBox from "../../../components/TextBox/textbox";
import Select from "react-select";
import "../../Attendance/attendance.css";
import toast from "react-hot-toast";
import moment from "moment";
import Checkbox from "@mui/material/Checkbox";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import noresult from "../../../assets/no-results.png";
import Logs from "../../Attendance/logs";
import customStyles from "../../../components/applayout/selectTheme";
import { decryptData } from "../../../components/utils/encrypt";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function MAttendance() {
  return <Body />;
}
function Body() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [FavStudents, setFavStudents] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState(false);
  const [attDate, setAttDate] = useState(moment());
  const encryptedData = localStorage.getItem("D!");
  const decryptedData = decryptData(encryptedData);
  const { id: facultyId } = decryptedData;

  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  const fetchTimeSlots = async (year, date) => {
    if (year && date) {
      try {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        const response = await requestApi(
          "GET",
          `/slots?year=${year}&date=${formattedDate}`
        );
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    }
  };

  const handleYearChange = async (selectedOption) => {
    setSelectedYear(selectedOption);
    setSelectedTimeSlots([]);
    if (selectedOption) {
      fetchTimeSlots(selectedOption.value, attDate);
    }
  };

  //   const handleFacultyChange = async (selectedOption) => {
  //         setSelectedFaculty(selectedOption)
  //         setSelectedFaculty([])
  //     if(selectedOption){
  //         fetchFaculty(selectedOption.value,selectedOption)
  //     }
  //   }
  const handleFacultyChange = (selectedOption) => {
    setSelectedFaculty(selectedOption); 
  };

  const handleDateChange = (newDate) => {
    setAttDate(moment(newDate));
    setSelectedTimeSlots([]);
    if (selectedYear) {
      fetchTimeSlots(selectedYear.value, newDate);
    }
  };

  const handleTimeSlotChange = (slotId) => {
    setSelectedTimeSlots((prevSelected) =>
      prevSelected.includes(slotId)
        ? prevSelected.filter((id) => id !== slotId)
        : [...prevSelected, slotId]
    );
  };

  const handleStudentCheckboxChange = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  const handleFavouriteChange = async (studentId) => {
    try {
      const payload = {
        student: studentId,
        mentor: parseInt(facultyId),
      };
      await requestApi("POST", "/favourites", payload);
      toast.success("Added to favourites");
      fetchFavStudents();
    } catch (error) {
      toast.error("Failed to add to favourites");
      console.error("Error adding to favourites:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await requestApi(
        "GET",
        `/students-arr?year=${selectedYear.value}`
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await requestApi("GET", `/all-mentors`);
      setFaculty(response.data);
    } catch (error) {
      console.error("Error Fetching Faculty", error);
    }
  };

  const fetchFavStudents = async () => {
    try {
      const response = await requestApi(
        "GET",
        `/favourites?mentor=${facultyId}`
      );
      setFavStudents(response.data);
    } catch (err) {
      console.error("Error fetching Fav Students", err);
    }
  };

  useEffect(() => {
    fetchFaculty();
    if (selectedYear) {
      fetchStudents();
      fetchFaculty();
      fetchFavStudents();
    }
  }, [selectedYear]);

  const facultyOptions = faculty.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.register_number.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFavStudents = FavStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.register_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shouldShowTable = showFavourites || searchQuery.length >= 3;

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      return toast.error("Please select at least one student.");
    }
    if (!selectedFaculty || !selectedFaculty.value) {
      return toast.error("Please select a faculty member.");
    }
    const formattedDate = attDate ? moment(attDate).format("YYYY-MM-DD") : null;
    const currentTime = moment().format("HH:mm:ss");
    const combinedDateTime = formattedDate
      ? `${formattedDate} ${currentTime}`
      : null;

    try {
      const payload = {
        faculty: selectedFaculty.value,
        timeslots: selectedTimeSlots,
        students: selectedStudents,
        att_date: combinedDateTime,
      };
      await requestApi("POST", "/arr-attendence", payload);
      toast.success("Attendance submitted successfully");
      setSelectedTimeSlots([]);
      setSelectedStudents([]);
    } catch (error) {
      toast.error("Failed to submit attendance");
      console.error("Error submitting attendance:", error);
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
    <div className="attendance-container">
      <button className="favourites" onClick={() => setLogs(!logs)}>
        {logs ? "Show All Students" : "Attendance Logs"}
      </button>
      <br />
      <br />

      {logs ? (
        <Logs />
      ) : (
        <div>
          <div className="year-select">
            <Select
              options={faculty.map((f) => ({ value: f.id, label: f.name }))}
              value={selectedFaculty}
              onChange={handleFacultyChange}
              placeholder="Select Faculty.."
              styles={customStyles}
              isClearable
            />
          </div>
          <br />
          <div className="year-select">
            <Select
              options={yearOptions}
              value={selectedYear}
              onChange={handleYearChange}
              placeholder="Select Year"
              styles={customStyles}
              isClearable
            />
          </div>
          <br />
          {selectedYear ? (
            <div className="time-slots-container">
              <div>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={attDate.toDate()}
                    onChange={(newValue) => handleDateChange(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    slotProps={{ textField: { size: "small" } }}
                    format="dd-MM-yyyy"
                    maxDate={new Date()}
                  />
                </LocalizationProvider>
              </div>
              <h4>Select Time Slots</h4>
              <div className="time-slots">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot) => (
                    <div key={slot.id} className="time-slot checkbox-wrapper-4">
                      <input
                        className="inp-cbx"
                        id={`slot-${slot.id}`}
                        type="checkbox"
                        checked={selectedTimeSlots.includes(slot.id)}
                        onChange={() => handleTimeSlotChange(slot.id)}
                      />
                      <label className="cbx" htmlFor={`slot-${slot.id}`}>
                        <span>
                          <svg width="12px" height="10px">
                            <use xlinkHref="#check-4"></use>
                          </svg>
                        </span>
                        <span style={{ fontSize: "16px" }}>{slot.label}</span>
                      </label>
                      <svg className="inline-svg">
                        <symbol id="check-4" viewBox="0 0 12 10">
                          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                        </symbol>
                      </svg>
                    </div>
                  ))
                ) : (
                  <p>No Slots Available...</p>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                height: "40vh",
              }}
            >
              <p>Please select a year..</p>
              <img className="no-result" src={noresult} alt="" width="10%" />
            </div>
          )}

          {selectedYear && selectedTimeSlots.length > 0 && (
            <div className="students-table">
              <div className="table-header">
                <h4>
                  {showFavourites
                    ? "Favourite Students"
                    : `Students List - ${selectedYear.value} Year`}
                </h4>
                <button
                  className="favourites"
                  onClick={() => setShowFavourites(!showFavourites)}
                >
                  {showFavourites ? "Show All Students" : "Favourites"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <InputBox
                  type="text"
                  placeholder="Search students"
                  value={searchQuery}
                  onChange={handleSearch}
                  style={{ width: "50%" }}
                />
              </div>
              <div className="table-container">
                <Paper>
                  <TableContainer>
                    <Table aria-label="students table" className="custom-table">
                      <TableHead sx={{ whiteSpace: "nowrap" }}>
                        <TableRow>
                          {!showFavourites && <TableCell>Favourite</TableCell>}
                          <TableCell>Year</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Register Number</TableCell>
                          <TableCell>Attendance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody
                        sx={{ whiteSpace: "nowrap", textAlign: "center" }}
                      >
                        {!shouldShowTable ? (
                          <TableRow>
                            <TableCell colSpan={6} className="no-results">
                              Search name or register number to view data...
                            </TableCell>
                          </TableRow>
                        ) : (showFavourites
                            ? filteredFavStudents
                            : filteredStudents
                          ).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="no-results">
                              No results found
                            </TableCell>
                          </TableRow>
                        ) : (
                          (showFavourites
                            ? filteredFavStudents
                            : filteredStudents
                          )
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                            .map((student, index) => (
                              <TableRow key={student.id}>
                                {!showFavourites && (
                                  <TableCell>
                                    <Checkbox
                                      icon={<FavoriteBorder />}
                                      checkedIcon={
                                        <Favorite
                                          sx={{
                                            color: "#ff7f95",
                                          }}
                                        />
                                      }
                                      onChange={() =>
                                        handleFavouriteChange(student.id)
                                      }
                                      aria-label="Favourite"
                                    />
                                  </TableCell>
                                )}
                                <TableCell>{student.year}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.register_number}</TableCell>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedStudents.includes(
                                      student.id
                                    )}
                                    onChange={() =>
                                      handleStudentCheckboxChange(student.id)
                                    }
                                    sx={{
                                      color: "#35dc61",
                                      "&.Mui-checked": {
                                        color: "#35dc61",
                                      },
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {shouldShowTable && (
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={
                        showFavourites
                          ? filteredFavStudents.length
                          : filteredStudents.length
                      }
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      sx={{
                        backgroundColor: "var(--text)",
                        ".MuiTablePagination-toolbar": {
                          backgroundColor: "var(--background-1)",
                          padding: "0px",
                        },
                      }}
                    />
                  )}
                </Paper>
              </div>
            </div>
          )}
          <br />
          {selectedYear && selectedTimeSlots.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button className="submit-attendance" onClick={handleSubmit}>
                Submit Attendance
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MAttendance;
