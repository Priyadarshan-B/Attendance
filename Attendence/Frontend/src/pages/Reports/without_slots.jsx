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

function With_Without_Report() {
  const [consolidateYear, setConsolidateYear] = useState();
  const [consolidateDate, setConsolidateDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  return (
    <div className="consolidateReport" style={{ flex: "1" }}>
      <h3>Consolidated Report</h3>
      <br />
      <div>
        <div className="select-date">
          <div style={{ flex: "1", width: "300px" }}>
            <Select
              value={consolidateYear}
              onChange={setConsolidateYear}
              options={yearOptions}
              styles={customStyles}
              placeholder="Select Year.."
              isClearable
            />
          </div>
          <div style={{ flex: "1", textAlign: "center" }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={consolidateDate}
                onChange={(newValue) => setConsolidateDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Passing data to ExcelGenerator */}
        {consolidateYear && consolidateDate && (
          <ExcelGenerator
            apiEndpoint={`/with-slot?year=${consolidateYear.value}&date=${formatDate(consolidateDate)}`}
            year={consolidateYear.value}
            date={formatDate(consolidateDate)}
            fileName={`consolidateReport-${consolidateYear.value}-${formatDate(consolidateDate)}.xlsx`}
          />
        )}
      </div>
    </div>
  );
}

export default With_Without_Report;
