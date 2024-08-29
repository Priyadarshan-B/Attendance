import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import "./mdashboard.css";
import AttendanceChart from "../Chart/attendance";
import Groups2TwoToneIcon from "@mui/icons-material/Groups2TwoTone";
import EventAvailableTwoToneIcon from "@mui/icons-material/EventAvailableTwoTone";
import EventBusyTwoToneIcon from "@mui/icons-material/EventBusyTwoTone";
import MentorStudentsTable from "./students";
import RStudentTable from "./regular";
import AbsentTable from "./absent";
import AttendanceTable from "./attendees";
import Type2Table from "./type2";

function Mdashboard() {
  return <AppLayout body={<Body />} />;
}

function Body() {
  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);
  const [scount, setSCount] = useState(0);
  const [tcount, setTCount] = useState(0);
  const [subCount, SetsubCount] = useState(0);
  const [regcount, setRegCount] = useState(0);
  const [type2count, setType2Count] = useState(0);
  const [tabCount, setTAbCount] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState('mentees');

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
            backgroundColor: "white",
            cursor: "pointer",
          }}
          onClick={() => handleClick("mentees")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#9a9a9a",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "#2a3645",
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
            backgroundColor: "white",
            cursor: "pointer",
          }}
          onClick={() => handleClick("monitoring")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "gold",
              padding: "10px",
              backgroundColor: "#f9eac4",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "gold",
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
            backgroundColor: "white",
            cursor:'pointer'
          }}
          onClick={() => handleClick("attendees")}
        >
          <EventAvailableTwoToneIcon
            style={{
              fontSize: "40px",
              color: "green",
              padding: "10px",
              backgroundColor: "#a9f2a4",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "green",
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
            backgroundColor: "white",
            cursor: "pointer",
          }}
          onClick={() => handleClick("absent")}
        >
          <EventBusyTwoToneIcon
            style={{
              fontSize: "40px",
              color: "red",
              padding: "10px",
              backgroundColor: "#f0b5b5",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "red",
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
            backgroundColor: "white",
            cursor: "pointer",
          }}
          onClick={() => handleClick("regular")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#9a9a9a",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "#2a3645",
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
            backgroundColor: "white",
            cursor: "pointer",
          }}
          onClick={() => handleClick("nip")}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "#2a3645",
              padding: "10px",
              backgroundColor: "#9a9a9a",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "#2a3645",
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
        <div className="s-table">
          {selectedComponent === "mentees" && (
            <MentorStudentsTable mentor={id} />
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
  );
}

export default Mdashboard;
