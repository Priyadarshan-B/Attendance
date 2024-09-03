const { get_database } = require("../../config/db_utils");

exports.get_student_report = async (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res.status(400).json({ error: "Year is required.." });
  }
  try {
    let query;
    let params = [] 
   if(year === 'All'){ query = `
        SELECT s.name, s.register_number,s.year,s.gmail, pd.* FROM placement_data pd
INNER JOIN students s
ON pd.student = s.id
AND pd.status = '1'
        `;
    } else if (year === 'I' || year === 'II' || year === 'III' || year === 'IV'){
        query = `
        SELECT s.name, s.register_number,s.year,s.gmail, pd.* FROM placement_data pd
INNER JOIN students s
ON pd.student = s.id
WHERE s.year = ?
AND pd.status = '1'
        `; 
        params.push(year)
    }
    else {
        return res.status(400).json({error: "Invalid year specified."});
    }
    const get_student = await get_database(query,params);
    res.json(get_student);
  } catch (err) {
    console.error("Error Fetching Student Report List", err);
    res.status(500).json({ error: "Error fetching Student Report List" });
  }
};
