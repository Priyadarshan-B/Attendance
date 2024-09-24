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

function AbsentReport() {
  const [absentYear, setAbsentYear] = useState();
  const [absentDate, setAbsentDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  return (
    <div className="absentReport" style={{ flex: "1" }}>
      <h3>Absent Report</h3>
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
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Passing data to ExcelGenerator */}
        {absentYear && absentDate && (
          <ExcelGenerator
            apiEndpoint={`/ab-report?year=${absentYear.value}&date=${formatDate(absentDate)}`}
            year={absentYear.value}
            date={formatDate(absentDate)}
            fileName={`studentsAbsent-${absentYear.value}-${formatDate(absentDate)}.xlsx`}
          />
        )}
      </div>
    </div>
  );
}

export default AbsentReport;
