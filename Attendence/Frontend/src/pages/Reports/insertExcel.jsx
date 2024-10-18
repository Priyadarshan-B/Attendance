import React, { useState } from "react";
import * as XLSX from "xlsx";
import requestApi from "../../components/utils/axios";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination
} from '@mui/material';
import './report.css'

const ExcelBio = () => {
  const [excelData, setExcelData] = useState([]);
  const [page, setPage] = useState(0); // Page state for pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page, default 10

  // Helper function to convert Excel serial date to JavaScript Date (YYYY-MM-DD hh:mm:ss)
  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569); // Excel's epoch date is 1899-12-30, 25569 corresponds to 1970-01-01
    const utc_value = utc_days * 86400; // 86400 seconds in a day
    const date_info = new Date(utc_value * 1000);

    // Adding fractional time (if any)
    const fractional_day = serial - Math.floor(serial);
    let total_seconds = Math.floor(86400 * fractional_day);
    const seconds = total_seconds % 60;
    total_seconds = (total_seconds - seconds) / 60;
    const minutes = total_seconds % 60;
    const hours = (total_seconds - minutes) / 60;

    date_info.setHours(hours);
    date_info.setMinutes(minutes);
    date_info.setSeconds(seconds);

    // Convert to readable format
    return date_info.toISOString().slice(0, 19).replace('T', ' ');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      const formattedData = parsedData.slice(1).map((row) => ({
        enroll_id: row[0],
        device_time: excelDateToJSDate(row[1]), // Converting serial date to human-readable format
        roll_no: row[2],
        student_name: row[3],
        batch: row[4],
      }));
      
      setExcelData(formattedData);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    try {
      const formattedData = excelData.map((row) => ({
        roll_no: row.roll_no,
        time: row.device_time,
      }));

      const response = await requestApi("POST","/upload", formattedData);
      if (response.status === 200) {
        alert("Data uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading data", error);
      alert("Error uploading data");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="App">
      <h1>Upload Excel File</h1>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={handleSubmit}>Submit</button>

      {excelData.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Enroll ID</TableCell>
                  <TableCell>Device Time</TableCell>
                  <TableCell>Roll No</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Batch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.enroll_id}</TableCell>
                    <TableCell>{row.device_time}</TableCell>
                    <TableCell>{row.roll_no}</TableCell>
                    <TableCell>{row.student_name}</TableCell>
                    <TableCell>{row.batch}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={excelData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </div>
  );
};

export default ExcelBio;
