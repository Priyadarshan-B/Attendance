import React, { useState, useEffect } from "react";
import requestApi from "../../components/utils/axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import InputBox from "../../components/TextBox/textbox";
import "./attendance.css";
import toast from "react-hot-toast";
import RoleAttendance from "./roleAttendance";

function FavAttendance({ onGoBack }) {
  const [data, setData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showRoleAttendance, setShowRoleAttendance] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentResponse = await requestApi("GET", `/favourites?mentor=${id}`);
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
  }, [id]);

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

      setAttendanceData((prev) => {
        if (isChecked) {
          return prev.filter(
            (record) =>
              !(record.student === studentId && record.slot === slotId)
          );
        } else {
          return [...prev, { student: studentId, slot: slotId }];
        }
      });
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
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  if (showRoleAttendance) {
    return <RoleAttendance />;
  }

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
            <label className="cbx" htmlFor={`${row.id}-${slot.id}`}>
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
    <div className="favattendance-container">
      <div className="fav-attendance">
        <h4 onClick={onGoBack} className="go-back-button">
          &larr; Back
        </h4>
        <h3>Favourite Students Attendance</h3>

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
                    <tr onClick={() => handleRowClick(row.id)}>
                      <td>{page * rowsPerPage + index + 1}</td>
                      <td>{row.name}</td>
                      <td>{row.register_number}</td>
                    </tr>
                    {expandedRows[row.id] && (
                      <tr>
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
            <div>
              Rows per page:{" "}
              <select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                {[5, 10, 15, 25, 100].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FavAttendance;