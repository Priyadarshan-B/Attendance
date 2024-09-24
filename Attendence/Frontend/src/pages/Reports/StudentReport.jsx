import React, { useState } from "react";
import Select from "react-select";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import ExcelGenerator from "./ExcelGenerator";
import customStyles from "../../components/applayout/selectTheme";
import moment from "moment";

const yearOptions = [
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
];

function StudentReport() {
  const [studentYear, setStudentYear] = useState();
  const [studentDate, setStudentDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  return (
    <div className="studentReport" style={{ flex: "1" }}>
      <h3>Student Report</h3>
      <br />
      <div>
        <div className="select-date">
          <div style={{ flex: "1", width: "300px" }}>
            <Select
              value={studentYear}
              onChange={setStudentYear}
              options={yearOptions}
              styles={customStyles}
              placeholder="Select Year.."
              isClearable
            />
          </div>
          <div style={{ flex: "1", textAlign: "center" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={studentDate}
                onChange={(newValue) => setStudentDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Passing data to ExcelGenerator */}
        {studentYear && studentDate && (
          <ExcelGenerator
            apiEndpoint={`/student-report?year=${studentYear.value}&date=${formatDate(studentDate)}`}
            year={studentYear.value}
            date={formatDate(studentDate)}
            fileName={`studentsReport-${studentYear.value}-${formatDate(studentDate)}.xlsx`}
          />
        )}
      </div>
    </div>
  );
}

export default StudentReport;
