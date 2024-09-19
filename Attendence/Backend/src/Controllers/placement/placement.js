const { get_database } = require("../../config/db_utils");

const formatSkills = (skillString) => {
  if (!skillString) return "N/A";
  return skillString.split(',').map(skill => skill.trim()).join('\n');
};

exports.get_placement = async (req, res) => {
  const mentor = req.query.mentor;

  if (!mentor) {
    return res.status(400).json({ error: "Mentor id is required." });
  }

  try {
    const mentorStudentQuery = `
      SELECT student 
      FROM mentor_student
      WHERE mentor = ?
    `;
    const studentsResult = await get_database(mentorStudentQuery, [mentor]);

    if (studentsResult.length === 0) {
      return res.status(404).json({ error: "No students found for this mentor." });
    }

    const studentIds = studentsResult.map(record => record.student);

    const placementDataQuery = `
      SELECT 
        s.name, 
        s.register_number, 
        p.placement_rank, 
        p.placement_group, 
        p.placement_score, 
        p.personalized_skill, 
        p.reward_points, 
        p.att_percent
      FROM placement_data p
      JOIN students s ON p.student = s.id
      WHERE p.student = ? AND p.status = '1';
    `;

    const placementDataPromises = studentIds.map(studentId => 
      get_database(placementDataQuery, [studentId])
    );

    const placementDataResults = await Promise.all(placementDataPromises);

    const placementData = placementDataResults
      .flat()
      .filter(data => Object.keys(data).length !== 0)
      .map(data => ({
        ...data,
        personalized_skill: formatSkills(data.personalized_skill),
      }));

    if (placementData.length === 0) {
      return res.json({ error: "No placement data found for the students." });
    }

    return res.status(200).json({ data: placementData });

  } catch (err) {
    console.error("Error fetching placement data:", err);
    return res.status(500).json({ error: "Error fetching placement data." });
  }
};

exports.get_placement_subMentor = async (req, res) => {
  const mentor = req.query.mentor;

  if (!mentor) {
    return res.status(400).json({ error: "Mentor id is required." });
  }

  try {
    const mentorStudentQuery = `
      SELECT student 
      FROM mentor_student
      WHERE sub_mentor = ?
    `;
    const studentsResult = await get_database(mentorStudentQuery, [mentor]);

    if (studentsResult.length === 0) {
      return res.status(404).json({ error: "No students found for this mentor." });
    }

    const studentIds = studentsResult.map(record => record.student);

    const placementDataQuery = `
      SELECT 
        s.name, 
        s.register_number, 
        p.placement_rank, 
        p.placement_group, 
        p.placement_score, 
        p.personalized_skill, 
        p.reward_points, 
        p.att_percent
      FROM placement_data p
      JOIN students s ON p.student = s.id
      WHERE p.student = ? AND p.status = '1';
    `;

    const placementDataPromises = studentIds.map(studentId => 
      get_database(placementDataQuery, [studentId])
    );

    const placementDataResults = await Promise.all(placementDataPromises);

    const placementData = placementDataResults
      .flat()
      .filter(data => Object.keys(data).length !== 0)
      .map(data => ({
        ...data,
        personalized_skill: formatSkills(data.personalized_skill),
      }));

    // if (placementData.length === 0) {
    //   return res.json({ error: "No placement data found for the students." });
    // }

    return res.status(200).json({ data: placementData });

  } catch (err) {
    console.error("Error fetching placement data:", err);
    return res.status(500).json({ error: "Error fetching placement data." });
  }
};


exports.get_stu_placement = async(req, res)=>{
  const student = req.query.student
  if(!student){
    res.status(400).json({error:"Student id is required!!"})
  }
  try{
    const query = 
      `SELECT * FROM placement_data 
      WHERE student = ? 
      AND status = '1'
      `
      const stuPlacement = await get_database(query, [student])
      res.json(stuPlacement)
      }
  catch(err){
    console.error("Error fetching placement data:", err);
    return res.status(500).json({ error: "Error fetching placement data." });
  }
}