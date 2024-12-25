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

function AbsentSlotReport() {

  const [absentSlotDate, setAbsentSlotDate] = useState(new Date());
   const [slotYear, setSlotYear] = useState();
   const [slot, setSlot] = useState([]);
   const [slotOptions, setSlotOptions] = useState([]);

   const handleDownload = async(type)=>{
    try{
      let apiEndpoint;
      let fileName;

      if (type === "absent-slot") {
        apiEndpoint = `/abs-report?year=${slotYear.value}&date=${formatDate(
          absentSlotDate
        )}&slot=${slot.value || "All"}`;
        fileName = `studentsAbsent-${slotYear.value}-${formatDate(
          absentSlotDate
        )}.xlsx`;
      }

      if (!apiEndpoint || !fileName) return;

      const response = await requestApi("GET", apiEndpoint);
      const data = response.data;
      let workbook = XLSX.utils.book_new();
      let worksheet;

      if (type === "absent-slot") {
              const totalAbsentRow = [
                `Total Absent Students: ${data.total_absent_students}`,
              ];
              const studentHeader = [
                "student_name",
                "register_number",
                "mail",
                "mentor_name",
                "slot",
              ];
              const studentRows = data.students.map(
                ({ student_name, register_number, mail, mentor_name, slot }) => [
                  student_name,
                  register_number,
                  mail,
                  mentor_name,
                  slot,
                ]
              );
              worksheet = XLSX.utils.aoa_to_sheet([
                totalAbsentRow,
                [],
                [],
                studentHeader,
                ...studentRows,
              ]);
            } 
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
                  XLSX.writeFile(workbook, fileName);

    }catch(error){
      console.error(`Error downloading the ${type} report`, error);
    }
   }

    useEffect(() => {
       if (slotYear) {
         fetchSlotOptions(slotYear.value, "absent");
       }
     }, [slotYear]);

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
  
        if (type === "absent") {
          setSlotOptions(updatedSlots);
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
              <div style={{ flex: "1", zIndex: "200" }}>
                <Select
                  value={slotYear}
                  onChange={setSlotYear}
                  options={yearOptions}
                  styles={customStyles}
                  placeholder="Select Year.."
                  isClearable
                />
              </div>
              <div style={{ flex: "1", zIndex: "100" }}>
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
                    value={absentSlotDate || new Date()}
                    onChange={(newValue) => setAbsentSlotDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    slotProps={{ textField: { size: "small" } }}
                    format="dd/MM/yyyy"
                    maxDate={new Date()}
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
  );
}

export default AbsentSlotReport;
