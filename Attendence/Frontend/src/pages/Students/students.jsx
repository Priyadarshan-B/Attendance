import React, { useEffect, useState } from "react";
import requestApi from "../../components/utils/axios";
import "../Stu_Dashboard/stu_dashboard.css";
import Chart from "react-apexcharts";
import LiquidGauge from "react-liquid-gauge";
import moment from "moment";
import EventAvailableTwoToneIcon from "@mui/icons-material/EventAvailableTwoTone";
import EventBusyTwoToneIcon from "@mui/icons-material/EventBusyTwoTone";
import MilitaryTechTwoToneIcon from "@mui/icons-material/MilitaryTechTwoTone";
import Groups2TwoToneIcon from "@mui/icons-material/Groups2TwoTone";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EmojiEventsTwoToneIcon from "@mui/icons-material/EmojiEventsTwoTone";
import { RiWaterPercentFill } from "react-icons/ri";
import { BsFillCalendar2MonthFill } from "react-icons/bs";
import { LuCalendarRange } from "react-icons/lu";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import CountUp from "react-countup";
import Loader from "../../components/Loader/loader";
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

function StudentDashboard({ id, roll }) {
  return <Body id={id} roll={roll} />;
}

function Body({ id, roll }) {
  const [studentDetails, setStudentDetails] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [placement, setPlacement] = useState([]);
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [attendancePercent, setAttendancePercent] = useState({});
  const [percent, setPercent] = useState([]);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [roleatt, setRoleAtt] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [pageNip, setPageNip] = useState(0);
  const [rowPage, setRowPage] = useState(5);

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

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await requestApi("GET", `/student-details?id=${id}`);
        const studentData = response.data;
        setStudentDetails(studentData);

        updateTimeLeft(studentData.due_date);

        fetchAttendancePercent(response.data.type);
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };
    const updateTimeLeft = (dueDate) => {
      const updatedTimeLeft = calculateTimeLeft(dueDate);
      setTimeLeft(updatedTimeLeft);
    };

    const fetchPlacementData = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/placement-student?student=${id}`
        );
        setPlacement(response.data[0]);
      } catch (error) {
        console.error("Error fetching placement data", error);
      }
    };
    const fetchAttendancePercent = async () => {
      try {
        const response = await requestApi("GET", `/percent?student=${id}`);

        const {
          present_days,
          absent_days,
          total_days,
          current_days,
          attendance_percentage,
          present_absent,
        } = response.data;

        setAttendancePercent({
          present_days: parseInt(present_days),
          absent_days,
          total_days,
          current_days,
          attendance_percentage,
          present_absent,
        });

        setPercent(parseFloat(attendance_percentage));

      } catch (error) {
        console.error("Error fetching attendance percent details:", error);
      }
    };

    const fetchAttendanceRecords = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/type2_attendence?student=${id}`
        );
        setAttendanceRecords(response.data);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      }
    };

    const fetchRoleAtt = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/role-attendance?student=${id}`
        );
        setRoleAtt(response.data);
      } catch (error) {
        console.error("Error fetching role attendance records:", error);
      }
    };

    const fetchAttendanceDetails = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/att-details?student=${roll}`
        );
        if (response.data.error) {
          setAttendanceDetails([]);
          console.log(response.data.error);
        } else {
          setAttendanceDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching attendance details:", error);
        setAttendanceDetails([]);
      }
    };

    const fetchLeaveDetails = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/leave-student?student=${id}`
        );
        setLeaveDetails(response.data);
      } catch (error) {
        console.error("Error fetching leave details:", error);
      }
    };

    fetchStudentDetails();
    fetchAttendanceRecords();
    fetchAttendanceDetails();
    fetchLeaveDetails();
    fetchPlacementData();
    fetchRoleAtt();

    const timer = setInterval(() => {
      if (studentDetails && studentDetails.due_date) {
        setTimeLeft(calculateTimeLeft(studentDetails.due_date));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [roll, id]);

  if (!studentDetails) {
    return <Loader/>;
  }

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
          hollow: {
            size: "50%",
          },
          startAngle: -135,
          endAngle: 135,
          track: {
            background: "#d1e1f5",
            strokeWidth: "100%",
          },
          dataLabels: {
            name: {
              offsetY: 0,
              color: "var(--text)",
              fontSize: "20px",
            },
            value: {
              color: "var(--text)",
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

  const formatLeaveDate = (date) => {
    return moment(date).format("DD/MM/YYYY");
  };
  const formatLeaveTime = (time) => {
    return moment(time, "HH:mm:ss").format("hh:mm A");
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
    <div className="dashboard-flex">
      <div className="attendance-percentage-and-status">
        <div className="student-details-container">
          <div className="check-in">
            <div className="detail">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <InfoTwoToneIcon style={{ color: "var(--text)" }} />
                Ensure Attendance in
              </div>
              Biometrics,&nbsp;
              {studentDetails.type === 2 ? "Hour Attendance," : ""}              
              {studentDetails.roles}
            </div>
          </div>
          <hr style={{ width: "100%" }} />
          <h3
            style={{
              backgroundColor: "#2a3645",
              padding: "10px",
              margin: "0px 0px 0px 0px",
              border: "1px solid black",
              borderRadius: "5px",
              color: "#ffff",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              textAlign: "center",
              width: "93%",
              marginBottom: "10px",
            }}
          >
            Attendance Details
          </h3>
          <div className="guage">
            <div>
              <LiquidGauge
                value={percent}
                width={200}
                height={150}
                waveFrequency={2}
                waveAmplitude={5}
                waveAnimation={true}
                textStyle={{
                  fill: 'var(--text)',
                  
                }}
                waveTextStyle={{
                  fill: 'var(--text)', // Change this to your desired color
                }}
                waveCount={10}
                textRenderer={(props) => {
                  const value =(props.value);
                  const radius = Math.min(props.height / 2, props.width / 2);
                  const textPixels = (props.textSize * radius / 2);
                  const valueStyle = {
                      fontSize: textPixels
                  };
                  const percentStyle = {
                      fontSize: textPixels * 0.6
                  };

                  return (
                      <tspan>
                          <tspan className="value" style={valueStyle}>{value}</tspan>
                          <tspan style={percentStyle}>{props.percent}</tspan>
                      </tspan>
                  );
              }}
                circleStyle={{
                  fill: percent < 80 ? "#ff6968" : "#55e77a",
                }}
                waveStyle={{
                  fill: percent < 80 ? "#ff6968" : "#35dc61",
                }}
              />
            </div>
          </div>
          <div className="student-details">
            <div className="detail-row">
              <div className="detail-label">Register Number:</div>
              <div className="detail-value">
                <p>{studentDetails.register_number}</p>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Attendance Status:</div>
              <div className="detail-value">
                {studentDetails.att_status === "1" ? (
                  <span>
                    <h5 style={{ color: "#00bb00" }}>Approved..</h5>
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
                  {timeLeft ? formatTimeLeft(timeLeft) : "Calculating..."}
                </div>
              </div>
            )}

            <div className="detail-row">
              <div className="detail-label">Today's Attendance (P|P):</div>
              <div
                className="tim"
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                }}
              >
                {attendancePercent.present_absent &&
                  attendancePercent.present_absent.length > 0 &&
                  attendancePercent.present_absent.map((attendance, index) => {
                    const forenoonStatus =
                      attendance.forenoon === "1" ? "PR" : "AB";
                    const afternoonStatus =
                      attendance.afternoon === "1" ? "PR" : "AB";
                    return (
                      <h4 key={index}>
                        {forenoonStatus} | {afternoonStatus}
                      </h4>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        <div className="attendance-percent-container">
          <h3
            style={{
              backgroundColor: "#2a3645",
              padding: "10px",
              margin: "0px 0px 0px 0px",
              border: "1px solid black",
              borderRadius: "5px",
              color: "#ffff",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              textAlign: "center",
            }}
          >
            Attendance & Placement Details
          </h3>

          <div className="attendance-summary">
            <div
              className="summary-item"
              style={
                {
                  // backgroundColor: "#dcffd6",
                  // border: "1px solid #4ddc72",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <EventAvailableTwoToneIcon
                    style={{
                      color: "#4dcd6e",
                      fontSize: "30px",
                    }}
                  />
                  <p>
                    <h5>Present Days</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                  }}
                >
<b>{isNaN(attendancePercent.present_days) ? 0 : attendancePercent.present_days}</b>
</div>
              </div>
            </div>
            <div
              className="summary-item"
              style={
                {
                  // backgroundColor: "#ffe5e5",
                  // border: "1px solid red ",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <EventBusyTwoToneIcon
                    style={{
                      color: "#ff6968",
                      fontSize: "30px",
                    }}
                  />
                  <p>
                    <h5>Absent Days</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                  }}
                >
                  <b>{attendancePercent.absent_days}</b>
                </div>
              </div>
            </div>
            <div
              className="summary-item"
              style={
                {
                  // backgroundColor: "#fff5e4",
                  // border: "1px solid #ffd691 ",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <div>
                    <BsFillCalendar2MonthFill
                      style={{
                        color: "#ffb22f",
                        fontSize: "25px",
                      }}
                    />
                  </div>
                  <p>
                    <h5>Total Days</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                  }}
                >
                  <b>{attendancePercent.current_days}</b>
                </div>
              </div>
            </div>
            <div className="summary-item">
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <div>
                    <LuCalendarRange
                      style={{
                        color: "var(--text)",
                        fontSize: "25px",
                      }}
                    />
                  </div>

                  <p>
                    <h5>Total Days (Sem)</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                  }}
                >
                  <b>{attendancePercent.total_days}</b>
                </div>
              </div>
            </div>
            <div
              className="summary-item"
              style={
                {
                  // backgroundColor: "#cdd8ff",
                  // border: "1px solid #2c7cf3 ",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <div>
                    <RiWaterPercentFill
                      style={{
                        color: "#2c7cf3",
                        fontSize: "35px",
                      }}
                    />
                  </div>
                  <p>
                    <h5>Attendance (%)</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                  }}
                >
                  <b>{attendancePercent.attendance_percentage}</b>
                </div>
              </div>
            </div>
            <div
              className="summary-item"
              style={
                {
                  // backgroundColor: "#f1ebff",
                  // border: "1px solid #ba9dff",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <MilitaryTechTwoToneIcon
                    style={{
                      color: "#2c7cf3",
                      fontSize: "35px",
                    }}
                  />
                  <p>
                    <h5>Placement Rank</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                    color: "#875eff",
                  }}
                >
                  <b>{placement.placement_rank}</b>
                </div>
              </div>
            </div>
            <div
              className="summary-item"
              style={
                {
                  // backgroundColor: "#e6fff5",
                  // border: "1px solid #5fffbf",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Groups2TwoToneIcon
                    style={{
                      color: "green",
                      fontSize: "30px",
                    }}
                  />
                  <p>
                    <h5>Placement Batch</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "30px",
                    marginTop: "10px",
                  }}
                >
                  <b>{placement.placement_group}</b>
                </div>
              </div>
            </div>
            <div
              className="summary-item"
              style={
                {
                  // border: "1px solid #343434",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <SportsScoreIcon
                    style={{
                      color: "var(--text)",
                      fontSize: "30px",
                    }}
                  />
                  <p>
                    <h5>Placement Score</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                  }}
                >
                  <b>{placement.placement_score}</b>
                </div>
              </div>
            </div>
            <div
              className="summary-item"
              style={
                {
                  // backgroundColor: "#ffff",
                  // border: "1px solid yellow",
                }
              }
            >
              <div className="icons-flex">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <EmojiEventsTwoToneIcon
                    style={{
                      color: "gold",
                      fontSize: "30px",
                    }}
                  />
                  <p>
                    <h5>Reward Points</h5>
                  </p>
                </div>
                <hr style={{ width: "100%" }} />
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "35px",
                    marginTop: "10px",
                  }}
                >
                  <b>
                    <CountUp
                      style={{
                        color: "var(--text)",
                        fontSize: "30px",
                      }}
                      end={placement.reward_points}
                      duration={2}
                    />
                    {/* {placement.reward_points} */}
                  </b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="att_det">
        <div className="leave-details">
          <h3
            style={{
              backgroundColor: "#2a3645",
              padding: "10px",
              margin: "0px 0px 0px 0px",
              border: "1px solid black",
              borderRadius: "5px",
              color: "#fff",
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              textAlign: "center",
            }}
          >
            Leave Details
          </h3>
          <div className="leave-data">
            {leaveDetails.length > 0 ? (
              leaveDetails.map((leave, index) => (
                <div
                  key={index}
                  className="leave-row"
                  style={{
                    backgroundColor: "var(--background-1)",
                  }}
                >
                  <div>
                    <b>{leave.type}</b>
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        gap: "15px",
                        flexDirection: "column",
                      }}
                    >
                      <div className="space">
                        <b>From date:</b> {formatLeaveDate(leave.from_date)}{" "}
                        <br />
                      </div>
                      <div className="space">
                        <b>From time:</b> {formatLeaveTime(leave.from_time)}{" "}
                        <br />
                      </div>

                      <div className="space">
                        <b>To date:</b> {formatLeaveDate(leave.to_date)}
                      </div>
                      <div className="space">
                        <b>To time:</b> {formatLeaveTime(leave.to_time)}
                      </div>
                    </div>
                  </div>
                  <div className="space reason">
                    <b>Reason:</b> {leave.reason} <br />
                  </div>
                  <div
                    className="space status"
                    style={{
                      backgroundColor:
                        leave.status === "2"
                          ? "#e5c137"
                          : leave.status === "3"
                          ? "#ec0041"
                          : leave.status === "1"
                          ? "#00ac3b"
                          : "transparent",
                      color: "white",
                    }}
                  >
                    {leave.status === "2" ? (
                      <b>Approval Pending</b>
                    ) : leave.status === "3" ? (
                      <b>Rejected</b>
                    ) : leave.status === "1" ? (
                      <b>Approved!!</b>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p>No leave applied.</p>
            )}
          </div>
        </div>
        <div className="att_det_today">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--background-1)",
              padding: "10px",
              borderRadius: "5px",
              width: "100%",
              border: "1px solid gray",
              maxHeight: "180px",
              overflowY: "scroll",
              overflowX: "hidden",
            }}
          >
            <h4>Today's Biometric Details - {todayDate}</h4>
            <hr style={{ width: "100%" }} />
            {todayAttendance.length > 0 ? (
              todayAttendance.map((detail, index) => (
                <div key={index} className="attendance-row">
                  <b>Time</b>
                  {detail.time}
                </div>
              ))
            ) : (
              <p>No attendance recorded for today.</p>
            )}
          </div>

          <div className="radial-chart">
            <h3>
              <center>Today's Biometrics</center>
            </h3>
            <Chart
              options={radialChartData.options}
              series={radialChartData.series}
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
          {otherAttendance.length > 0 ? (
            <div
              style={{
                width: "100%",
              }}
            >
              <TableContainer component={Paper}>
                <Table className="custom-table">
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
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>{detail.date}</TableCell>
                          <TableCell>{detail.time}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5]}
                  component="div"
                  count={otherAttendance.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    backgroundColor: "var(--text)", // Change this to the color you want
                    ".MuiTablePagination-toolbar": {
                      backgroundColor: "var(--background-1)", // If needed, apply to the toolbar as well
                    },
                  }}
                />
              </TableContainer>
            </div>
          ) : (
            <p>No attendance recorded for today.</p>
          )}
        </div>
      </div>

      <div className="att_table">
        {studentDetails.type === 2 && (
          <div
            style={{
              flex: "1",
              backgroundColor: "var(--background-2)",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <h3>NIP/ Re-Appear Attendance Records</h3>
            <br />
            {attendanceRecords.length > 0 ? (
              <TableContainer component={Paper}>
                <Table className="custom-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>S.No</b>
                      </TableCell>
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
                          <TableCell>{index + 1}</TableCell>
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
                  rowsPerPageOptions={[5]}
                  component="div"
                  count={attendanceRecords.length}
                  rowsPerPage={rowPage}
                  page={pageNip}
                  onPageChange={handlePage}
                  onRowsPerPageChange={handleChangeRowsPage}
                  sx={{
                    backgroundColor: "var(--text)",
                    ".MuiTablePagination-toolbar": {
                      backgroundColor: "var(--background-1)",
                    },
                  }}
                />
              </TableContainer>
            ) : (
              <p>No records found</p>
            )}
          </div>
        )}

        <div className="role" style={{ flex: "1" }}>
          <div
            style={{
              flex: "1",
              backgroundColor: "var(--background-2)",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <h3>Role Attendance Records</h3>
            <br />
            {roleatt.length > 0 ? (
              <TableContainer component={Paper}>
                <Table className="custom-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>S.No</b>
                      </TableCell>
                      <TableCell>
                        <b>Faculty</b>
                      </TableCell>
                      <TableCell>
                        <b>Attendance Session</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roleatt
                      .slice(pageNip * rowPage, pageNip * rowPage + rowPage)
                      .map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>
                            {new Date(record.attendance).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5]}
                  component="div"
                  count={attendanceRecords.length}
                  rowsPerPage={rowPage}
                  page={pageNip}
                  onPageChange={handlePage}
                  onRowsPerPageChange={handleChangeRowsPage}
                  sx={{
                    backgroundColor: "var(--text)",
                    ".MuiTablePagination-toolbar": {
                      backgroundColor: "var(--background-1)",
                    },
                  }}
                />
              </TableContainer>
            ) : (
              <p>No records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
