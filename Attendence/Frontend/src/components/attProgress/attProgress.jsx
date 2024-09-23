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
} from "@mui/material";
import moment from "moment";

const TableLayout = ({ studentId, date, year, register_number, type }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [progressValue1, setProgressValue1] = useState(0);
  const [progressValue2, setProgressValue2] = useState(0);
  const [tooltipTime1, setTooltipTime1] = useState("");
  const [tooltipTime2, setTooltipTime2] = useState("");
  const today = moment().format("YYYY-MM-DD");
  const currentTime = moment();

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
        // Reset tooltip values and progress bars when date changes
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
            progress1 = 1;
            setTooltipTime1(detail.time); // Set tooltip time for morning session
            foundProgress1 = true;
          }
          if (time >= "12:00:00" && time <= "14:00:00") {
            progress2 = 1;
            setTooltipTime2(detail.time); // Set tooltip time for afternoon session
            foundProgress2 = true;
          }
        }
      });

      // If no data found for progress1 or progress2, set to "No Data"
      if (!foundProgress1) setTooltipTime1("No Data");
      if (!foundProgress2) setTooltipTime2("No Data");

      setProgressValue1(progress1);
      setProgressValue2(progress2);
    };

    fetchAttendanceDetails();
  }, [register_number, date]); // Ensure it runs when date changes

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

  const renderAttendanceStatus = (slotId, slotStartTime) => {
    const slotData = attendanceData.find((slot) => slot.slot_id === slotId);
    const faculty = slotData && slotData.is_present === 1 ? slotData.faculty : "No Faculty Data"; // Get faculty data

    if (!slotData) return null;

    const slotTime = moment(slotStartTime, "HH:mm:ss");
    const tooltip = <p style={{ color: 'white' }}>{faculty}</p>;

    if (type === 1 && date === today) {
      if (
        slotTime.isBefore(currentTime) &&
        progressValue1 === 1 &&
        !isAfternoon(slotStartTime)
      ) {
        return (
          <Tooltip title={tooltip}>
            <img src={approve} alt="Present" height="20px" />
          </Tooltip>
        );
      }
      if (
        slotTime.isBefore(currentTime) &&
        progressValue2 === 1 &&
        isAfternoon(slotStartTime)
      ) {
        return (
          <Tooltip title={tooltip}>
            <img src={approve} alt="Present" height="20px" />
          </Tooltip>
        );
      }
      if (progressValue1 === 0 && !isAfternoon(slotStartTime)) {
        return (
          <Tooltip title={tooltip}>
            <img src={decline} alt="Absent" height="20px" />
          </Tooltip>
        );
      }
      if (progressValue2 === 0 && isAfternoon(slotStartTime)) {
        return (
          <Tooltip title={tooltip}>
            <img src={decline} alt="Absent" height="20px" />
          </Tooltip>
        );
      }
    }

    if (date !== today) {
      if (progressValue1 === 1 && !isAfternoon(slotStartTime)) {
        return (
          <Tooltip title={tooltip}>
            <img src={approve} alt="Present" height="20px" />
          </Tooltip>
        );
      }
      if (progressValue2 === 1 && isAfternoon(slotStartTime)) {
        return (
          <Tooltip title={tooltip}>
            <img src={approve} alt="Present" height="20px" />
          </Tooltip>
        );
      }
    }

    return slotData.is_present === 1 ? (
      <Tooltip title={tooltip}>
        <img src={approve} alt="Present" height="20px" />
      </Tooltip>
    ) : (
      <Tooltip title={tooltip}>
        <img src={decline} alt="Absent" height="20px" />
      </Tooltip>
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
                <Tooltip title={`Attendance Time: ${tooltipTime1 || "No Data"}`}>
                  <Box sx={{ flexGrow: 1 }}>
                    <BorderLinearProgress
                      variant="determinate"
                      value={progressValue1 * 100}
                    />
                  </Box>
                </Tooltip>
              </th>
              <th colSpan={anSlots.length} className="header">
                <Tooltip title={`Attendance Time: ${tooltipTime2 || "No Data"}`}>
                  <Box sx={{ flexGrow: 1 }}>
                    <BorderLinearProgress
                      variant="determinate"
                      value={progressValue2 * 100}
                    />
                  </Box>
                </Tooltip>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableLayout;
