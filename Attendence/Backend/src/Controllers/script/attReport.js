const mysql = require('mysql2');
const XLSX = require('xlsx');
const fs = require('fs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'attendance'
});

const startDate = new Date("2024-09-18");
const endDate = new Date("2024-11-15");

let dateColumns = [];
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
  const dateStr = currentDate.toISOString().split("T")[0]; 
  dateColumns.push(dateStr); 
  currentDate.setDate(currentDate.getDate() + 1);
}

const baseQuery = `
SELECT 
    s.id AS student_id,
    s.name AS student_name,
    s.register_number,
    ${dateColumns
      .map(
        (date) => `
        MAX(CASE WHEN dates.d = '${date}' AND dates.session = 'FN' THEN attended_count END) AS \`${date}_FN\`,
        MAX(CASE WHEN dates.d = '${date}' AND dates.session = 'AN' THEN attended_count END) AS \`${date}_AN\``
      )
      .join(",")}
FROM 
    students s
LEFT JOIN (
    SELECT 
        r.student,
        COUNT(DISTINCT ts.id) AS attended_count, 
        DATE(r.att_session) AS d,
        ts.session
    FROM 
        re_appear r
    JOIN 
        time_slots ts ON r.slot = ts.id
    WHERE 
        r.status = '1' 
        AND ts.status = '1'
    GROUP BY 
        r.student, DATE(r.att_session), ts.session
) AS dates ON s.id = dates.student
WHERE 
    s.year = 'II' AND
    s.type = '2'
GROUP BY 
    s.id, s.name, s.register_number
ORDER BY 
    s.name;
`;

connection.query(baseQuery, (err, results) => {
  if (err) {
    console.error("Error executing query:", err);
    return;
  }

  console.log("Query executed successfully. Preparing Excel...");

  const excelData = [];
  
  const headerRow1 = ["Student ID", "Student Name", "Register Number", ...dateColumns.flatMap(date => [date, ""])];
  
  const headerRow2 = ["", "", "", ...dateColumns.flatMap(() => ["FN", "AN"])];
  
  excelData.push(headerRow1);
  excelData.push(headerRow2);

  results.forEach((row) => {
    const flattenedRow = [
      row.student_id,
      row.student_name,
      row.register_number,
      ...dateColumns.flatMap((date) => [row[`${date}_FN`] || 0, row[`${date}_AN`] || 0]),
    ];
    excelData.push(flattenedRow);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  dateColumns.forEach((date, index) => {
    const colStart = 3 + index * 2; 
    worksheet[`!merges`] = worksheet[`!merges`] || [];
    worksheet[`!merges`].push({
      s: { r: 0, c: colStart }, 
      e: { r: 0, c: colStart + 1 }, 
    });
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");

  const filePath = 'attendance_data_with_FN_AN_headers_fixed.xlsx';
  XLSX.writeFile(workbook, filePath);

  console.log(`Excel file saved as ${filePath}`);

  connection.end();
});
