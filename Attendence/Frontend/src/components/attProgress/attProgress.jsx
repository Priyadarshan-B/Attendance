import React, { useEffect, useState } from "react";
import "./attProgress.css";
import requestApi from "../utils/axios";
import approve from "../../assets/approve.png";
import decline from "../../assets/decline.png";
import { styled } from "@mui/material/styles";
import {
  LinearProgress,
  Box,
  linearProgressClasses,
  Tooltip,
  ClickAwayListener,
  Button,
} from "@mui/material";
import moment from "moment";

const TableLayout = ({ studentId, date, year, register_number }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [progressValue1, setProgressValue1] = useState(0);
  const [progressValue2, setProgressValue2] = useState(0);
  const [tooltipTime1, setTooltipTime1] = useState("");
  const [tooltipTime2, setTooltipTime2] = useState("");
  const [tooltipOpen1, setTooltipOpen1] = useState(false); // Tooltip for bar chart
  const [tooltipOpen2, setTooltipOpen2] = useState(false); // Tooltip for bar chart
  const [facultyTooltipOpen, setFacultyTooltipOpen] = useState({}); // Tooltip for images

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "red",
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: "#89d215",
    },
  }));

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        setTooltipTime1("");
        setTooltipTime2("");
        setProgressValue1(0);
        setProgressValue2(0);

        const response = await requestApi(
          "GET",
          `/att-details?student=${register_number}`
        );
        const attendanceDetails = response.data;
        processAttendanceDetails(attendanceDetails);
      } catch (error) {
        console.error("Error fetching attendance details:", error);
      }
    };

    const processAttendanceDetails = (details) => {
      let progress1 = 0;
      let progress2 = 0;
      let foundProgress1 = false;
      let foundProgress2 = false;

      details.forEach((detail) => {
        if (detail.date_raw === date) {
          const attendanceDateTime = moment(detail.attendence_raw);
          const time = attendanceDateTime.format("HH:mm:ss");

          if (time >= "08:00:00" && time <= "08:45:00") {
            progress1 = 100;
            setTooltipTime1(detail.time); 
            foundProgress1 = true;
          }
          if (time >= "12:00:00" && time <= "14:00:00") {
            progress2 = 100;
            setTooltipTime2(detail.time);
            foundProgress2 = true;
          }
        }
      });

      if (!foundProgress1) setTooltipTime1("No Data");
      if (!foundProgress2) setTooltipTime2("No Data");

      setProgressValue1(progress1);
      setProgressValue2(progress2);
    };

    fetchAttendanceDetails();
  }, [register_number, date]); 

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await requestApi("GET", `/slot-year?year=${year}`);
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await requestApi(
          "GET",
          `/att-progress?student=${studentId}&date=${date}&year=${year}`
        );
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchTimeSlots();
    fetchAttendance();
  }, [studentId, date, year]);

  const isAfternoon = (time) => time >= "12:30:00";

  const fnSlots = timeSlots.filter((slot) => !isAfternoon(slot.start_time));
  const anSlots = timeSlots.filter((slot) => isAfternoon(slot.start_time));

  const totalSlots = [...fnSlots, ...anSlots];
  const columnLabels = totalSlots.map((_, index) => {
    const romanNumerals = [
      "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
    ];
    return romanNumerals[index % romanNumerals.length];
  });

  const handleTooltipOpen = (slotId) => {
    setFacultyTooltipOpen((prev) => ({ ...prev, [slotId]: true }));
  };

  const handleTooltipClose = (slotId) => {
    setFacultyTooltipOpen((prev) => ({ ...prev, [slotId]: false }));
  };

  const renderAttendanceStatus = (slotId, slotStartTime) => {
    const slotData = attendanceData.find((slot) => slot.slot_id === slotId);
    const faculty = slotData && slotData.is_present === 1 ? slotData.faculty : "No Faculty Data"; // Get faculty data

    if (!slotData) return null;

    const tooltip = <p style={{ color: 'white' }}>{faculty}</p>;

    return (
      <ClickAwayListener onClickAway={() => handleTooltipClose(slotId)}>
        <div>
          <Tooltip
            title={tooltip}
            open={facultyTooltipOpen[slotId] || false}
            onClick={() => handleTooltipOpen(slotId)}
          >
            <img
              src={slotData.is_present === 1 ? approve : decline}
              alt={slotData.is_present === 1 ? "Present" : "Absent"}
              height="20px"
              onClick={() => handleTooltipOpen(slotId)} // Open on click
            />
          </Tooltip>
        </div>
      </ClickAwayListener>
    );
  };

  return (
    <div>
      <div className="container1">
        <table>
          <thead>
            <tr>
              <th style={{ width: "20px" }} className="table-head">
                Session
              </th>
              <th colSpan={fnSlots.length} className="header1">
                FN
              </th>
              <th colSpan={anSlots.length} className="header">
                AN
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={{ width: "20px" }}>Period</th>
              {columnLabels.map((label, index) => (
                <td key={index}>{label}</td>
              ))}
            </tr>
            <tr>
              <th style={{ width: "20px" }}>Attendance</th>
              {fnSlots.map((slot) => (
                <td key={slot.id}>
                  {renderAttendanceStatus(slot.id, slot.start_time)}
                </td>
              ))}
              {anSlots.map((slot) => (
                <td key={slot.id}>
                  {renderAttendanceStatus(slot.id, slot.start_time)}
                </td>
              ))}
            </tr>
            <tr>
              <th style={{ width: "20px" }}>Biometrics</th>
              <th colSpan={fnSlots.length} className="header">
                <ClickAwayListener onClickAway={() => setTooltipOpen1(false)}>
                  <div>
                    <Tooltip
                      title={`Attendance Time: ${tooltipTime1 || "No Data"}`}
                      open={tooltipOpen1}
                      onClick={() => setTooltipOpen1((prev) => !prev)} // Toggle tooltip on click
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <BorderLinearProgress
                          variant="determinate"
                          value={progressValue1}
                        />
                      </Box>
                    </Tooltip>
                  </div>
                </ClickAwayListener>
              </th>
              <th colSpan={anSlots.length} className="header">
                <ClickAwayListener onClickAway={() => setTooltipOpen2(false)}>
                  <div>
                    <Tooltip
                      title={`Attendance Time: ${tooltipTime2 || "No Data"}`}
                      open={tooltipOpen2}
                      onClick={() => setTooltipOpen2((prev) => !prev)} // Toggle tooltip on click
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <BorderLinearProgress
                          variant="determinate"
                          value={progressValue2}
                        />
                      </Box>
                    </Tooltip>
                  </div>
                </ClickAwayListener>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableLayout;
