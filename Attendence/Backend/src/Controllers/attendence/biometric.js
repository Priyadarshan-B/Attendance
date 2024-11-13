const { get_database , post_database} = require("../../config/db_utils");

const moment = require('moment');

exports.mentor_att_approve = async (req, res) => {
    const student = req.query.student;

    if (!student) {
        return res.status(400).json({ error: "Mentor Id not found" });
    }

    try {
        const appDate = moment().format('YYYY-MM-DD HH:mm:ss');
        let nextWednesday = moment().day(3).startOf('day');
        if (moment().day() === 3) {
            console.log("dfibdfsh")
            nextWednesday.add(1, 'week');
        }

        const dueDate = nextWednesday.format('YYYY-MM-DD HH:mm:ss');
        
        const query = `
            UPDATE students 
            SET att_status = '1', 
                app_date = ?, 
                due_date = ?, 
                status = '1' 
            WHERE id = ?
        `;
        const mentorApprove = await post_database(query, [appDate, dueDate, student]);

        res.json(mentorApprove);
    } catch (err) {
        console.error("Error Updating Mentor-Student Attendance", err);
        res.status(500).json({ error: "Error Updating Mentor-Student Attendance" });
    }
};


exports.update_next_wed = async (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: "Id is required!!!" });
    }

    const query = `
    UPDATE students
    SET due_date = (
        CASE 
            WHEN DAYOFWEEK(due_date) < 4 THEN DATE_ADD(due_date, INTERVAL (4 - DAYOFWEEK(due_date)) DAY)
            ELSE DATE_ADD(due_date, INTERVAL (11 - DAYOFWEEK(due_date)) DAY)
        END
    )
    WHERE id = ?
    AND status = '1'
    `;

    try {
        const updateWed = await get_database(query, [id]);
        res.json(updateWed);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while updating the due_date." });
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
                (${currentDay} = 3 AND TIME(app_date) BETWEEN '06:00:00' AND '18:00:00') 
                OR (${currentDay} != 3) 
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
                     WHERE due_date < NOW()`;

        const attendance = await get_database(query);
        console.log('Attendance update executed:', attendance);

        return attendance;
    } catch (error) {
        console.error('Error executing update_7_days:', error);
        throw error;
    }
};

exports.getBiometric = async(req, res)=>{
    const {date} = req.body
    if(!date){
        return res.status(400).json({error:"Date is not specified..."})
    }
    try{
        const query = `
        SELECT * FROM no_arrear WHERE DATE(attendence) = ? AND  status = '1';
        `
        const Biometric = await get_database(query, [date])
        res.json(Biometric)
    }
    catch(error){
        console.error('Error fetching Biometric Data:', error);
       return res.status(500).json({error:"Error fetching Biometrics Data.."})
    }
}