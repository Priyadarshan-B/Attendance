import React, { useState, useEffect } from "react";
import requestApi from "../../components/utils/axios";
import "./mdashboard.css";
import AttendanceChart from "../Chart/attendance";
import Groups2TwoToneIcon from "@mui/icons-material/Groups2TwoTone";
import EventAvailableTwoToneIcon from "@mui/icons-material/EventAvailableTwoTone";
import EventBusyTwoToneIcon from "@mui/icons-material/EventBusyTwoTone";
import MentorStudentsTable from "./students";
import RStudentTable from "./regular";
import AbsentTable from "./absent";
import AttendanceTable from "./attendees";
import Approvals from "../Approvals/approval";
import Type2Table from "./type2";
import { getDecryptedCookie } from "../../components/utils/encrypt";
import Cookies from "js-cookie";
import Attendance from "../Attendance/attendance";

function Mdashboard() {
  return <Body />;
}
function Body() {
  const id = getDecryptedCookie("id");
  const [scount, setSCount] = useState(0);
  const [tcount, setTCount] = useState(0);
  const [subCount, SetsubCount] = useState(0);
  const [regcount, setRegCount] = useState(0);
  const [type2count, setType2Count] = useState(0);
  const [tabCount, setTAbCount] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState("mentees");

  const fetchStudentDetails = async () => {
    try {
      const response = await requestApi("GET", `/mdash?mentor=${id}`);
      setSCount(response.data.student_count);
      SetsubCount(response.data.sub_mentor);
      setTCount(response.data.today_attendance_count);
      setTAbCount(response.data.todat_absent);
      setRegCount(response.data.regular_students);
      setType2Count(response.data.type2_students);
    } catch (err) {
      console.error("Error Fetching Students Details", err);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const handleClick = (component) => {
    setSelectedComponent(component);
  };

  return (
    <div>
      <div className="count-box">
        <div
          className="count"
          style={{
            cursor: "pointer",
            backgroundColor: "var(--background-2)",
          }}
          onClick={() => handleClick("mentees")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#f9eac4",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "var(--text)",
              }}
            >
              {scount}
            </p>
            <p>Mentees</p>
          </div>
        </div>
        <div
          className="count"
          style={{
            backgroundColor: "var(--background-2)",
            cursor: "pointer",
          }}
          onClick={() => handleClick("monitoring")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#f9eac4",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "var(--text)",
              }}
            >
              {subCount}
            </p>
            <p>Monitoring</p>
          </div>
        </div>
        <div
          className="count"
          style={{
            backgroundColor: "var(--background-2)",
            cursor: "pointer",
          }}
          onClick={() => handleClick("attendees")}
        >
          <EventAvailableTwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#a9f2a4",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "var(--text)",
              }}
            >
              {tcount}
            </p>
            <p>Attendees</p>
          </div>
        </div>
        <div
          className="count"
          style={{
            backgroundColor: "var(--background-2)",
            cursor: "pointer",
          }}
          onClick={() => handleClick("absent")}
        >
          <EventBusyTwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#f07070",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "var(--text)",
              }}
            >
              {tabCount}
            </p>
            <p>Absentees</p>
            <p></p>
          </div>
        </div>
        <div
          className="count"
          style={{
            backgroundColor: "var(--background-2)",
            cursor: "pointer",
          }}
          onClick={() => handleClick("regular")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#f9eac4",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "var(--text)",
              }}
            >
              {regcount}
            </p>
            <p>Regular</p>
          </div>
        </div>
        <div
          className="count"
          style={{
            backgroundColor: "var(--background-2)",
            cursor: "pointer",
          }}
          onClick={() => handleClick("nip")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#f9eac4",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "var(--text)",
              }}
            >
              {type2count}
            </p>
            <p>NIP/Arrear</p>
          </div>
        </div>
      </div>
      <div className="ch-table">
        <div className="att-chart">
          <AttendanceChart mentorId={id} />
        </div>
        <div className="student-table">
          <div className="s-table">
            {selectedComponent === "mentees" && (
              <Approvals />
            )}
            {selectedComponent === "attendees" && (
              <AttendanceTable mentorId={id} />
            )}
            {selectedComponent === "absent" && <AbsentTable mentorId={id} />}
            {selectedComponent === "regular" && <RStudentTable mentor={id} />}
            {selectedComponent === "nip" && <Type2Table mentor={id} />}
          </div>

         
        </div>
      </div>
      <br />
      <div className="attendance">
            <center>Attendance</center>
            <br />
            <Attendance />
          </div>
    </div>
  );
}

export default Mdashboard;
