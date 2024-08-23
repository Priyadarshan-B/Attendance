import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Checkbox,
} from "@mui/material";
import InputBox from "../../components/TextBox/textbox";
import Popup from "../../components/popup/popup";
import LeaveDetails from "./leave_approval";
import Button from "../../components/Button/Button";
import "./approval.css";

function calculateTimeLeft() {
  const getNextWednesday = () => {
    const now = new Date();
    const nextWednesday = new Date(
      now.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7 || 7))
    );
    nextWednesday.setHours(0, 0, 0, 0);
    return nextWednesday;
  };

  const nextWednesday = getNextWednesday();
  const difference = +nextWednesday - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
}

function Approvals() {
  return <AppLayout rId={1} body={<Body />} />;
}

function Body() {
  const [students, setStudents] = useState([]);
  const [showLeave, setShowLeave] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const id = Cookies.get("id");
  const secretKey = "secretKey123";
  const deid = CryptoJS.AES.decrypt(id, secretKey).toString(CryptoJS.enc.Utf8);
  const [searchTerm, setSearchTerm] = useState("");
  const [openApprovePopup, setOpenApprovePopup] = useState(false);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(null);
  const [performanceChecked, setPerformanceChecked] = useState(false);
  const [appearanceChecked, setAppearanceChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    requestApi("GET", `/mentor-students?mentor=${deid}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
        } else {
          console.error("API response is not an array:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (showLeave) {
    return <LeaveDetails />;
  }

  const handleApprove = (index) => {
    setSelectedStudentIndex(index);
    setOpenApprovePopup(true);
  };

  const handleConfirmApprove = () => {
    if (performanceChecked && appearanceChecked) {
      const updatedStudents = [...filteredStudents];
      const student = updatedStudents[selectedStudentIndex];
      const url = `/att-approve?student=${student.id}`;

      requestApi("PUT", url)
        .then(() => {
          updatedStudents[selectedStudentIndex].att_status = "1";
          setFilteredStudents(updatedStudents);
          setStudents(updatedStudents);
        })
        .catch((error) =>
          console.error(`Error updating student approval status:`, error)
        );
    } else {
      alert("Please check both Performance and Appearance to approve.");
    }
    handleCloseApprovePopup();
  };

  const handleCloseApprovePopup = () => {
    setOpenApprovePopup(false);
    setSelectedStudentIndex(null);
    setPerformanceChecked(false);
    setAppearanceChecked(false);
  };

  const handleCheckboxChange = (event, type) => {
    if (type === "performance") {
      setPerformanceChecked(event.target.checked);
    } else if (type === "appearance") {
      setAppearanceChecked(event.target.checked);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(value) ||
        student.register_number.toLowerCase().includes(value)
    );
    setFilteredStudents(filtered);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Students Attendance Approvals</h2>
        </div>
        <div>
          <InputBox
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search.."
          />
        </div>
        <Paper className="table-container">
          <TableContainer>
            <Table className="custom-table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "10%" }}>
                    <h3>S.No</h3>
                  </TableCell>
                  <TableCell >
                    <h3>Name</h3>
                  </TableCell>
                  <TableCell>
                    <h3>Register Number</h3>
                  </TableCell>
                  <TableCell>
                    <h3>Actions</h3>
                  </TableCell>
                  <TableCell>
                    <h3>Time Left</h3>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student, index) => (
                    <TableRow key={student.register_number}>
                      <TableCell>
                        <b>{page * rowsPerPage + index + 1}</b>
                      </TableCell>
                      <TableCell>
                        <b>{student.name}</b>
                      </TableCell>
                      <TableCell>
                        <b>{student.register_number}</b>
                      </TableCell>
                      <TableCell>
                        <button
                          className="status-button"
                          style={{
                            backgroundColor:
                              student.att_status === "1"
                                ? "#e6faf0"
                                : "#fde8e8", 
                            color: 
                              student.att_status === '1'
                           ? "#2ECC71"
                           :"red", 
                          //  border: '0.1px solid ',
                          //   borderColor:
                          //     student.att_status === "1"
                          //       ? "#90e9bb"
                          //       : "#f49998", 
                            cursor:
                              student.att_status === "1"
                                ? "not-allowed"
                                : "pointer", // Disable pointer when status is "1"
                          }}
                          onClick={() => handleApprove(index)}
                          disabled={student.att_status === "1"} // Disabled when status is "1"
                        >
                          {student.att_status === "1" ? "Approved" : "Approve"}
                        </button>
                      </TableCell>
                      <TableCell>
                        {student.att_status === "1" ? (
                          <span style={{
                            color:'black'
                          }} >
                            <p className="time">
                              {timeLeft.days}d {timeLeft.hours}h{" "}
                              {timeLeft.minutes}m {timeLeft.seconds}s
                            </p>
                          </span>
                        ) : (
                          "--"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 25]}
            component="div"
            count={students.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </div>
      {/* Approve Popup */}
      <Popup
        open={openApprovePopup}
        onClose={handleCloseApprovePopup}
        onConfirm={handleConfirmApprove}
        text={
          <div>
            <p>
              Are you sure you want to approve this student's biometric
              attendance?
            </p>
            <div>
              <Checkbox
                checked={performanceChecked}
                onChange={(e) => handleCheckboxChange(e, "performance")}
              />
              Performance
            </div>
            <div>
              <Checkbox
                checked={appearanceChecked}
                onChange={(e) => handleCheckboxChange(e, "appearance")}
              />
              Appearance
            </div>
          </div>
        }
      />
    </div>
  );
}

export default Approvals;
