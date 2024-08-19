import React, { useEffect, useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import "../Stu_Dashboard/stu_dashboard.css";
import Chart from "react-apexcharts";
import LiquidGauge from "react-liquid-gauge";
import moment from "moment";
import EventAvailableTwoToneIcon from "@mui/icons-material/EventAvailableTwoTone";
import EventBusyTwoToneIcon from "@mui/icons-material/EventBusyTwoTone";
import calendar from "../../assets/calendar.png";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import Select from "react-select";

function Student() {
  return <AppLayout rId={2} body={<Body />} />;
}

function Body() {
  const [yearOptions, setYearOptions] = useState([
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentDetails, setStudentDetails] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [attendancePercent, setAttendancePercent] = useState({});
  const [percent, setPercent] = useState([]);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pageNip, setPageNip] = useState(0);
  const [rowPage, setRowPage] = useState(5);

  function calculateTimeLeft() {
    const now = new Date();
    const nextWednesday = new Date(
      now.setDate(now.getDate() + ((3 + 7 - now.getDay()) % 7 || 7))
    );
    nextWednesday.setHours(0, 0, 0, 0);
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

  useEffect(() => {
    const fetchStudentOptions = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/all-students?year=${selectedYear}`
        );
        const students = response.data.map((student) => ({
          value: student.id,
          label: `${student.name}-${student.register_number}`,
        }));
        setStudentOptions(students);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    if (selectedYear) {
      fetchStudentOptions();
    }
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedStudent) return;

    const fetchStudentData = async () => {
      try {
        const studentResponse = await requestApi(
          "GET",
          `/student-details?id=${selectedStudent}`
        );
        setStudentDetails(studentResponse.data[0]);

        const attendanceResponse = await requestApi(
          "GET",
          `/percent?student=${selectedStudent}`
        );
        setAttendancePercent(attendanceResponse.data);
        setPercent(parseFloat(attendanceResponse.data.attendance_percentage));
        
        const attendanceRecordsResponse = await requestApi(
          "GET",
          `/type2_attendence?student=${selectedStudent}`
        );
        setAttendanceRecords(attendanceRecordsResponse.data);

        const attendanceDetailsResponse = await requestApi(
          "GET",
          `/att-details?student=${studentResponse.data[0].register_number}`
        );
        if (attendanceDetailsResponse.data.error) {
          setAttendanceDetails([]);
          console.log(attendanceDetailsResponse.data.error); 
        } else {
          setAttendanceDetails(attendanceDetailsResponse.data);
        }

        const leaveDetailsResponse = await requestApi(
          "GET",
          `/leave-student?student=${selectedStudent}`
        );
        setLeaveDetails(leaveDetailsResponse.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedStudent]);

  const todayDate = new Date()
    .toLocaleDateString("en-GB")
    .split("/")
    .join(" / ");
  const todayAttendance = attendanceDetails.filter(
    (detail) => detail.date === todayDate
  );
  const otherAttendance = attendanceDetails.filter(
    (detail) => detail.date !== todayDate
  );

  const timeIntervals = [
    { start: "08:00:00 AM", end: "10:00:00 AM" },
    { start: "12:00:00 PM", end: "03:00:00 PM" },
    { start: "07:00:00 PM", end: "09:00:00 PM" },
  ];

  const isTimeInRange = (time, start, end) => {
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes, seconds] = time.split(":");

      if (hours === "12") {
        hours = "00";
      }

      if (modifier === "PM") {
        hours = parseInt(hours, 10) + 12;
      }

      return `${hours}:${minutes}:${seconds}`;
    };

    const t = new Date(`1970-01-01T${parseTime(time)}Z`);
    const s = new Date(`1970-01-01T${parseTime(start)}Z`);
    const e = new Date(`1970-01-01T${parseTime(end)}Z`);

    return t >= s && t <= e;
  };

  const uniqueIntervals = timeIntervals.reduce((count, interval) => {
    if (
      todayAttendance.some((detail) =>
        isTimeInRange(detail.time, interval.start, interval.end)
      )
    ) {
      return count + 1;
    }
    return count;
  }, 0);

  const radialChartData = {
    series: [(uniqueIntervals / 3) * 100],
    options: {
      chart: {
        height: 300,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          track: {
            background: "#f5f5f5",
            strokeWidth: "100%",
          },
          dataLabels: {
            name: {
              fontSize: "22px",
              color: "black",
              offsetY: 0,
            },
            value: {
              color: "#111",
              fontSize: "16px",
              show: false,
              formatter: function (val) {
                return parseInt(val);
              },
            },
          },
        },
      },
      fill: {
        colors: ["#00E396"],
      },
      stroke: {
        lineCap: "round",
      },
      labels: [`${uniqueIntervals}/3`],
    },
  };

  const formatLeaveDate = (date, time) => {
    return (
      moment(date).format("DD/MM/YYYY") +
      " " +
      moment(time, "HH:mm:ss").format("hh:mm A")
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handlePage = (event, newPage1) => {
    setPageNip(newPage1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeRowsPage = (event) => {
    setRowPage(parseInt(event.target.value, 10));
    setPageNip(0);
  };

  return (
    <div>
      <div className="dropdown">
        <div className="label-dropdown">
          <h4>Year</h4>
          <div
            style={{
              flex: "1",
            }}
          >
            <Select
              options={yearOptions}
              onChange={(option) => setSelectedYear(option?.value)}
              placeholder="Select Year"
            />
          </div>
        </div>
        <div className="label-dropdown">
          <h4>Student</h4>
          <div
            style={{
              flex: "1",
            }}
          >
            <Select
              options={studentOptions}
              onChange={(option) => setSelectedStudent(option?.value)}
              placeholder="Select Student"
              isDisabled={!selectedYear}
            />
          </div>
        </div>
      </div>
      {!selectedStudent ? (
        <div>Select a student to view details.</div>
      ) : !studentDetails ? (
        <div>Loading...</div>
      ) : (
        <>
          <h3>
            Biometric Details - {studentDetails.name} (
            {studentDetails.register_number}){" "}
          </h3>
          <div className="attendance-percentage-and-status">
            <div className="student-details-container">
              <div className="guage">
                <h3>Attendance Percentage</h3>
                <br />
                <div>
                  <LiquidGauge
                    value={percent ?? 0}
                    width={200}
                    height={150}
                    waveFrequency={2}
                    waveAmplitude={5}
                    waveAnimation={true}
                    waveCount={10}
                    circleStyle={{
                      fill: "#55e77a",
                    }}
                    waveStyle={{
                      fill: "#35dc61",
                    }}
                  />
                </div>
              </div>
              <div
                className="student-details "
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
                }}
              >
                <div className="detail-row">
                  <div className="detail-label">Name:</div>
                  <div className="detail-value">{studentDetails.name}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Register Number:</div>
                  <div className="detail-value">
                    {studentDetails.register_number}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Attendance Status:</div>
                  <div className="detail-value">
                    {studentDetails.att_status === "1" ? (
                      <span>
                        <h5 style={{ color: "#4dcd6e" }}>Approved..</h5>
                      </span>
                    ) : (
                      <h5 className="n_approve">Pending Approval..</h5>
                    )}
                  </div>
                </div>
                {studentDetails.att_status === "1" && (
                  <div className="detail-row">
                    <div className="detail-label">Time Left:</div>
                    <div
                      className="time"
                      style={{
                        color: "#4c91e2",
                        fontSize: "17px",
                        fontWeight: "600",
                      }}
                    >
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
                      {timeLeft.seconds}s
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="attendance-percent-container">
              <h3>Attendance Details</h3>
              <hr />
              <br />

              {<div className="attendance-summary">
                <div className="summary-item">
                  <div className="icons-flex">
                    <EventAvailableTwoToneIcon
                      style={{
                        color: "#4dcd6e",
                        fontSize: "50px",
                      }}
                    />
                    <p>
                      <h4>Present</h4>
                    </p>
                    <b>{attendancePercent?.present_days ?? "N/A"}</b>
                    </div>
                </div>
                <div className="summary-item">
                  <div className="icons-flex">
                    <EventBusyTwoToneIcon
                      style={{
                        color: "#ff6968",
                        fontSize: "50px",
                      }}
                    />
                    <p>
                      <h4>Absent</h4>
                    </p>
                    <b>{attendancePercent?.absent_days ?? "N/A"}</b>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="icons-flex">
                    <div>
                      <img
                        src={calendar}
                        alt="Total Days"
                        style={{
                          width: "45px",
                        }}
                      ></img>
                    </div>
                    <p>
                      <h4>Total Days</h4>
                    </p>
                    <b>{attendancePercent?.current_days ?? "N/A"}</b>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="icons-flex">
                    <div>
                      <img
                        src={calendar}
                        alt="Total Days"
                        style={{
                          width: "45px",
                        }}
                      ></img>
                    </div>
                    <p>
                      <h4>Total Days (Sem)</h4>
                    </p>
                    <b>{attendancePercent?.total_days ?? "N/A"}</b>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="icons-flex">
                    <div>
                      <img
                        src={calendar}
                        alt="Total Days"
                        style={{
                          width: "45px",
                        }}
                      ></img>
                    </div>
                    <p>
                      <h4>Attendance (%)</h4>
                    </p>
                    <b>{attendancePercent?.attendance_percentage ?? "N/A"}</b>
                  </div>
                </div>
              </div>}
            </div>
          </div>

          <div className="att_det">
            <div className="leave-details">
              <h3>Leave Details</h3>
              <hr></hr>
              {leaveDetails.length > 0 ? (
                leaveDetails.map((leave, index) => (
                  <div key={index} className="leave-row">
                    <div className="space">
                      <b>Type:</b> {leave?.type ?? "N/A"} <br />
                    </div>
                    <div className="space">
                      <b>From:</b>{" "}
                      {formatLeaveDate(leave?.from_date ?? "N/A", leave?.from_time?? "N/A")} <br />
                    </div>
                    <div className="space">
                      <b>To:</b> {formatLeaveDate(leave?.to_date ?? "N/A", leave?.to_time ?? "N/A")}
                    </div>
                    <hr style={{ width: "100%" }} />
                  </div>
                ))
              ) : (
                <p>No leave applied.</p>
              )}
            </div>
            <div className="att_det_today">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  width: "90%",
                  boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
                }}
              >
                <h4>Today's Biometric Details - {todayDate}</h4>
                {todayAttendance.length > 0 ? (
                  todayAttendance.map((detail, index) => (
                    <div key={index} className="attendance-row">
                      <b>Time</b> - {detail?.time ?? "N/A"}
                    </div>
                  ))
                ) : (
                  <p>No attendance recorded for today.</p>
                )}
              </div>
              <div className="radial-chart">
                <h3>
                  <center>Attendance Count</center>
                </h3>
                <Chart
  options={radialChartData?.options ?? {}}
  series={radialChartData?.series ?? []}
  type="radialBar"
  height={300}
/>
              </div>
            </div>

            <div className="att_det_others">
              <h3>
                <center>Biometric History</center>
              </h3>
              <br />
              {otherAttendance.length > 0 ?(<div style={{
            width:'100%'
          }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Date</b>
                    </TableCell>
                    <TableCell>
                      <b>Time</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {otherAttendance
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.date}</TableCell>
                        <TableCell>{detail.time}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={otherAttendance.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </div>):(
              <p>No attendance recorded for today.</p>

          )}
            </div>
          </div>

          {studentDetails.type === 2 && (
            <div className="type2-table">
              <h3>NIP/ Re-Appear Attendance Records</h3>
              {attendanceRecords.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <b>Faculty</b>
                        </TableCell>
                        <TableCell>
                          <b>Slots</b>
                        </TableCell>
                        <TableCell>
                          <b>Attendance Session</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords
                        .slice(pageNip * rowPage, pageNip * rowPage + rowPage)
                        .map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{record.name}</TableCell>
                            <TableCell>{record.label}</TableCell>
                            <TableCell>
                              {new Date(record.att_session).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={attendanceRecords.length}
                    rowsPerPage={rowPage}
                    page={pageNip}
                    onPageChange={handlePage}
                    onRowsPerPageChange={handleChangeRowsPage}
                  />
                </TableContainer>
              ) : (
                <p>No records found</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Student;
