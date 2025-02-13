import React, { useEffect, useState } from "react";
import moment from "moment";
import requestApi from "../../components/utils/axios";
import "./approval.css";
import toast from "react-hot-toast";
import noResult from "../../assets/no-results.png";
import Popup from "../../components/popup/popup";
import { ThemeProviderComponent } from "../../components/applayout/dateTheme";
import { TextField } from "@mui/material";
import { decryptData } from "../../components/utils/encrypt";

function LeaveDetails() {
  return (
    <ThemeProviderComponent>
      <Body />
    </ThemeProviderComponent>
  );
}

function Body() {
  const [leaveDetails, setLeaveDetails] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const encryptedData = localStorage.getItem("D!");
  const decryptedData = decryptData(encryptedData);
  const { id: id } = decryptedData;
  const handleOpen = (leave) => {
    setSelectedLeave(leave);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLeave(null);
    setRejectionReason("");
  };

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        const response = await requestApi("GET", `/leave?mentor=${id}`);
        setLeaveDetails(response.data);
      } catch (error) {
        console.error("Error fetching leave details:", error);
      }
    };

    fetchLeaveDetails();
  }, [id]);

  const handleApprove = async (studentId, leaveId) => {
    try {
      const data = {
        student: studentId,
        id: leaveId,
      };
      await requestApi("PUT", "/leave", data);
      toast.success("Leave Approved!..");
      const response = await requestApi("GET", `/leave?mentor=${id}`);
      setLeaveDetails(response.data);
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Approve Failed..");
    }
  };

  const handleReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        toast.error("Please provide a reason for rejection.");
        return;
      }
      const { student_id, leave_id } = selectedLeave;
      const data = {
        student: student_id,
        id: leave_id,
        reason: rejectionReason,
      };
      await requestApi("PUT", "/reject-leave", data);
      toast.success("Leave Rejected!..");
      const response = await requestApi("GET", `/leave?mentor=${id}`);
      setLeaveDetails(response.data);
      handleClose();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error("Reject Failed..");
    }
  };

  return (
    <div>
      {leaveDetails.length > 0 ? (
        <div className="leave-container">
          {leaveDetails.map((leave) => (
            <div className="leave-box" key={leave.leave_id}>
              <div className="leave-card">
                <h3>Leave Type - {leave.type}</h3>
                <p>
                  <strong>Student Name:</strong> {leave.student_name}
                </p>
                <p>
                  <strong>Register Number:</strong> {leave.register_number}
                </p>
                <p>
                  <strong>From:</strong>{" "}
                  {moment(leave.from_date).format("YYYY-MM-DD")} -{" "}
                  <strong>Time:</strong> {leave.from_time}
                </p>
                <p>
                  <strong>To:</strong>{" "}
                  {moment(leave.to_date).format("YYYY-MM-DD")} -{" "}
                  <strong>Time:</strong> {leave.to_time}
                </p>
                <p>
                  <strong>Reason:</strong> {leave.reason}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="approve-button"
                    onClick={() =>
                      handleApprove(leave.student_id, leave.leave_id)
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleOpen(leave)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="noresult">
          <img src={noResult} alt="" height="200px" width="200px" />
          <p>No Records Found..</p>
        </div>
      )}

      {selectedLeave && (
        <Popup
          open={open}
          onClose={handleClose}
          title="Reason For Rejection"
          text={
            <div>
              <p>Are you sure?</p>
              <div>
                <TextField
                  label="Reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  multiline
                  rows={4}
                  variant="outlined"
                  required
                />
              </div>
            </div>
          }
          onConfirm={handleReject}
        />
      )}
    </div>
  );
}

export default LeaveDetails;
