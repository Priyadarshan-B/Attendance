import React, { useState, useEffect } from "react";
import requestApi from "../../components/utils/axios";
import toast from "react-hot-toast";
import moment from "moment";
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
import { getDecryptedCookie } from "../../components/utils/encrypt";

function calculateTimeLeft(dueDate) {
  const now = moment();
  const due = moment(dueDate);
  const duration = moment.duration(due.diff(now));

  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  let timeLeft = { days, hours, minutes, seconds };

  if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) {
    timeLeft.isNegative = true;
  }

  return timeLeft;
}

function formatTimeLeft(timeLeft) {
  if (timeLeft.isNegative) {
    return `Overdue by ${Math.abs(timeLeft.days)}d ${Math.abs(
      timeLeft.hours
    )}h ${Math.abs(timeLeft.minutes)}m`;
  }
  return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
}

function Approvals() {
  return (
       <Body />
);
}


function Body() {
  const [students, setStudents] = useState([]);
  const [showLeave, setShowLeave] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const id = getDecryptedCookie("id");
  const [searchTerm, setSearchTerm] = useState("");
  const [openApprovePopup, setOpenApprovePopup] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [performanceChecked, setPerformanceChecked] = useState(false);
  const [appearanceChecked, setAppearanceChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState({});
  const [openExtend, setOpenExtend] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      updateTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, [filteredStudents]);

  useEffect(() => {
    fetchStudents();
    const timer = setInterval(() => {
      updateTimeLeft();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchStudents = () => {
    requestApi("GET", `/mentor-students?mentor=${id}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          setStudents(response.data);
          setFilteredStudents(response.data);
          updateTimeLeft(response.data);
        } else {
          console.error("API response is not an array:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching students:", error));
  };

  const updateTimeLeft = (studentsData = filteredStudents) => {
    const updatedTimeLeft = {};
    studentsData.forEach((student) => {
      updatedTimeLeft[student.id] = calculateTimeLeft(student.due_date);
    });
    setTimeLeft(updatedTimeLeft);
  };

  const handleApprove = (studentId) => {
    setSelectedStudentId(studentId);
    setOpenApprovePopup(true);
  };

  const handleExtend = (studentId) => {
    setSelectedStudentId(studentId);
    setOpenExtend(true);
  };

  const handleConfirmApprove = () => {
    if (performanceChecked && appearanceChecked) {
      const studentId = selectedStudentId;
      const url = `/att-approve?student=${studentId}`;

      requestApi("PUT", url)
        .then(() => {
          const updatedStudents = filteredStudents.map((student) => {
            if (student.id === studentId) {
              student.att_status = "1";
            }
            return student;
          });
          setFilteredStudents(updatedStudents);
          setStudents(updatedStudents);
          updateTimeLeft(updatedStudents);
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
    setSelectedStudentId(null);
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
    updateTimeLeft(filtered); // Recalculate time left for filtered students
  };

  const handleExpand = () => {
    if (selectedStudentId) {
      setLoading((prevLoading) => ({
        ...prevLoading,
        [selectedStudentId]: true,
      }));

      const url = `/nxt-wed?id=${selectedStudentId}`;

      requestApi("PUT", url)
        .then(() => {
          toast.success("Extended 7 days😁..");
          fetchStudents();
        })
        .catch((error) => {
          console.error(`Error updating due date to next Wednesday:`, error);
          toast.error("Error Expanding 7 days..");
        })
        .finally(() => {
          setLoading((prevLoading) => ({
            ...prevLoading,
            [selectedStudentId]: false,
          }));
        });

      setOpenExtend(false);
      setSelectedStudentId(null);
    } else {
      console.error("No student ID found");
    }
  };

  if (showLeave) {
    return <LeaveDetails />;
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
            style={{width:'300px'}}
          />
        </div>
        <div className="table-container">
          <Paper>
            <TableContainer>
              <Table className="custom-table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "10px" }}>
                      <b>S.No</b>
                    </TableCell>
                    <TableCell sx={{ width: "10px" }}>
                      <b>Year</b>
                    </TableCell>
                    <TableCell sx={{ width: "10px", whiteSpace:'nowrap'  }}>
                      <b>Name</b>
                    </TableCell>
                    <TableCell sx={{ width: "0px" }}>
                      <b>Register Number</b>
                    </TableCell>
                    <TableCell sx={{ width: "10px", textAlign: "center" }}>
                      <b>Actions</b>
                    </TableCell>
                    <TableCell sx={{ width: "10px" , whiteSpace:'nowrap'}}>
                      <b>Time Left</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          {student.year}
                        </TableCell>
                        <TableCell>
                          {student.name}
                        </TableCell>
                        <TableCell>
                          {student.register_number}
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
                                onClick={() => handleApprove(student.id)}
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
                                onClick={() => handleExtend(student.id)}
                                disabled={loading[student.id]}
                              >
                                Extend
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.att_status === "1" ? (
                            <div
                              style={{
                                color: timeLeft[student.id]?.isNegative
                                  ? "red"
                                  : timeLeft[student.id]?.days > 2
                                  ? "green"
                                  : "black",
                                  border: timeLeft[student.id]?.isNegative
                                  ? "1px solid red"
                                  : timeLeft[student.id]?.days > 2
                                  ? "1px solid green"
                                  : "1px solid #ffd691",
                                borderRadius: "20px",
                                padding: "2px",
                                textAlign: "center",
                                backgroundColor: timeLeft[student.id]?.isNegative
                                  ? "#fde8e8"
                                  : timeLeft[student.id]?.days > 2
                                  ? "#d5f7da"
                                  : "#fff5e4",
                              }}
                            >
                              <p style={{color:"black"}}>
                                {timeLeft[student.id]
                                  ? formatTimeLeft(timeLeft[student.id])
                                  : "Calculating..."}
                              </p>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                backgroundColor: 'var(--text)',
                '.MuiTablePagination-toolbar': {
                  backgroundColor: 'var(--background-1)',
                },
                // Customizing the arrow icon color
                '.MuiTablePagination-actions svg': {
                  color: 'var(--text)',  // Replace this with the desired color
                },
                '.MuiSelect-icon': {
                  color: 'var(--text)',  // This changes the color of the select dropdown icon
                },
              }}
            />
          </Paper>
        </div>
      </div>
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
      <Popup
        open={openExtend}
        onClose={() => setOpenExtend(false)}
        onConfirm={handleExpand}
        text={
          <p>
            Are you sure you want to extend this student's due date by 7 days?
          </p>
        }
      />
    </div>
  );
}

export default Approvals;
