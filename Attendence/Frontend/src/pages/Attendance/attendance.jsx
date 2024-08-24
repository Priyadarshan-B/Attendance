import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import InputBox from "../../components/TextBox/textbox";
import "./attendance.css";
import toast from "react-hot-toast";
import FavAttendance from "./favourites";

function Attendance() {
  const [showFavAttendance, setShowFavAttendance] = useState(false);

  const handleShowFavAttendance = () => setShowFavAttendance(true);

  const handleGoBack = () => setShowFavAttendance(false);

  return (
    <AppLayout
      body={
        showFavAttendance ? (
          <FavAttendance onGoBack={handleGoBack} />
        ) : (
          <Body onShowFavAttendance={handleShowFavAttendance} />
        )
      }
    />
  );
}

function Body({ onShowFavAttendance }) {
  const [data, setData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterData, setFilterData] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [favourites, setFavourites] = useState({});

  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentResponse = await requestApi("GET", "/students-arr");
        setData(studentResponse.data);
        setFilterData(studentResponse.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

   
    

    fetchData();
    // fetchTimeSlots();
  }, []);
  const fetchTimeSlots = async (year) => {
    try {
      const response = await requestApi("GET", `/slots?year=${year}`);
      setTimeSlots(response.data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };
  const handleRowClick = (rowId, year) => {
    if (expandedRow === rowId) {
      setExpandedRow(null);
    } else {
      fetchTimeSlots(year);
      setExpandedRow(rowId);
    }
  };
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };

    updateCurrentTime(); 
    const intervalId = setInterval(updateCurrentTime, 60000); 

    return () => clearInterval(intervalId); 
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = data.filter(
      (student) =>
        student.name.toLowerCase().includes(value) ||
        student.register_number.toLowerCase().includes(value)
    );

    setFilterData(filtered);
  };

  const handleCheckboxClick = async (event, studentId, slotId) => {
    event.stopPropagation();
    try {
      const isChecked = attendanceData.some(
        (record) => record.student === studentId && record.slot === slotId
      );

      const method = isChecked ? "PUT" : "POST";
      await requestApi(method, "/arr-attendence", {
        faculty: id,
        student: studentId,
        slot: slotId,
      });
      toast.success("Attendance Logged");

      setAttendanceData((prev) =>
        isChecked
          ? prev.filter(
              (record) =>
                !(record.student === studentId && record.slot === slotId)
            )
          : [...prev, { student: studentId, slot: slotId }]
      );
    } catch (error) {
      toast.error("Failed to Log Attendance");
      console.error("Error handling attendance data:", error);
    }
  };

  const handleChangePage = (event, newPage) => {
    event.preventDefault();
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

 
  
  const handleStarClick = async (studentId) => {
    try {
      await requestApi("POST", "/favourites", {
        student: studentId,
        mentor: id,
      });
      toast.success("Added to Favourites");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        toast.error("Already in Favourites");
      } else {
        toast.error("Failed to Add to Favourites");
      }
      console.error("Error adding to favourites:", error);
    }
  };
  const renderTimeSlots = (row) => {
    return (
      <div className="time-slots">
        {timeSlots.map((slot) => (
          <div key={slot.id} className="time-slot checkbox-wrapper-4">
            <input
              className="inp-cbx"
              id={`${row.id}-${slot.id}`}
              type="checkbox"
              checked={attendanceData.some(
                (record) =>
                  record.student === row.id && record.slot === slot.id
              )}
              onChange={(event) =>
                handleCheckboxClick(event, row.id, slot.id)
              }
              onClick={(event) => event.stopPropagation()}
            />
            <label
              className="cbx"
              htmlFor={`${row.id}-${slot.id}`}
            >
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
        ))}
      </div>
    );
  };

  return (
    <div className="attendance-container">
      <h2>Students Attendance (Hour)</h2>

      <div
        onClick={onShowFavAttendance}
        style={{ cursor: "pointer", color: "blue" }}
      >
        Favourites
      </div>
      <div className="flex-box">
        <h4>NIP / Re Appear Student List</h4>
        <InputBox
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: "300px" }}
          placeholder="Search..."
        />
      </div>

      <div className="att-table">
        <table className="custom-table">
          <thead>
            <tr>
            <th style={{ width: "0px" }}></th> 
            <th style={{ width: "0px" }}>S.No</th> 
            <th style={{ width: "0px" }}>Year</th> 
            <th style={{ width: "200px" }}>Name</th> 
            <th style={{ width: "150px" }}>Register Number</th>
            </tr>
          </thead>
          <tbody>
            {filterData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr
                    className="row"
                    onClick={() => handleRowClick(row.id, row.year)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="star-checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarClick(row.id);
                        }}
                      />
                    </td>
                    <td>{page * rowsPerPage + index + 1}</td>
                    <td>{row.year}</td>
                    <td>{row.name}</td>
                    <td>{row.register_number}</td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr className="expanded-row">
                      <td colSpan="5">{renderTimeSlots(row)}</td>
                    </tr>
                  )}
                </React.Fragment>
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
            Page {page + 1} of {Math.ceil(filterData.length / rowsPerPage)}
          </span>
          <button
            onClick={(event) => handleChangePage(event, page + 1)}
            disabled={page >= Math.ceil(filterData.length / rowsPerPage) - 1}
          >
            Next
          </button>
          <label>
            Rows per page:
            <select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
