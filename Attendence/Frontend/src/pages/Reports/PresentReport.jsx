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

function PresentReport() {
  const [presentYear, setPresentYear] = useState();
  const [presentDate, setPresentDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  return (
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
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Passing data to ExcelGenerator */}
        {presentYear && presentDate && (
          <ExcelGenerator
            apiEndpoint={`/pre-report?year=${presentYear.value}&date=${formatDate(presentDate)}`}
            year={presentYear.value}
            date={formatDate(presentDate)}
            fileName={`studentsPresent-${presentYear.value}-${formatDate(presentDate)}.xlsx`}
          />
        )}
      </div>
    </div>
  );
}

export default PresentReport;
