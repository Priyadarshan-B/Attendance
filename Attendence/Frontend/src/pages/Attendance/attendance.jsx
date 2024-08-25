import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import InputBox from "../../components/TextBox/textbox";
import Select from "react-select";
import "./attendance.css";
import toast from "react-hot-toast";

function Attendance() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [FavStudents, setFavStudents] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const facultyId = CryptoJS.AES.decrypt(deid, secretKey).toString(
    CryptoJS.enc.Utf8
  );

  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  const handleYearChange = async (selectedOption) => {
    setSelectedYear(selectedOption);
    if (selectedOption) {
      try {
        const response = await requestApi(
          "GET",
          `/slots?year=${selectedOption.value}`
        );
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
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
      const response = await requestApi("GET", "/students-arr");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
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
    if (selectedYear) {
      fetchStudents();
      fetchFavStudents();
    }
  }, [selectedYear]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.register_number.includes(searchQuery)
  );

  const filteredFavStudents = FavStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.register_number.includes(searchQuery)
  );

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      return toast.error("Please select at least one student.");
    }

    try {
      const payload = {
        faculty: facultyId,
        timeslots: selectedTimeSlots,
        students: selectedStudents,
      };
      await requestApi("POST", "/arr-attendence", payload);
      toast.success("Attendance submitted successfully");
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
    <AppLayout
      body={
        <div className="attendance-container">
          <h2>Students Attendance (Hour)</h2>

          <div className="year-select">
            <Select
              options={yearOptions}
              value={selectedYear}
              onChange={handleYearChange}
              placeholder="Select Year"
            />
          </div>

          {selectedYear ? (
            <div className="time-slots-container">
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
                        <span>{slot.label}</span>
                      </label>
                      <svg className="inline-svg">
                        <symbol id="check-4" viewBox="0 0 12 10">
                          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                        </symbol>
                      </svg>
                    </div>
                  ))
                ) : (
                  <div>No Slots Available...</div>
                )}
              </div>
            </div>
          ) : (
            <div>Please select a year..</div>
          )}

          {selectedYear && selectedTimeSlots.length > 0 && (
            <div className="students-table">
              <div className="table-header">
                <h4>
                  {showFavourites
                    ? "Favourite Students"
                    : `Students List - ${selectedYear.value} Year`}
                </h4>
                <button className= "favourites" onClick={() => setShowFavourites(!showFavourites)}>
                  {showFavourites ? "Show All Students" : "Favourites"}
                </button>
              </div>
              <InputBox
                type="text"
                placeholder="Search students"
                value={searchQuery}
                onChange={handleSearch}
                style={{width:'50%'}}
              />
              <table className="custom-table">
                <thead>
                  <tr>
                    {!showFavourites && <th>Favourite</th>}
                    <th>S.No</th>
                    <th>Year</th>
                    <th>Name</th>
                    <th>Register Number</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {(showFavourites ? filteredFavStudents : filteredStudents)
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student, index) => (
                      <tr key={student.id}>
                        {!showFavourites && (
                          <td>
                            <input
                              type="checkbox"
                              id={`heart-${student.id}`}
                              className="heart-checkbox"
                              onChange={() => handleFavouriteChange(student.id)}
                            />
                          </td>
                        )}
                        <td>{page * rowsPerPage + index + 1}</td>
                        <td>{student.year}</td>
                        <td>{student.name}</td>
                        <td>{student.register_number}</td>
                        <td>
                          <input
                            className="table-checkbox"
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() =>
                              handleStudentCheckboxChange(student.id)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="pagination">
                <button
                  onClick={(event) => handleChangePage(event, page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </button>
                <span>
                  Page {page + 1} of{" "}
                  {Math.ceil(
                    (showFavourites ? filteredFavStudents.length : students.length) /
                      rowsPerPage
                  )}
                </span>
                <button
                  onClick={(event) => handleChangePage(event, page + 1)}
                  disabled={
                    page >=
                    Math.ceil(
                      (showFavourites ? filteredFavStudents.length : students.length) /
                        rowsPerPage
                    ) -
                      1
                  }
                >
                  Next
                </button>
                <label>
                  Rows per page:
                  <select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                </label>
              </div>

              <div style={{
                display:'flex',
                justifyContent:'center'
              }} >
                <button className= "submit-attendance"onClick={handleSubmit}>Submit Attendance</button>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}

export default Attendance;
