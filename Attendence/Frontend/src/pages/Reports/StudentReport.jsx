import React, { useState } from "react";
import Select from "react-select";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import TextField from "@mui/material/TextField";
// import ExcelGenerator from "./ExcelGenerator";
import customStyles from "../../components/applayout/selectTheme";
// import moment from "moment";

const yearOptions = [
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
];

function StudentReport() {
    const [selectedYear, setSelectedYear] = useState(null);
  
    const handleDownload = async()=>{
      try{
        let apiEndpoint;
      let fileName;
      if (type === "student") {
        const year = selectedYear?.value || "All";
        apiEndpoint = `/student-report?year=${year}`;
        fileName = `StudentReport-${year}.xlsx`;
      }
      if (!apiEndpoint || !fileName) return;

        const response = await requestApi("GET", apiEndpoint);
        const data = response.data;
        let workbook = XLSX.utils.book_new();
        let worksheet;
         XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
              XLSX.writeFile(workbook, fileName);
      }catch(error){
      console.error(`Error downloading the ${type} report`, error);
        
      }
    }

  // const formatDate = (date) => {
  //   if (!date) return "";
  //   return moment(date).format("YYYY-MM-DD");
  // };

  return (
    <div className="presentReport">
          <h3>Student Report</h3>
          <br />
          <div className="select-year">
            <div style={{ flex: "1", width: "300px" }}>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
                styles={customStyles}
                placeholder="Select Year.."
                isClearable
              />
            </div>
            <br />
            <Button
              onClick={() => handleDownload("student")}
              label="Download Student Report"
            />
          </div>
        </div>
  );
}

export default StudentReport;
