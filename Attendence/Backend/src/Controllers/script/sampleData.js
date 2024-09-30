const { get_database, post_database } = require("../../config/db_utils");

// Function to generate attendance records
async function generateAndInsertAttendanceRecords() {
    const startDate = new Date('2024-08-01');
    const endDate = new Date('2024-09-21');
    const students = ['7376221CS269', '7376221CS181', '7376221CS282', '7376221CS242'];
    
    // Loop through each date in the range
    for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const dateString = currentDate.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
        
        // Generate attendance entries for each student
        for (const student of students) {
            const records = [
                {
                    student: student,
                    attendence: `${dateString} 08:10:00`,
                    place: null,
                    status: '1'
                },
                {
                    student: student,
                    attendence: `${dateString} 13:00:00`,
                    place: null,
                    status: '1'
                }
            ];

            // Prepare SQL insert statement
            const query = `
                INSERT INTO no_arrear (student, attendence, place, status)
                VALUES (?, ?, ?, ?);
            `;

            // Insert each record into the database
            for (const record of records) {
                await post_database(query, [record.student, record.attendence, record.place, record.status]);
            }
        }
    }
}

// Example endpoint to call the insertion function
exports.insertAttendanceRecords = async (req, res) => {
    try {
        await generateAndInsertAttendanceRecords();
        res.status(201).json({ message: "Attendance records inserted successfully." });
    } catch (error) {
        console.error("Error inserting attendance records:", error);
        res.status(500).json({ error: "An error occurred while inserting attendance records." });
    }
};
