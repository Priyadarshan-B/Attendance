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

    const fetchTimeSlots = async () => {
      try {
        const response = await requestApi("GET", "/slots");
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    fetchData();
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };

    updateCurrentTime(); // Run immediately
    const intervalId = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const parseTime = (timeString) => {
    // Converts a 24-hour time string to minutes
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const getEnabledSlots = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
    console.log(`Current minutes: ${currentMinutes}`);
  
    return timeSlots.map((slot) => {
      const start = parseTime(slot.start_time);
      let end = parseTime(slot.end_time);
  
      // Handle slots that span midnight
      if (end < start) {
        end += 24 * 60; // Add 24 hours in minutes
      }
  
      console.log(`Slot: ${slot.label}`);
      console.log(`Start minutes: ${start}, End minutes: ${end}`);
  
      // Determine if slot should be enabled
      const isCurrentlyEnabled = currentMinutes >= start && currentMinutes <= end;
      const isPastSlot = currentMinutes > end;
  
      console.log(`Is slot currently enabled: ${isCurrentlyEnabled}`);
      console.log(`Is slot past: ${isPastSlot}`);
  
      return {
        ...slot,
        isEnabled: (isCurrentlyEnabled || isPastSlot) && slot.status === '1', // Enable if currently active or past and status is '1'
      };
    });
  };
  // Example usage:
  const enabledSlots = getEnabledSlots();
  console.log("Enabled slots:", enabledSlots);
  
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

  const handleRowClick = (rowId) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  const renderTimeSlots = (row) => {
    const enabledSlots = getEnabledSlots();

    return (
      <div className="time-slots">
        {enabledSlots.map((slot) => {
          const isDisabled = !slot.isEnabled || slot.status === "0";
          return (
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
                disabled={isDisabled}
                onClick={(event) => event.stopPropagation()}
              />
              <label
                className={`cbx ${isDisabled ? "disabled" : ""}`}
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
          );
        })}
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
              <th>S.No</th>
              <th>Name</th>
              <th>Register Number</th>
            </tr>
          </thead>
          <tbody>
            {filterData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr
                    className="row"
                    onClick={() => handleRowClick(row.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{page * rowsPerPage + index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.register_number}</td>
                  </tr>
                  {expandedRow === row.id && (
                    <tr className="expanded-row">
                      <td colSpan="3">{renderTimeSlots(row)}</td>
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
