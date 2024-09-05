import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import InputBox from "../../components/TextBox/textbox";
import toast from "react-hot-toast";
import "./attendance.css";

function RoleAttendance(){
  return (
  <Body />
);
}

function Body() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const deid = Cookies.get("role");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);

  const derole = Cookies.get("role");
  const role = CryptoJS.AES.decrypt(derole, secretKey).toString(CryptoJS.enc.Utf8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentResponse = await requestApi(
          "GET",
          `/mapped-student?role=${id}`
        );
        setData(studentResponse.data);
        setFilterData(studentResponse.data);
      } catch (error) {
        console.error("Error fetching Role attendance data:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await requestApi("GET", "/session");
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
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

  const handleCheckboxClick = async (event, studentId, sessionId) => {
    event.stopPropagation();
    try {
      const isChecked = attendanceData.some(
        (record) => record.student === studentId && record.session === sessionId
      );

      if (!isChecked) {
        await requestApi("POST", "/role-student", {
          role: role, 
          student: studentId,
          session: sessionId,
        });
        console.log(role, studentId, sessionId)
        toast.success("Attendance Logged");
      } else {
        toast.error("Attendance already logged");
      }

      setAttendanceData((prev) => {
        if (isChecked) {
          return prev.filter(
            (record) =>
              !(record.student === studentId && record.session === sessionId)
          );
        } else {
          return [...prev, { student: studentId, session: sessionId }];
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

  return (
    <div className="attendance-container">
      <h2>Role Students Attendance (Session Wise)</h2>

      <div className="flex-box">
        <h4>NIP / Re Appear Student List</h4>

        <div>
          <InputBox
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: "300px" }}
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="att-table">
        <table className="custom-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Register Number</th>
              {sessions.map((session) => (
                <th key={session.id}>Attendance</th>
              ))}
            </tr>
          </thead>
          <tbody>
          {filterData
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((row, index) => (
    <tr key={row.id}>
      <td>{page * rowsPerPage + index + 1}</td>
      <td>{row.name}</td>
      <td>{row.register_number}</td>
      {sessions.map((session) => (
        <td key={session.id}>
          <div className="checkbox-wrapper-12">
            <div className="cbx">
              <input
                id={`cbx-${row.id}-${session.id}`}
                type="checkbox"
                checked={attendanceData.some(
                  (record) =>
                    record.student === row.id &&
                    record.session === session.id
                )}
                onChange={(event) =>
                  handleCheckboxClick(event, row.id, session.id)
                }
                disabled={false}
              />
              <label htmlFor={`cbx-${row.id}-${session.id}`}></label>
              <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                <path d="M2 8.36364L6.23077 12L13 2"></path>
              </svg>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
              <defs>
                <filter id="goo-12">
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="4"
                    result="blur"
                  ></feGaussianBlur>
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7"
                    result="goo-12"
                  ></feColorMatrix>
                  <feBlend in="SourceGraphic" in2="goo-12"></feBlend>
                </filter>
              </defs>
            </svg>
          </div>
        </td>
      ))}
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
  );
}

export default RoleAttendance;
