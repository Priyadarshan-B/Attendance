const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const path = require('path');

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'attendance'
};

async function insertDataIntoTable(data) {
  const connection = await mysql.createConnection(connectionConfig);

  const insertQuery = `INSERT INTO no_arrear (student, attendence, status) VALUES (?, ?, '1')`;

  for (let row of data) {
    const { Roll_no, devicetime } = row;

    const formattedDate = convertExcelDateToJSDate(devicetime);

    try {
      await connection.execute(insertQuery, [Roll_no, formattedDate]);
    } catch (error) {
      console.error('Error inserting row:', row, 'Error:', error.message);
    }
  }

  await connection.end();
}

function convertExcelDateToJSDate(excelDate) {
  const epoch = new Date(Date.UTC(1899, 11, 30)); 
  const days = Math.floor(excelDate); 
  const milliseconds = (excelDate - days) * 24 * 60 * 60 * 1000; 
  const result = new Date(epoch.getTime() + (days * 24 * 60 * 60 * 1000) + milliseconds);

  return result.toISOString().slice(0, 19).replace('T', ' ');
}

async function readExcelAndInsertData(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    
    await insertDataIntoTable(jsonData);
    
    console.log('Data successfully inserted into the table.');
  } catch (error) {
    console.error('Error reading the Excel file or inserting data:', error.message);
  }
}

const filePath = path.join(__dirname, './Academic_Stream_attendance_log.xlsx');

readExcelAndInsertData(filePath);
