import React ,{useState, useEffect}from "react";
import requestApi from "../../components/utils/axios";
import * as XLSX from "xlsx";
import Select from "react-select";
import Button from "../../components/Button/Button";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import customStyles from "../../components/applayout/selectTheme";
import moment from "moment";
import "./report.css";


function WithOutSlots(){
return <Body />;
}

function Body(){
    const [slotFDate, setSlotFDate] = useState()
      const [slotTDate, setslotTDate] = useState(new Date());
      const [wslotYear, setWSlotYear] = useState();

    const handleDownload = async(type) =>{

        try{
            let apiEndpoint
            let fileName
        if(type === 'with-slot'){
            apiEndpoint = `/with-slot?from_date=${formatDate(
                slotFDate
              )}&to_date=${formatDate(slotTDate)}&year=${wslotYear.value}`;
              fileName = `With_Slot_exemption_Report-${wslotYear?.value || "All"}-${formatDate(
                slotFDate
              )}-to-${formatDate(slotTDate)}.xlsx`;
        }
        if(type === 'without-slot'){
          apiEndpoint = `/without-slot?from_date=${formatDate(
              slotFDate
            )}&to_date=${formatDate(slotTDate)}&year=${wslotYear.value}`;
            fileName = `Without_Slot_exemption_Report-${wslotYear?.value || "All"}-${formatDate(
              slotFDate
            )}-to-${formatDate(slotTDate)}.xlsx`;
      }
        if (!apiEndpoint || !fileName) return;
        const response = await requestApi("GET", apiEndpoint);
      const data = response.data;
      let workbook = XLSX.utils.book_new();
      let worksheet;
      if (type === "without-slot") {
              if (!data.attendance_details || !data.student_summary) {
                throw new Error(
                  "Invalid data format: Missing 'attendance_details' or 'student_summary'"
                );
              }
      
              const dates = [
                ...new Set(data.attendance_details.map((detail) => detail.date)),
              ];
              const studentsMap = {};
      
              // Collect attendance data
              data.attendance_details.forEach((detail) => {
                detail.attendance.forEach((entry) => {
                  if (!studentsMap[entry.student_id]) {
                    studentsMap[entry.student_id] = {
                      register_number: entry.register_number,
                      student_name: entry.student_name,
                      gmail: entry.gmail,
                      attendance: {},
                      total_present: 0,
                      total_absent: 0,
                      total_days: 0,
                      percentage_present: "0.00",
                    };
                  }
      
                  studentsMap[entry.student_id].attendance[detail.date] = {
                    forenoon_status: entry.forenoon_status,
                    afternoon_status: entry.afternoon_status,
                  };
                });
              });
      
              data.student_summary.forEach((summary) => {
                if (studentsMap[summary.student_id]) {
                  studentsMap[summary.student_id].total_present =
                    summary.total_present;
                  studentsMap[summary.student_id].total_absent = summary.total_absent;
                  studentsMap[summary.student_id].total_days = summary.total_days;
                  studentsMap[summary.student_id].percentage_present =
                    summary.percentage_present;
                }
              });
      
              const headerRow1 = ["Register Number", "Name", "Email"];
              const headerRow2 = ["", "", ""];
      
              dates.forEach((date) => {
                headerRow1.push(date, "");
                headerRow2.push("FN", "AN");
              });
      
              headerRow1.push(
                "Present Days",
                "Absent Days",
                "Total Days",
                "Attendance Percentage"
              );
              headerRow2.push("", "", "", "");
      
              const rows = Object.values(studentsMap).map((student) => [
                student.register_number,
                student.student_name,
                student.gmail,
                ...dates
                  .map((date) => {
                    const attendance = student.attendance[date] || {};
                    return [
                      attendance.forenoon_status || "NA",
                      attendance.afternoon_status || "NA",
                    ];
                  })
                  .flat(),
                student.total_present,
                student.total_absent,
                student.total_days,
                student.percentage_present,
              ]);
      
              worksheet = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, ...rows]);
      
              dates.forEach((_, index) => {
                const colStart = 3 + index * 2;
                worksheet["!merges"] = worksheet["!merges"] || [];
                worksheet["!merges"].push({
                  s: { r: 0, c: colStart },
                  e: { r: 0, c: colStart + 1 },
                });
              });
            }
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
                  XLSX.writeFile(workbook, fileName);
                } catch (error) {
                  console.error(`Error downloading the ${type} report`, error);
                }
    }
    const formatDate = (date) => {
        if (!date) return "";
        return moment(date).format("YYYY-MM-DD");
      };

    const yearOptions = [
        // { value: "All", label: "All" },
        { value: "I", label: "I" },
        { value: "II", label: "II" },
        { value: "III", label: "III" },
        { value: "IV", label: "IV" },
      ];
return(
    <div>
        <div className="presentReport">
          <h3>Slot Only Report</h3>
          <br />
          <div className="select-year">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div style={{ zIndex: "2" }}>
                <Select
                  value={wslotYear}
                  onChange={(e) => setWSlotYear(e)}
                  options={yearOptions}
                  placeholder="Select Year"
                  styles={customStyles}
                />
              </div>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={slotFDate}
                  onChange={(newValue) => setSlotFDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                  slotProps={{ textField: { size: "small" } }}
                  format="dd/MM/yyyy"
                  maxDate={new Date()}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={slotTDate || new Date()}
                  onChange={(newValue) => setslotTDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                  slotProps={{ textField: { size: "small" } }}
                  maxDate={new Date()}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
              <Button
                name="Download"
                className="save-btn"
                onClick={() => handleDownload("without-slot")}
                label="Download (without slot-exemption)"
              />
              <Button
                name="Download"
                className="save-btn"
                onClick={() => handleDownload("with-slot")}
                label="Download (with slot-exemption)"
              />
            </div>
          </div>
        </div>
    </div>
)    
}
export default WithOutSlots;