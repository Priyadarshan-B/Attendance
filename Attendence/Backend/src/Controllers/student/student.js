const { get_database, post_database } = require("../../config/db_utils");

exports.get_student_details = async (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Student id is required" });
  }
  try {
    const query = `
      SELECT s.*, 
             CASE 
               WHEN COUNT(CASE WHEN rsm.status = '1' THEN r.id END) = 0 THEN NULL
               ELSE GROUP_CONCAT(CASE WHEN rsm.status = '1' THEN r.name END ORDER BY r.name ASC SEPARATOR ', ')
             END AS roles
      FROM students s
      LEFT JOIN role_student_map rsm ON s.id = rsm.student
      LEFT JOIN roles r ON rsm.role = r.id
      WHERE s.id = ?
      GROUP BY s.id;
    `;

    const student = await get_database(query, [id]);

    if (student.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student[0]); 
  } catch (err) {
    console.error("Error Fetching Student details", err);
    res.status(500).json({ error: "Error Fetching Student details" });
  }
};

// all- students
exports.get_all_students = async (req, res) => {
  const year = req.query.year;
    let query = `
    SELECT * FROM students
    WHERE status = '1'
  `;
  const queryParams = [];
  if (year) {
    query += ` AND year = ?`;
    queryParams.push(year);
  }

  try {
    const students = await get_database(query, queryParams);
    res.json(students);
  } catch (err) {
    console.error("Error Fetching Students", err);
    res.status(500).json({ error: "Error Fetching Students" });
  }
};


//leave apply
const { format } = require("date-fns");

exports.post_leave = async (req, res) => {
  const student = req.query.student;
  const { leave, from_date, from_time, to_date, to_time, reason } = req.body;

  console.log(student);

  if (!student) {
    return res.status(400).json({ error: "Student id is required." });
  }

  try {
    // Convert dates from DD/MM/YYYY to YYYY-MM-DD
    const fromDateFormatted = format(
      new Date(from_date.split("/").reverse().join("-")),
      "yyyy-MM-dd"
    );
    const toDateFormatted = format(
      new Date(to_date.split("/").reverse().join("-")),
      "yyyy-MM-dd"
    );

    const query = `
          INSERT INTO \`leave\`(\`student\`, \`leave\`, \`from_date\`, \`from_time\`, \`to_date\`, \`to_time\`, \`reason\`)
          VALUES (?, ?, ?, ?, ?, ? , ?);
      `;
    const leaves = await post_database(query, [
      student,
      leave,
      fromDateFormatted,
      from_time,
      toDateFormatted,
      to_time,
      reason,
    ]);
    res.json(leaves);
  } catch (err) {
    console.error("Error Inserting Leave", err);
    res.status(500).json({ error: "Error Inserting Leave" });
  }
};
