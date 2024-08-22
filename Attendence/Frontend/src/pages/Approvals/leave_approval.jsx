import React, { useEffect, useState } from "react";
import moment from "moment";
import Cookies from 'js-cookie';
import CryptoJS from "crypto-js";
import requestApi from "../../components/utils/axios";
import "./approval.css";
import toast from "react-hot-toast";
import AppLayout from "../../components/applayout/AppLayout";
import '../../components/applayout/styles.css'

function LeaveDetails(){
return <AppLayout body= {<Body/>}/>
}

function Body () {
  const [leaveDetails, setLeaveDetails] = useState([]);
  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8)


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
      toast.success("Leave Approved!..")
      const response = await requestApi("GET", `/leave?mentor=${id}`);
      setLeaveDetails(response.data);
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Approve Failed..")
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
      toast.success("Leave Rejected!..")
      const response = await requestApi("GET", `/leave?mentor=${id}`);
      setLeaveDetails(response.data);
    } catch (error) {
      console.error("Error Rejecting leave:", error);
      toast.error("Error Rejecting leave")
    }
  };

  return (
    <div>
     {leaveDetails.length >0 ? <div className="leave-container">
        {leaveDetails.map((leave) => (
      
          <div>
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
              <p>
                <strong>Reason:</strong>  {leave.reason}
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
    :<div>No Records Found..</div>  
    }
    </div>
  );
};

export default LeaveDetails;
