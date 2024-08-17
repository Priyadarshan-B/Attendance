const { get_database, post_database } = require("../../config/db_utils");

exports.get_mentor = async(req, res)=>{
  try{
    const query = `
    SELECT * FROM mentor
    WHERE status = '1';
    `
    const mentor = await get_database(query)
    res.json(mentor);
  }
  catch(err){
    console.error("Error Fetching Mentor List", err);
    res.status(500).json({ error: "Error fetching Mentor List" });
  }
}

exports.get_students = async (req, res) => {
  const mentor = req.query.mentor;

  if (!mentor) {
    return res.status(400).json({ error: "Mentor Id not found" });
  }
  try {
    const query = `
   SELECT s.id, s.name, s.register_number, s.att_status
FROM students s
JOIN mentor_student ms ON s.id = ms.student
WHERE ms.mentor = ?
AND s.status = '1';

    `;

    const students = await get_database(query, [mentor]);
    res.json(students);
  } catch (err) {
    console.error("Error Fetching Mentor-Student List", err);
    res.status(500).json({ error: "Error fetching Mentor-Student List" });
  }
};

exports.update_students_no_att = async (req, res) => {
   const mentor = req.query.mentor;
 
   if (!mentor) {
     return res.status(400).json({ error: "Mentor Id not found" });
   }
   try {
     const query = `
     SELECT s.name, s.register_number
FROM students s
JOIN mentor_student ms ON s.id = ms.student
WHERE ms.mentor = ?
AND s.att_status = '0'
AND s.status = '1';

`;
 
     const students = await get_database(query, [mentor]);
     res.json(students);
   } catch (err) {
     console.error("Error Fetching Mentor-Student List", err);
     res.status(500).json({ error: "Error fetching Mentor-Student List" });
   }
 };
 
 exports.get_students_type_2 = async (req, res) => {
  // const { email } = req.query;
  // const currentTime = moment().format('h:mmA'); 

  try {
    const query = `
      SELECT id, name, register_number, att_status
        FROM students
        WHERE type = 2
        AND status = '1';
    `;
    
    const result = await get_database(query);
    res.json(result)
    
  } catch (err) {
    console.error("Error Fetching Mentor-Student type 2 List", err);
    res.status(500).json({ error: "Error fetching Mentor-Student type 2 List" });
  }
};

exports.get_mentor_map = async(req, res) => {
  try{
    const query = `
      SELECT mentor_student.id, mentor.name AS mentor, students.name AS student , students.register_number
      FROM mentor_student
      INNER JOIN mentor
      on mentor_student.mentor = mentor.id
      INNER JOIN students
      ON mentor_student.student = students.id
      WHERE mentor_student.status = '1';
    `
    const get_mentor_map = await get_database(query)
    res.json(get_mentor_map)
  }
  catch(err){
    console.error("Error Fetching Mentor mapping", err);
    res.status(500).json({ error: "Error Fetching Mentor mapping" });
  }
}


exports.post_mentor_map = async (req, res) => {
  const { mentor, student } = req.body;
  
  if (!Array.isArray(student) || student.length === 0) {
    return res.status(400).json({ error: "Student array is required and must not be empty." });
  }

  try {
    const failedMappings = [];
    const successfulMappings = [];

    for (const s of student) {
      // Check if the student is already mapped to the same mentor
      const checkQuery = `
        SELECT COUNT(*) AS count
        FROM mentor_student
        WHERE mentor = ? AND student = ?;
      `;
      const [existingMapping] = await get_database(checkQuery, [mentor, s]);

      if (existingMapping.count > 0) {
        failedMappings.push({ student: s, reason: "Student already mapped to the same mentor." });
        continue;
      }

      const checkStatusQuery = `
        SELECT COUNT(*) AS count
        FROM mentor_student
        WHERE student = ? AND status = '1';
      `;
      const [statusMapping] = await get_database(checkStatusQuery, [s]);

      if (statusMapping.count > 0) {
        failedMappings.push({ student: s, reason: "Student already mapped to another mentor with status 1." });
        continue;
      }

      const insertQuery = `
        INSERT INTO mentor_student (mentor, student)
        VALUES (?, ?);
      `;
      await post_database(insertQuery, [mentor, s]);
      successfulMappings.push({ student: s, message: "Mapping successful." });
    }

    res.json({ success: successfulMappings, failed: failedMappings });
  } catch (err) {
    console.error("Error Inserting Mentor mapping", err);
    res.status(500).json({ error: "Error Inserting Mentor mapping" });
  }
};

exports.get_leave = async(req, res)=>{
  const  mentor = req.query.mentor
  if(!mentor){
    res.status(400).json({error:"mentor id is required"})
  }
  try{
    const query = `
    SELECT 
    lt.type,
    l.id AS leave_id,
    l.leave, 
    l.from_date, 
    l.to_date, 
    l.from_time, 
    l.to_time,
    s.id AS student_id,
    s.name AS student_name,
    s.register_number
FROM 
    \`leave\` l
JOIN
    leave_type lt 
    ON l.\`leave\` = lt.id
JOIN 
    mentor_student ms ON l.student = ms.student
JOIN 
    students s ON s.id = l.student
WHERE 
    ms.mentor = ?
    AND l.status = '2';
    `
    const leave_det = await get_database(query, [mentor])
    res.json(leave_det)
  }
  catch(err){
    console.error("Error Fetching student leave", err);
    res.status(500).json({ error: "Error Fetching student leave" });
  }
}

exports.update_leave = async(req, res)=>{
  const {student,id} = req.body
  if(!student || !id){
    res.status(400).json({error:"Student id is required"})
  }
  try{
    const query = `
    UPDATE \`leave\`
    SET status = '1'
    WHERE student = ?
    AND id = ?
    AND status = '2'
    `
    const updateLeave = await post_database(query, [student , id])
    res.json(updateLeave)
  }
  catch(err){
    console.error("Error Updating student leave", err);
    res.status(500).json({ error: "Error Updating student leave" });
  }
}
exports.update_reject_leave = async(req, res)=>{
  const {student,id} = req.body
  if(!student || !id){
    res.status(400).json({error:"Student id is required"})
  }
  try{
    const query = `
    UPDATE \`leave\`
    SET status = '3'
    WHERE student = ?
    AND id = ?
    AND status = '2'
    `
    const updateLeave = await post_database(query, [student , id])
    res.json(updateLeave)
  }
  catch(err){
    console.error("Error Updating  student leave reject", err);
    res.status(500).json({ error: "Error Updating student leave reject" });
  }
}