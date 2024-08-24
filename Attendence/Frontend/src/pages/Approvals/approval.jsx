import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import toast from "react-hot-toast";
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
import "./approval.css";

function calculateTimeLeft(dueDate) {
  const difference = +new Date(dueDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  } else {
    timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
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
  const [timeLeft, setTimeLeft] = useState([]);
  const [disabledExpandButtons, setDisabledExpandButtons] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    requestApi("GET", `/mentor-students?mentor=${deid}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
          const initialTimeLeft = response.data.map((student) =>
            calculateTimeLeft(student.due_date)
          );
          setTimeLeft(initialTimeLeft);
        } else {
          console.error("API response is not an array:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching students:", error));
  }, [deid]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Update the time left for each student
      const updatedTimeLeft = filteredStudents.map((student) =>
        calculateTimeLeft(student.due_date)
      );
      setTimeLeft(updatedTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [filteredStudents]);

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
          toast.success("Approved!!");
        })
        .catch((error) => {
          console.error(`Error updating student approval status:`, error);
          toast.error("Approval Failed..");
        });
    } else {
      toast.error("Check All Boxes..");
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

  const handleExpand = (studentId, index) => {
    setLoading((prevLoading) => ({ ...prevLoading, [studentId]: true }));

    const url = `/nxt-wed?id=${studentId}`;

    requestApi("PUT", url)
      .then(() => {
        // alert("Updated to next Wednesday successfully.");
        toast.success("Added 7 days😁");
        const updatedTimeLeft = filteredStudents.map((student) =>
          calculateTimeLeft(student.due_date)
        );
        setTimeLeft(updatedTimeLeft);
      })
      .catch((error) => {
        console.error(`Error updating due date to next Wednesday:`, error);
        toast.error("Error Expanding 7 days..");
      })
      .finally(() => {
        setLoading((prevLoading) => ({ ...prevLoading, [studentId]: false }));
      });
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
                  <TableCell sx={{ width: "10px" }}>
                    <h3>S.No</h3>
                  </TableCell>
                  <TableCell sx={{ width: "10px" }}>
                    <h3>Year</h3>
                  </TableCell>
                  <TableCell sx={{ width: "10px" }}>
                    <h3>Name</h3>
                  </TableCell>
                  <TableCell sx={{ width: "0px" }}>
                    <h3>Register Number</h3>
                  </TableCell>
                  <TableCell sx={{ width: "10px", textAlign: "center" }}>
                    <h3>Actions</h3>
                  </TableCell>
                  <TableCell sx={{ width: "10px" }}>
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
                        <b>{student.year}</b>
                      </TableCell>
                      <TableCell>
                        <b>{student.name}</b>
                      </TableCell>
                      <TableCell>
                        <b>{student.register_number}</b>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          {student.att_status !== "1" ? (
                            <button
                              className="status-button"
                              style={{
                                backgroundColor: "#fde8e8",
                                color: "red",
                                cursor: "pointer",
                              }}
                              onClick={() => handleApprove(index)}
                            >
                              Over Due
                            </button>
                          ) : (
                            <button
                              className="status-button"
                              style={{
                                backgroundColor: loading[student.id]
                                  ? "#b0bec5"
                                  : "#c1e6ff ",
                                color: "#1738fd",
                                cursor: loading[student.id]
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                              onClick={() => handleExpand(student.id, index)}
                              disabled={loading[student.id]}
                            >
                              Extend
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.att_status === "1" ? (
                          <div style={{
                            color:timeLeft[index].days < 4
                            ? "red"
                            : timeLeft[index].days > 7
                            ? "green"
                            : "black",
                            borderRadius:'20px',
                            padding:'2px',
                            textAlign:'center',
                            backgroundColor:
                              timeLeft[index].days < 4
                                ? "#fde8e8"
                                : timeLeft[index].days > 7
                                ? "#e6fff2"
                                : "white",
                                border:
                                timeLeft[index].days < 4
                                  ? "1px solid red"
                                  : timeLeft[index].days > 7
                                  ? "1px solid green"
                                  : "white",
                          }}
                          >
                            <p className="time" >
                              {timeLeft[index].days}d {timeLeft[index].hours}h{" "}
                              {timeLeft[index].minutes}m{" "}
                            </p>
                          </div>
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
