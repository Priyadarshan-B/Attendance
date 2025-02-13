import React from "react";
import Button from "../../components/Button/Button";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

function ExcelGenerator({ apiEndpoint, year, date, fileName }) {
  const handleDownload = async () => {
    try {
      const response = await requestApi("GET", apiEndpoint);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(response.data); 
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error downloading report", error);
    }
  };

  return <Button onClick={handleDownload} label="Download Report" />;
}

export default ExcelGenerator;
