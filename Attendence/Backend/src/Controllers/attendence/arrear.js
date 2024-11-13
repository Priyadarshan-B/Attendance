const { get_database, post_database } = require("../../config/db_utils");

exports.get_arrear_att = async (req, res) => {
  const date = req.query.date;

  try {
    let query = `
      SELECT re_appear.id, students.name, students.register_number,
      slot, att_session, ts.label
      FROM re_appear
      INNER JOIN students ON re_appear.student = students.id
      LEFT JOIN time_slots ts ON ts.id = re_appear.slot
      WHERE re_appear.status = '1'
    `;

    if (date) {
      query += ` AND DATE(re_appear.att_session) = '${date}'`;
    }

    const get_attendance = await get_database(query);

    if (get_attendance.length > 0) {
      const formattedDetails = get_attendance.map((detail) => {
        const dateObj = new Date(detail.att_session);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const hours24 = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const seconds = String(dateObj.getSeconds()).padStart(2, "0");

        const hours12 = hours24 % 12 || 12;
        const period = hours24 < 12 ? "AM" : "PM";
        const formattedDate = `${day} / ${month} / ${year}`;
        const formattedDB_date = `${year}-${month}-${day}`;
        const formattedTime = `${String(hours12).padStart(2, "0")}:${minutes}:${seconds} ${period}`;

        return {
          ...detail,
          date: formattedDate,
          dbDate: formattedDB_date,
          time: formattedTime,
        };
      });

      res.json(formattedDetails);
    } else {
      res.status(404).json({ error: "No Data Present.." });
    }
  } catch (err) {
    console.error("Error Fetching attendance type 2", err);
    return res.status(500).json({ error: "Error Fetching attendance type 2" });
  }
};

exports.post_arrear_stu_att = async (req, res) => {
  const { faculty, students, timeslots, att_date } = req.body;

  if (!faculty ||!att_date || !students || !timeslots || students.length === 0 || timeslots.length === 0 ) {
    return res.status(400).json({ error: "Faculty, students,date and timeslots are required." });
  }
  try {
    for (let slot of timeslots) {
      for (let student of students) {
        const validateQuery = `
          SELECT att_status 
          FROM students
          WHERE id = ?
          AND status IN('1', '0');
        `;
        const [validate] = await get_database(validateQuery, [student]);

        if (validate && (validate.att_status === '1' || validate.att_status === '0')) {
          const query = `
            INSERT INTO re_appear (faculty, student, slot, att_session)
            VALUES (?, ?, ?, ?);
          `;
          await post_database(query, [faculty, student, slot, att_date]);
        } else {
          return res.status(400).json({ error: `Student ID ${student} has an invalid status for attendance.` });
        }
      }
    }

    res.json({ message: "Attendance records inserted successfully." });
  } catch (err) {
    console.error("Error Inserting arrear attendance:", err);
    res.status(500).json({ error: "Error inserting arrear attendance" });
  }
};


exports.delete_arrear_stu_att = async(req, res)=>{
  const {faculty, student, slot} = req.body;
  if(!faculty || !student || !slot ){
    return res.status(400).json({error:"Student id is required.."})

  }
  try{
    const query = `
    UPDATE re_appear
    SET status = '0'
    WHERE student = ?
    AND slot = ?;
    `
    const arrear_attendence = await post_database(query,[faculty,student,slot])
    res.json(arrear_attendence)
  }
  catch(err){
    console.error("Error Inserting arrear attendence",err)
    res.status(500).json("Error Inserting arrear attendence")

  }
}