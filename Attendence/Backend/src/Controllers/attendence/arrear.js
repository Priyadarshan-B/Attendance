const { get_database, post_database } = require("../../config/db_utils");

exports.get_arrear_att = async (req, res) => {
  try {
    const query = `
        SELECT re_appear.id, students.name, students.register_number,
        slot,att_session
        FROM re_appear
        INNER JOIN students
        ON re_appear.student = students.id
        WHERE 
        re_appear.status = '1';
        `;
    const get_attendence = await get_database(query);
    if (get_attendence.length > 0) {
      const formattedDetails = get_attendence.map((detail) => {
        const date = new Date(detail.att_session);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours24 = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        const hours12 = hours24 % 12 || 12;
        const period = hours24 < 12 ? "AM" : "PM";
        const formattedDate = `${day} / ${month} / ${year}`;
        const formattedTime = `${String(hours12).padStart(
          2,
          "0"
        )}:${minutes}:${seconds} ${period}`;

        return {
          ...detail,
          date: formattedDate,
          time: formattedTime,
        };
      });
      res.json(formattedDetails);
    } else {
      res.status(404).json({ error: "No Data Present.." });
    }
  } catch (err) {
    console.error("Error Fetching attendence type 2", err);
    return res.status(500).json({ error: "Error Fetching attendence type 2" });
  }
};

exports.post_arrear_stu_att = async(req, res)=>{
  const {faculty, student, slot} = req.body;
  if(!faculty || !student || !slot ){
    return res.status(400).json({error:"Student id is required.."})

  }
  try{
    const validateQuery = `
    SELECT att_status 
    FROM students
    WHERE id = ?
    AND status = '1';
    `
const [validate] = await get_database(validateQuery, [student])
console.log(validate)

if(validate && validate.att_status === '1'){
console.log("hii")
    const query = `
    INSERT INTO re_appear (faculty,  student , slot,att_session)
     VALUES(?,?,?,CURRENT_TIMESTAMP);
    `
    const arrear_attendence = await post_database(query,[faculty,student,slot])
    res.json(arrear_attendence)
  }
  else {
    res.status(400).json({ error: "Student status is not valid for attendance." });
}
}
  catch(err){
    console.error("Error Inserting arrear attendence",err)
    res.status(500).json("Error Inserting arrear attendence")

  }
}

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