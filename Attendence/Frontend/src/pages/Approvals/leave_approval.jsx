import React, { useEffect, useState } from "react";
import moment from "moment";
import Cookies from 'js-cookie';
import requestApi from "../../components/utils/axios";
import "./approval.css";

const LeaveDetails = () => {
  const [leaveDetails, setLeaveDetails] = useState([]);
  const id = Cookies.get('id');

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
        student:studentId,
        id:leaveId
      }
      console.log(data)
      await requestApi("PUT", "/leave", data);
      alert("Leave approved successfully!");
      const response = await requestApi("GET", `/leave?mentor=${id}`);
      setLeaveDetails(response.data);
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Error approving leave. Please try again.");
    }
  };
  const handleReject = async (studentId, leaveId) => {
    try {
      const data = {
        student:studentId,
        id:leaveId
      }
      console.log(data)
      await requestApi("PUT", "/reject-leave", data);
      alert("Leave Rejected successfully!");
      const response = await requestApi("GET", `/leave?mentor=${id}`);
      setLeaveDetails(response.data);
    } catch (error) {
      console.error("Error Rejecting leave:", error);
      alert("Error Rejecting leave. Please try again.");
    }
  };

  return (
    <div className="leave-container">
      {leaveDetails.map((leave) => (
      
        <div>
          {/* <h3>Leave / OD details - {leave.student_name} ({leave.register_number})</h3> */}
          <div className="leave-card" key={leave.leave_id}>
            <h3>Leave Type - {leave.type}</h3>
            <p>
              <strong>Student Name:</strong> {leave.student_name}
            </p>
            <p>
              <strong>Register Number:</strong> {leave.register_number}
            </p>
            
            <p>
              <strong>From:</strong> {moment(leave.from_date).format("YYYY-MM-DD")} -  <strong>Time:</strong> {leave.from_time}
            </p>
            <p>
              <strong>To:</strong> {moment(leave.to_date).format("YYYY-MM-DD")} - <strong>Time:</strong> {leave.to_time}
            </p>
            <div style={{
              display:'flex',
              gap:'10px'
            }}>
              <button
                className="approve-button"
                onClick={() => handleApprove(leave.student_id, leave.leave_id)}
              >
                Approve
              </button>
              <button
                className="reject-button"
                onClick={() => handleReject(leave.student_id, leave.leave_id)}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaveDetails;
