import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Select from "react-select";
import requestApi from "../../components/utils/axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import customStyles from "../../components/applayout/selectTheme";
import moment from "moment";
import Button from "../../components/Button/Button";


const yearOptions = [
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
];

function PresentSlotReport() {
  const [presentSlot, setPresentSlot] = useState([]);
  const [presentSlotYear, setPresentSlotYear] = useState(null);
  const [presentSlotDate, setPresentSlotDate] = useState(new Date());
  const [presentSlotOptions, setPresentSlotOptions] = useState([]);

  const handleDownload = async (type) => {
    try {
      let apiEndpoint;
      let fileName;

      if (type === "present-slot") {
        apiEndpoint = `/pres-report?year=${
          presentSlotYear.value
        }&date=${formatDate(presentSlotDate)}&slot=${
          presentSlot.value || "All"
        }`;
        fileName = `studentsPresent-${presentSlotYear.value}-${formatDate(
          presentSlotDate
        )}-${presentSlot.label || "All"}.xlsx`;
      }

      if (!apiEndpoint || !fileName) return;

      const response = await requestApi("GET", apiEndpoint);
      const data = response.data;
      let workbook = XLSX.utils.book_new();
      let worksheet;

      if (type === "present-slot") {
        const totalPresentRow = [
          `Total Present Students(Slot-wise): ${data.total_present_students}`,
        ];
        const studentHeader = [
          "register_number",
          "student_name",
          "mail",
          "mentor_name",
          "attendance_taken",
          "slot",
        ];
        const studentRows = data.students.map(
          ({
            register_number,
            student_name,
            mail,
            mentor_name,
            attendance_taken,
            slot,
          }) => [
            register_number,
            student_name,
            mail,
            mentor_name,
            attendance_taken,
            slot,
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
    } catch (err) {
      console.error(`Error downloading the ${type} report`, error);
    }
  };
  useEffect(() => {
    if (presentSlotYear) {
      fetchSlotOptions(presentSlotYear.value, "present-slot");
    }
  }, [presentSlotYear]);

  const fetchSlotOptions = async (year, type) => {
    try {
      const response = await requestApi("GET", `/slot-year?year=${year}`);
      const slots = response.data.map((slot) => ({
        value: slot.id,
        label: slot.label,
      }));

      const allOption = { value: "All", label: "All" };
      const All = { value: "AllSlots", label: "All Slots" };
      const updatedSlots = [allOption, All, ...slots];

      if (type === "present-slot") {
        setPresentSlotOptions(updatedSlots);
      }
    } catch (error) {
      console.error("Error fetching slot options:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };

  return (
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
                value={presentSlotDate || new Date()}
                onChange={(newValue) => setPresentSlotDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
                slotProps={{ textField: { size: "small" } }}
                format="dd/MM/yyyy"
                maxDate={new Date()}
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
  );
}

export default PresentSlotReport;
