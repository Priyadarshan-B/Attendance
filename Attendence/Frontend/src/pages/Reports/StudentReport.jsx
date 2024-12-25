import React, { useState } from "react";
import Button from "../../components/Button/Button";
import * as XLSX from "xlsx";
import Select from "react-select";
import requestApi from "../../components/utils/axios";
import customStyles from "../../components/applayout/selectTheme";

const yearOptions = [
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
];

function StudentReport() {
    const [selectedYear, setSelectedYear] = useState(null);
  
    const handleDownload = async(type)=>{
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
        const filteredData = data.map(({ status, id, student, ...rest }) => rest);

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
    
        const workbook = XLSX.utils.book_new();

         XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
              XLSX.writeFile(workbook, fileName);
      }catch(error){
      console.error(`Error downloading the ${type} report`, error);
        
      }
    }

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
