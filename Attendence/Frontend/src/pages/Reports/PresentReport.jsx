import React, { useState } from "react";
import Select from "react-select";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import customStyles from "../../components/applayout/selectTheme";
import "./report.css";
import moment from "moment";



function PresentReport() {
    const [presentYear, setPresentYear] = useState();
    const [presentDate, setPresentDate] = useState(new Date());
  
const handleDownload = async (type) => {
  try{
    let apiEndpoint;
    let fileName;

    if(type === 'present'){
      apiEndpoint = `/pre-report?year=${presentYear.value}&date=${formatDate(
        presentDate
      )}`;
      fileName = `studentsPresent-${presentYear.value}-${formatDate(
        presentDate
      )}.xlsx`;
    }
    if (!apiEndpoint || !fileName) return;
    const response = await requestApi("GET", apiEndpoint);
      const data = response.data;
      let workbook = XLSX.utils.book_new();
      let worksheet;

if (type === "present") {
        const totalPresentRow = [
          `Total Present Students: ${data.total_present_students}`,
        ];
        const studentHeader = [
          "register_number",
          "student_name",
          "year",
          "gmail",
          "department",
          "slot",
        ];
        const studentRows = data.students.map(
          ({ register_number, name, year, gmail, department, present }) => [
            register_number,
            name,
            year,
            gmail,
            department,
            present,
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

  }catch(error){
    console.error(`Error downloading the ${type} report`, error);

  }
}
  const formatDate = (date) => {
    if (!date) return "";
    return moment(date).format("YYYY-MM-DD");
  };
  const yearOptions = [
    { value: "I", label: "I" },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
  ];

  return (
    <div className="presentReport" style={{ flex: "1" }}>
          <h3>Present Report</h3>
          <br />
          <div>
            <div className="select-date">
              <div style={{ flex: "1", width: "300px", zIndex: "300" }}>
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
                    value={presentDate || new Date()}
                    onChange={(newValue) => setPresentDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    slotProps={{ textField: { size: "small" } }}
                    format="dd/MM/yyyy"
                    maxDate={new Date()}
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
  );
}

export default PresentReport;
