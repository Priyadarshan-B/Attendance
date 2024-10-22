const mysql = require('mysql2');
const xlsx = require('xlsx');
const fs = require('fs');

// MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'attendance'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the MySQL database');
    }
});

// Function to fetch student and mentor IDs
const getStudentAndMentor = async (registerNumber, mentorGmail) => {
    const studentQuery = 'SELECT id FROM students WHERE register_number = ?';
    const mentorQuery = 'SELECT id FROM mentor WHERE gmail = ?';

    try {
        const [studentRows] = await connection.promise().query(studentQuery, [registerNumber]);
        const [mentorRows] = await connection.promise().query(mentorQuery, [mentorGmail]);

        const studentId = studentRows[0]?.id;
        const mentorId = mentorRows[0]?.id;

        return { studentId, mentorId };
    } catch (err) {
        console.error('Error fetching student or mentor:', err);
        throw err;
    }
};

// Function to insert or update mentor_student record
const upsertMentorStudent = async (mentorId, studentId) => {
    const checkQuery = 'SELECT id FROM mentor_student WHERE student = ?';
    const insertQuery = 'INSERT INTO mentor_student (mentor, student, status) VALUES (?, ?, ?)';
    const updateQuery = 'UPDATE mentor_student SET mentor = ?, status = ? WHERE student = ?';

    try {
        const [rows] = await connection.promise().query(checkQuery, [studentId]);

        if (rows.length > 0) {
            // Update the record
            await connection.promise().query(updateQuery, [mentorId, '1', studentId]);
            console.log('Record updated successfully for student ID:', studentId);
        } else {
            // Insert new record
            await connection.promise().query(insertQuery, [mentorId, studentId, '1']);
            console.log('New record inserted successfully for student ID:', studentId);
        }
    } catch (err) {
        console.error('Error updating or inserting record:', err);
        throw err;
    }
};

// Function to parse Excel and process records
const processExcelFile = async (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Assuming the first sheet
    const sheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(sheet); // Convert sheet to JSON

    // Collect promises from each row to handle all async tasks
    const tasks = data.map(async (row) => {
        const { Student: registerNumber, gmail: mentorGmail } = row;

        try {
            const { studentId, mentorId } = await getStudentAndMentor(registerNumber, mentorGmail);

            if (studentId && mentorId) {
                await upsertMentorStudent(mentorId, studentId);
            } else {
                console.error('Student or mentor not found for:', registerNumber, mentorGmail);
            }
        } catch (err) {
            console.error('Error processing row:', err);
        }
    });

    // Wait for all tasks to complete before proceeding
    await Promise.all(tasks);
};

// Specify the path to the Excel file
const excelFilePath = './Book1.xlsx';

// Process the Excel file
processExcelFile(excelFilePath)
    .then(() => {
        console.log('All rows processed successfully.');
        // Close the MySQL connection after processing
        connection.end();
    })
    .catch((err) => {
        console.error('Error processing the Excel file:', err);
        // Close the connection in case of error
        connection.end();
    });
