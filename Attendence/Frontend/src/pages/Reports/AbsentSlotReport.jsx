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

function AbsentSlotReport() {
  const [absentSlotYear, setAbsentSlotYear] = useState();
  const [absentSlotDate, setAbsentSlotDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  return (
    <div className="absentSlotReport" style={{ flex: "1" }}>
      <h3>Absent Slot Report</h3>
      <br />
      <div>
        <div className="select-date">
          <div style={{ flex: "1", width: "300px" }}>
            <Select
              value={absentSlotYear}
              onChange={setAbsentSlotYear}
              options={yearOptions}
              styles={customStyles}
              placeholder="Select Year.."
              isClearable
            />
          </div>
          <div style={{ flex: "1", textAlign: "center" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={absentSlotDate}
                onChange={(newValue) => setAbsentSlotDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Passing data to ExcelGenerator */}
        {absentSlotYear && absentSlotDate && (
          <ExcelGenerator
            apiEndpoint={`/absent-slot-report?year=${absentSlotYear.value}&date=${formatDate(absentSlotDate)}`}
            year={absentSlotYear.value}
            date={formatDate(absentSlotDate)}
            fileName={`absentSlotReport-${absentSlotYear.value}-${formatDate(absentSlotDate)}.xlsx`}
          />
        )}
      </div>
    </div>
  );
}

export default AbsentSlotReport;
