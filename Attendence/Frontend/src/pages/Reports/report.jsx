import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import requestApi from "../../components/utils/axios";
import Select from "react-select";
import Button from "../../components/Button/Button";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import customStyles from "../../components/applayout/selectTheme";
import "./report.css";
import { is } from "date-fns/locale";

function ReportPage() {
    return <Body />;
  }
  
  function Body() {
    const [absentYear, setAbsentYear] = useState();
    const [presentYear, setPresentYear] = useState();
    const [absentDate, setAbsentDate] = useState(null);
    const [presentDate, setPresentDate] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [slotYear, setSlotYear] = useState();
    const [slot, setSlot] = useState([]);
    const [slotOptions, setSlotOptions] = useState([]);
    const [absentSlotDate, setAbsentSlotDate] = useState(null);
    const [presentSlot, setPresentSlot] = useState([]);
    const [presentSlotYear, setPresentSlotYear] = useState(null);
    const [presentSlotDate, setPresentSlotDate] = useState(null);
    const [presentSlotOptions, setPresentSlotOptions] = useState([]);
  
    const handleDownload = async (type) => {
      try {
        let apiEndpoint;
        let fileName;
  
        if (type === "absent") {
          apiEndpoint = `/ab-report?year=${absentYear.value}&date=${formatDate(
            absentDate
          )}`;
          fileName = `studentsAbsent-${absentYear.value}-${formatDate(
            absentDate
          )}.xlsx`;
        } else if (type === "present") {
          apiEndpoint = `/pre-report?year=${presentYear.value}&date=${formatDate(
            presentDate
          )}`;
          fileName = `studentsPresent-${presentYear.value}-${formatDate(
            presentDate
          )}.xlsx`;
        } else if (type === "student") {
          const year = selectedYear?.value || "All";
          apiEndpoint = `/student-report?year=${year}`;
          fileName = `StudentReport-${year}.xlsx`;
        } else if (type === "absent-slot") {
          apiEndpoint = `/abs-report?year=${slotYear.value}&date=${formatDate(
            absentSlotDate
          )}&slot=${slot.value ||"All"}`;
          fileName = `studentsAbsent-${slotYear.value}-${formatDate(
            absentSlotDate
          )}.xlsx`;
        } else if (type === "present-slot") {
          apiEndpoint = `/pres-report?year=${presentSlotYear.value}&date=${formatDate(
            presentSlotDate
          )}&slot=${presentSlot.value ||"All"}`;
          fileName = `studentsPresent-${presentSlotYear.value}-${formatDate(
            presentSlotDate
          )}-${presentSlot.label ||"All"}.xlsx`;
        }
  
        if (!apiEndpoint || !fileName) return;
  
        const response = await requestApi("GET", apiEndpoint);
        let data = response.data;
  
        let workbook = XLSX.utils.book_new();
        let worksheet;
  
        if (type === "absent-slot") {
          const totalAbsentStudents = `Total Absent Students: ${data.total_absent_students}`;
          const totalAbsentRow = [totalAbsentStudents];
  
          const studentData = data.students.map(
            ({ student_id, ...rest }) => rest
          );
          const studentHeader = [
            "student_name",
            "register_number",
            "mail",
            "mentor_name"
          ];
          const studentRows = studentData.map(
            ({ student_name, register_number, mail, mentor_name }) => [
              student_name,
              register_number,
              mail,
              mentor_name,
            ]
          );
  
          worksheet = XLSX.utils.aoa_to_sheet([
            totalAbsentRow,
            [],
            [],
            ...[studentHeader, ...studentRows],
          ]);
        }
        else if(type === "present-slot") {
            const totalPresentStudents = `Total Present Students: ${data.total_present_students}`;
            const totalPresentRow = [totalPresentStudents];
    
            const studentData = data.students.map(
              ({ student_id, ...rest }) => rest
            );
            const studentHeader = [
              "student_name",
              "register_number",
              "mail",
              "mentor_name",
              "attendance_taken"
            ];
            const studentRows = studentData.map(
              ({ student_name, register_number, mail, mentor_name, attendance_taken }) => [
                student_name,
                register_number,
                mail,
                mentor_name,
                attendance_taken
              ]
            );
    
            worksheet = XLSX.utils.aoa_to_sheet([
              totalPresentRow,
              [],
              [],
              ...[studentHeader, ...studentRows],
            ]);
          }
        else {
          if (type === "student") {
            data = data.map(({ id, student, status, ...rest }) => rest);
          }
  
          worksheet = XLSX.utils.json_to_sheet(data);
        }
  
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, fileName);
      } catch (error) {
        console.error(`Error downloading the ${type} report`, error);
      }
    };
  
    useEffect(() => {
        if (slotYear) {
          fetchSlotOptions(slotYear.value, "absent");
        }
      }, [slotYear]);
    
      useEffect(() => {
        if (presentSlotYear) {
          fetchSlotOptions(presentSlotYear.value, "present");
        }
      }, [presentSlotYear]);

      const fetchSlotOptions = async (year, type) => {
        try {
          const response = await requestApi("GET", `/slot-year?year=${year}`);
          const slots = response.data.map((slot) => ({
            value: slot.id,
            label: slot.label,
          }));
      
          // Add the "All" option to the slot options
          const allOption = { value: "All", label: "All" };
          const updatedSlots = [allOption, ...slots];
      
          if (type === "absent") {
            setSlotOptions(updatedSlots);
          } else if (type === "present") {
            setPresentSlotOptions(updatedSlots);
          }
        } catch (error) {
          console.error("Error fetching slot options:", error);
        }
      };
  
    const formatDate = (date) => {
      if (!date) return "";
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
  
    const yearOptions = [
      { value: "All", label: "All" },
      { value: "I", label: "I" },
      { value: "II", label: "II" },
      { value: "III", label: "III" },
      { value: "IV", label: "IV" },
    ];
  return (
    <div className="report-container">
      <h2>Summary</h2>
      <div className="report-flex">
        <div className="absentReport" style={{ flex: "1" }}>
          <h3>Absentee Report</h3>
          <br />
          <div>
            <div className="select-date">
              <div style={{ flex: "1", width: "300px" }}>
                <Select
                  value={absentYear}
                  onChange={setAbsentYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", textAlign: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={absentDate}
                    onChange={(newValue) => setAbsentDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <Button
              onClick={() => handleDownload("absent")}
              label="Download Absent Report"
            />
          </div>
        </div>
        <div className="presentReport" style={{ flex: "1" }}>
          <h3>Present Report</h3>
          <br />
          <div>
            <div className="select-date">
              <div style={{ flex: "1", width: "300px" }}>
                <Select
                  value={presentYear}
                  onChange={setPresentYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", textAlign: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={presentDate}
                    onChange={(newValue) => setPresentDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <Button
              onClick={() => handleDownload("present")}
              label="Download Present Report"
            />
          </div>
        </div>
        <div className="presentReport">
          <h3>Student Report</h3>
          <br />
          <div className="select-year">
            <div style={{ flex: "1", width: "300px" }}>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
                styles={customStyles}
                placeholder="Select Year.."
                isClearable
              />
            </div>
            <Button
              onClick={() => handleDownload("student")}
              label="Download Student Report"
            />
          </div>
        </div>
        <div className="presentReport">
          <h3>Absent Report(Slot Wise)</h3>
          <br />
          <div className="select-year">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ flex: "1" }}>
                <Select
                  value={slotYear}
                  onChange={setSlotYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1" }}>
                <Select
                  value={slot}
                  onChange={setSlot}
                  options={slotOptions}
                  styles={customStyles}
                  placeholder="Select Slot.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", textAlign: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={absentSlotDate}
                    onChange={(newValue) => setAbsentSlotDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
            </div>
            <Button
              onClick={() => handleDownload("absent-slot")}
              label="Download Absent Slot Report"
            />
          </div>
        </div>
        <div className="presentReport">
        <h3>Present Report (Slot Wise)</h3>
        <br />
        <div className="select-year">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ flex: "1" }}>
              <Select
                value={presentSlotYear}
                onChange={setPresentSlotYear}
                options={yearOptions}
                styles={customStyles}
                placeholder="Select Year.."
                isClearable
              />
            </div>
            <div style={{ flex: "1" }}>
              <Select
                value={presentSlot}
                onChange={setPresentSlot}
                options={presentSlotOptions}
                styles={customStyles}
                placeholder="Select Slot.."
                isClearable
              />
            </div>
            <div style={{ flex: "1", textAlign: "center" }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={presentSlotDate}
                  onChange={(newValue) => setPresentSlotDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
          </div>
          <Button
            onClick={() => handleDownload("present-slot")}
            label="Download Present Slot Report"
          />
        </div>
      </div>
      </div>
    </div>
  );
}

export default ReportPage;
