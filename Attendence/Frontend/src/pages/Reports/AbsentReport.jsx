import React, { useState,useEffect } from "react";
import * as XLSX from "xlsx";
import Select from "react-select";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import requestApi from "../../components/utils/axios";
import Button from "../../components/Button/Button";
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
  const [absentDate, setAbsentDate] = useState(new Date());

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
      }
      if (!apiEndpoint || !fileName) return;

      const response = await requestApi("GET", apiEndpoint);
      const data = response.data;
      let workbook = XLSX.utils.book_new();
      let worksheet;

      // Handle different report types
      if (type === "absent") {
              const totalPresentRow = [
                `Total Absent Students: ${data.total_absent_students}`,
              ];
              const studentHeader = [
                "register_number",
                "student_name",
                "year",
                "gmail",
                "department",
              ];
              const studentRows = data.students.map(
                ({ register_number, name, year, gmail, department }) => [
                  register_number,
                  name,
                  year,
                  gmail,
                  department,
                  // present,
                ]
              );
              worksheet = XLSX.utils.aoa_to_sheet([
                totalPresentRow,
                [],
                [],
                studentHeader,
                ...studentRows,
              ]);
            } 
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error(`Error downloading the ${type} report`, error);
    }
  };

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
                value={absentDate || new Date()}
                onChange={(newValue) => setAbsentDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
                slotProps={{ textField: { size: "small" } }}
                format="dd/MM/yyyy"
                maxDate={new Date()}
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
  );
}

export default AbsentReport;
