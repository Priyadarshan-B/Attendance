const { get_database } = require("../../config/db_utils");


exports.get_resource = async (req, res) =>{
const role = req.query.role
if(!role){
 return res.status(400).json({error:"Role id is required"})
}
try{
  const query = `
  SELECT rs.name, rs.icon_path, rs.path, rs.order_by
  FROM roles r
  JOIN resources rs ON FIND_IN_SET(rs.id, r.resources)
  WHERE r.id =?
  AND rs.status = '1' 
  ORDER BY order_by
`
const resource = await get_database(query, [role])
res.json(resource)
}
catch(err){
  console.error("Error fetching resources", err);
  res.status(500).json({ error: "Error fetching resources" });
}

}


exports.validateRole = async (req, res) => {
  const resources_id = req.query.resources_id;
  if (!resources_id) {
    return res.status(400).json({ message: "Resource id is required" });
  }
  try {
    const query = `
        SELECT role_id FROM role_resources
INNER JOIN roles
ON role_resources.role_id = roles.id 
WHERE resources_id=?
        `;
   const roles = await get_database(query, [resources_id]);
   const roleIds = roles.map(role => role.role_id); 
   res.json(roleIds);
  } catch {
    return res.status(500).json({ message: "Error to validate Roles" });
  }
};
