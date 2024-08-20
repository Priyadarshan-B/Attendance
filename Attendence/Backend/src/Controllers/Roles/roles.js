const { get_database, post_database } = require("../../config/db_utils");

exports.get_all_roles_map = async (req, res) => {
  try {
    const query = `
        SELECT 
    mentor.id, 
    mentor.name, 
    mentor.staff_id, 
    mentor.gmail, 
    GROUP_CONCAT(DISTINCT roles.name ORDER BY roles.id SEPARATOR ',') AS roles
FROM 
    mentor
JOIN 
    (
        SELECT 
            mentor.id AS mentor_id, 
            roles.id AS role_id
        FROM 
            mentor
        JOIN 
            roles ON mentor.role_id = roles.id
        UNION
        SELECT 
            mentor.id AS mentor_id, 
            roles.id AS role_id
        FROM 
            roles_faculty rf
        JOIN 
            mentor ON rf.mentor = mentor.id
        JOIN 
            roles ON rf.role = roles.id
    ) AS all_roles ON all_roles.mentor_id = mentor.id
JOIN 
    roles ON all_roles.role_id = roles.id
WHERE 
    mentor.status = '1'
GROUP BY 
    mentor.id;
 `;
 const getRoleMap = await get_database(query)
 res.json(getRoleMap)
  } catch (err) {
    console.error("Error Fetching Role map", err);
    res.status(500).json({ error: "Error Fetching Role map" });
}
};

