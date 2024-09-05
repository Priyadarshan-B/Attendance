import React, { useEffect, useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextField } from "@mui/material";
import Button from "../../components/Button/Button";
import Select from "react-select";
import customStyles from "../../components/applayout/selectTheme";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../../components/utils/axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import moment from "moment";
import "./leave.css";

function Leave() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Body />
    </LocalizationProvider>
  );
}

function Body() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [reason, setReason] = useState("");
  const [leaveDetails, setLeaveDetails] = useState([]);
  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);

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

  useEffect(() => {
    requestApi("GET", "/leave-type").then((response) =>
      setLeaveTypes(response.data)
    );
    fetchLeaveDetails();
  }, [id]);

  const handleFromDateChange = (newValue) => {
    setFromDate(newValue);
    if (isSameDate(newValue, new Date())) {
      setFromTime(new Date());
    } else {
      setFromTime(null);
    }
  };

  const handleToDateChange = (newValue) => {
    setToDate(newValue);
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) {
      return false;
    }
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const resetForm = () => {
    setFromDate(null);
    setToDate(null);
    setFromTime(null);
    setToTime(null);
    setReason("");
    setSelectedLeaveType(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const startDateTime = moment(fromDate)
    .set({
      hour: fromTime?.getHours() || 0,
      minute: fromTime?.getMinutes() || 0,
    })
    .toDate();
  
  const endDateTime = moment(toDate)
    .set({
      hour: toTime?.getHours() || 0,
      minute: toTime?.getMinutes() || 0,
    })
    .toDate();

    const timeDifference = moment.duration(moment(endDateTime).diff(moment(startDateTime))).asMinutes();

    if (timeDifference < 480) {
        toast.error("The end date and time must be at least 8 hours after the start date and time.");
        return;
    }

    const data = {
      student: parseInt(id),
      leave: selectedLeaveType ? selectedLeaveType.value : null,
      from_date: fromDate ? format(fromDate, "dd/MM/yyyy") : null,
      from_time: fromTime ? format(fromTime, "HH:mm:ss") : null,
      to_date: toDate ? format(toDate, "dd/MM/yyyy") : null,
      to_time: toTime ? format(toTime, "HH:mm:ss") : null,
      reason: reason, 
    };
    console.log(data);

    requestApi("POST", `/leave?student=${id}`, data)
      .then((response) => {
        console.log("Leave applied successfully:", response.data);
        toast.success(`${selectedLeaveType?.label} Applied successfully!`);
        fetchLeaveDetails();
        resetForm();
      })
      .catch((error) => {
        console.error("Error applying leave:", error);
        toast.error(`${selectedLeaveType?.label} Failed to Apply`);
      });
  };

  const formatLeaveDate = (date) => {
    return moment(date).format("DD/MM/YYYY");
  };
  const formatLeaveTime = (time) => {
    return moment(time, "HH:mm:ss").format("hh:mm A");
  };
  const now = new Date();

  return (
    <div className="leave-flex">
      <div className="leave-form">
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "var(--background-2)",
            padding: "5px",
            borderRadius: "5px",
            boxShadow:
              "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              padding: "5px",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              borderRadius: "5px",
            }}
          >
            <p
              style={{ fontSize: "35px", color: "#2c7cf3", fontWeight: "700" }}
            >
              <p>Apply Leave</p>
            </p>

            <p style={{ color: "#2c7cf3" }}>
              <p>fill all the fields carefully</p>
            </p>
          </div>
          <div className="form-container">
            <div
              style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  zIndex: "500",
                }}
              >
                <Select
                  options={leaveTypes.map((leave) => ({
                    value: leave.id,
                    label: leave.type,
                  }))}
                  value={selectedLeaveType}
                  styles={customStyles} 
                  onChange={setSelectedLeaveType}
                  placeholder=" Leave Type"
                  required
                  isClearable
                />
              </div>
              <br />
              <div>
                <DatePicker
                  label="From Date"
                  sx={{ width: "100%" }}
                  value={fromDate}
                  onChange={handleFromDateChange}
                  renderInput={(params) => <TextField {...params} />}
                  inputFormat="dd/MM/yyyy"
                  minDate={now}

                />
              </div>
              <div>
                <TimePicker
                  label="From Time"
                  sx={{ width: "100%" }}
                  value={fromTime}
                  onChange={(newValue) => setFromTime(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                minTime={isSameDate(fromDate, new Date()) ? new Date() : null}
                  disabled={!fromDate}
                />
              </div>
              <div>
                <DatePicker
                  label="To Date"
                  value={toDate}
                  sx={{ width: "100%" }}
                  onChange={(newValue) => setToDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                  inputFormat="dd/MM/yyyy"
                  minDate={fromDate}

                />
              </div>
              <div>
                <TimePicker
                  label="To Time"
                  value={toTime}
                  sx={{ width: "100%" }}
                  onChange={(newValue) => setToTime(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </div>
            </div>
            <div style={{ flex: "1" }}>
              <div>
                <TextField
                  label="Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  required
                />
              </div>
            </div>
          </div>
          <hr style={{ borderColor: "#ffffff" }} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" label="Submit" />
          </div>
        </form>
      </div>
      <div className="leave-detail">
        <h3>Leave Details</h3>
        <hr></hr>
        <div className="leave-data">
          {leaveDetails.length > 0 ? (
            leaveDetails.map((leave, index) => (
              <div
                key={index}
                className="leave-row"
                style={{
                  backgroundColor:'var(--background-1)'
                }}
              >
                <div>
                  <b>{leave.type}</b>
                </div>

                <div style={{ backgroundColor: "gray" }}>
                  <div style={{ display: "flex", width: "100%", gap: "2px" }}>
                    <div
                      style={{
                        display: "flex",
                        flex: "1",
                        flexDirection: "column",
                        padding: "10px",
                        backgroundColor:'var(--background-1)'
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
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flex: "1",
                        flexDirection: "column",
                        padding: "10px",
                        backgroundColor:'var(--background-1)'
                      }}
                    >
                      <div className="space">
                        <b>To date:</b> {formatLeaveDate(leave.to_date)}
                      </div>
                      <div className="space">
                        <b>To time:</b> {formatLeaveTime(leave.to_time)}
                      </div>
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
                  }}
                >
                  <div>
                    {leave.status === "2" ? (
                      <b className="leave-b" >Approval Pending</b>
                    ) : leave.status === "3" ? (
                      <b className="leave-b">Rejected</b>
                    ) : leave.status === "1" ? (
                      <b className="leave-b">Approved!!</b>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No leave applied.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leave;