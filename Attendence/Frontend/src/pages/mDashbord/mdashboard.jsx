import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import "./mdashboard.css";
import AttendanceChart from "../Chart/attendance";
import InputBox from "../../components/TextBox/textbox";
import Groups2TwoToneIcon from "@mui/icons-material/Groups2TwoTone";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TablePagination,
} from "@mui/material";

function Mdashboard() {
  return <AppLayout body={<Body />} />;
}

function Body() {
  const deid = Cookies.get("id");
  const secretKey = "secretKey123";
  const id = CryptoJS.AES.decrypt(deid, secretKey).toString(CryptoJS.enc.Utf8);
  const [scount, setSCount] = useState(0);
  const [todayAtt, setTodayAtt] = useState([]);
  const [tcount, setTCount] = useState(0);
  const [subCount, SetsubCount] = useState(0);
  const [regcount, setRegCount] = useState(0)
  const [type2count, setType2Count] = useState(0)
  const [todayAb, setTodayAb] = useState([]);
  const [tabCount, setTAbCount] = useState(0);
  const [pageAbsent, setPageAbsent] = useState(0);
  const [rowsPerPageAbsent, setRowsPerPageAbsent] = useState(5);
  const [pagePresent, setPagePresent] = useState(0);
  const [rowsPerPagePresent, setRowsPerPagePresent] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPre, setSearchPre] = useState("");
  const [showAbsentTable, setShowAbsentTable] = useState(false); // State to control which table is shown

  const fetchStudentDetails = async () => {
    try {
      const response = await requestApi("GET", `/mdash?mentor=${id}`);
      setSCount(response.data.student_count);
      setTodayAtt(response.data.today_attendance_records);
      SetsubCount(response.data.sub_mentor)
      setTCount(response.data.today_attendance_count);
      setTodayAb(response.data.today_absent_records);
      setTAbCount(response.data.todat_absent);
      setRegCount(response.data.regular_students)
      setType2Count(response.data.type2_students)
    } catch (err) {
      console.error("Error Fetching Students Details", err);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const handleAbsenteesClick = () => {
    setShowAbsentTable(!showAbsentTable);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchPreChange = (event) => {
    setSearchPre(event.target.value);
  };

  const handleChangePageAbsent = (event, newPage) => {
    setPageAbsent(newPage);
  };

  const handleChangeRowsPerPageAbsent = (event) => {
    setRowsPerPageAbsent(parseInt(event.target.value, 10));
    setPageAbsent(0);
  };

  const handleChangePagePresent = (event, newPage) => {
    setPagePresent(newPage);
  };

  const handleChangeRowsPerPagePresent = (event) => {
    setRowsPerPagePresent(parseInt(event.target.value, 10));
    setPagePresent(0);
  };

  const filteredTodayAb = todayAb.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTodayPre = todayAtt.filter((record) =>
    record.name.toLowerCase().includes(searchPre.toLowerCase())
  );

  return (
    <div>
      <div className="count-box">
        <div
          className="count"
          style={{
            // boxShadow: "#93d0fd 0px 1px 4px",
            backgroundColor: "white",
          }}
        >
          <Groups2TwoToneIcon
            style={{
              fontSize: "40px",
              color: "blue",
              padding: "10px",
              backgroundColor: "#93d0fd",
              borderRadius: "100%",
            }}
          />
          <div className="img-no">
            <p
              className="count-p"
              style={{
                color: "blue",
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
            // boxShadow: "#f0b5b5 0px 1px 4px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
          // onClick={handleAbsenteesClick}
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
            // boxShadow: "#a9f2a4 0px 1px 4px",
            backgroundColor: "white",
          }}
        >
          <Groups2TwoToneIcon
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
          onClick={handleAbsenteesClick}
        >
          <Groups2TwoToneIcon
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
            // boxShadow: "#f0b5b5 0px 1px 4px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
          // onClick={handleAbsenteesClick}
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
              {regcount}
            </p>
            <p>Monitoring</p>
          </div>
        </div>
        <div
          className="count"
          style={{
            // boxShadow: "#f0b5b5 0px 1px 4px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
          // onClick={handleAbsenteesClick}
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
              {type2count}
            </p>
            <p>Monitoring</p>
          </div>
        </div>
      
      </div>
      <div className="ch-table">
        <div className="att-chart">
          <AttendanceChart mentorId={id} />
        </div>

        {!showAbsentTable && (
          <div className="ab-table">
            <InputBox
              placeholder="Search by Name"
              value={searchPre}
              onChange={handleSearchPreChange}
              style={{
                marginBottom: "16px",
                width: "300px",
                border: "none",
                boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
              }}
            />
            <TableContainer component={Paper}>
              <Table className="custom-table">
                <TableHead sx={{ backgroundColor: "#2a3645" }}>
                  <TableRow>
                  <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      S.No
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      Register Number
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTodayPre
                    .slice(
                      pagePresent * rowsPerPagePresent,
                      pagePresent * rowsPerPagePresent + rowsPerPagePresent
                    )
                    .map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index+1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.register_number}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTodayPre.length}
                rowsPerPage={rowsPerPagePresent}
                page={pagePresent}
                onPageChange={handleChangePagePresent}
                onRowsPerPageChange={handleChangeRowsPerPagePresent}
              />
            </TableContainer>
          </div>
        )}

        {showAbsentTable && (
          <div className="ab-table">
            <InputBox
              placeholder="Search by Name"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                marginBottom: "16px",
                width: "300px",
                border: "none",
                boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
              }}
            />
            <TableContainer component={Paper}>
              <Table className="custom-table">
                <TableHead sx={{ backgroundColor: "#2a3645" }}>
                  <TableRow>
                  <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      S.No
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      Register Number
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTodayAb
                    .slice(
                      pageAbsent * rowsPerPageAbsent,
                      pageAbsent * rowsPerPageAbsent + rowsPerPageAbsent
                    )
                    .map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index+1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.register_number}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTodayAb.length}
                rowsPerPage={rowsPerPageAbsent}
                page={pageAbsent}
                onPageChange={handleChangePageAbsent}
                onRowsPerPageChange={handleChangeRowsPerPageAbsent}
              />
            </TableContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mdashboard;
