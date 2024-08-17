const { get_database , post_database} = require("../../config/db_utils");

exports.mentor_att_approve = async (req, res) => {
    const student = req.query.student;
    
    if (!student) {
        return res.status(400).json({ error: "Mentor Id not found" });
    }

    try {
        const query = `
            UPDATE students 
            SET att_status = '1'
            WHERE id = ?;`
        const mentor_approve = await post_database(query, [student]);
        res.json(mentor_approve);
    } catch (err) {
        console.error("Error Updating Mentor-Student Attendance", err);
        res.status(500).json({ error: "Error Updating Mentor-Student Attendance" });
    }
};

exports.mentor_no_att_approve = async (req, res) => {
    const student = req.query.student;

    if (!student) {
        return res.status(400).json({ error: "Mentor Id not found" });
    }

    try {
        const query = `
            UPDATE students 
            SET att_status = '0'
            WHERE id = ?;`
        const mentor_approve = await get_database(query, [student]);
        res.json(mentor_approve);
    } catch (err) {
        console.error("Error Updating Mentor-Student no Attendance", err);
        res.status(500).json({ error: "Error Updating Mentor-Student no Attendance" });
    }
};

exports.update_biometrics = async () => {
    try {
        const currentDay = new Date().getDay(); 

        const currentDate = new Date().toISOString().split('T')[0]; 

        const studentQuery = `
            SELECT register_number
            FROM students
            WHERE att_status = '1'
            AND (
                (${currentDay} = 3 AND TIME(app_date) BETWEEN '06:00:00' AND '18:00:00')  -- Wednesday with time condition
                OR (${currentDay} != 3)  -- Any other day without time condition
            )
        `;

        const studentsToUpdate = await get_database(studentQuery, [currentDate]);

        if (studentsToUpdate.length === 0) {
            console.log('No students to update');
            return;
        }

        const studentIds = studentsToUpdate.map(student => student.register_number);

        const updateQuery = `
            UPDATE no_arrear
            SET status = '1'
            WHERE student IN (?)
            AND DATE(attendence) = ?
        `;

        const updateResult = await get_database(updateQuery, [studentIds, currentDate]);

        console.log('Update successful', updateResult);
    } catch (err) {
        console.error("Error Updating no_arrear Attendance", err);
    }
};


exports.update_7_days = async () => {
    try {
        const query = `UPDATE students
                     SET att_status = '0'
                     WHERE DAYOFWEEK(CURDATE()) = 4`;

        const attendence = await get_database(query);
        console.log('Attendance update executed:', attendence);

        return attendence;
    } catch (error) {
        console.error('Error executing update_7_days:', error);
        throw error;
    }
};
