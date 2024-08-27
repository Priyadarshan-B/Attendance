const { get_database, post_database } = require("../../config/db_utils");

// exports.get_resource = async (req, res) => {
//   const gmail = req.query.gmail;

//   if (!gmail) {
//     return res.status(400).json({ error: "gmail is required" });
//   }

//   try {
//     const baseRoleQuery = `
//       SELECT role_id FROM mentor WHERE gmail = ? AND status = '1'
//       UNION
//       SELECT role_id FROM students WHERE gmail = ? AND status = '1'
//     `;

//     const baseRoles = await get_database(baseRoleQuery, [gmail, gmail]);

//     if (baseRoles.length > 0) {
//       const roleIds = baseRoles.map(row => row.role_id);

//       const mentorResourcesQuery = `
//         SELECT resources.name, resources.icon_path, resources.path
//         FROM resources
//         INNER JOIN role_resources ON role_resources.resources_id = resources.id
//         WHERE role_resources.role_id IN (${roleIds.join(',')})
//         AND role_resources.status = '1'
//         AND resources.status = '1'
//       `;

//       const mentorResources = await get_database(mentorResourcesQuery);

//       const facultyRolesQuery = `
//         SELECT role FROM roles_faculty
//         WHERE mentor = (
//           SELECT id FROM mentor WHERE gmail = ? AND status = '1'
//         )
//         AND status = '1'
//       `;

//       const facultyRoles = await get_database(facultyRolesQuery, [gmail]);

//       if (facultyRoles.length > 0) {
//         const facultyRoleIds = facultyRoles.map(row => row.role);

//         const facultyResourcesQuery = `
//           SELECT resources.name, resources.icon_path, resources.path
//           FROM resources
//           INNER JOIN role_resources ON role_resources.resources_id = resources.id
//           WHERE role_resources.role_id IN (${facultyRoleIds.join(',')})
//           AND role_resources.status = '1'
//           AND resources.status = '1'
//         `;

//         const facultyResources = await get_database(facultyResourcesQuery);

//         const combinedResources = [...mentorResources, ...facultyResources];
        
//         const uniqueResources = combinedResources.reduce((acc, current) => {
//           const x = acc.find(item => item.path === current.path);
//           if (!x) {
//             return acc.concat([current]);
//           } else {
//             return acc;
//           }
//         }, []);

//         return res.json(uniqueResources);
//       }

//       return res.json(mentorResources);
//     } else {
//       return res.status(404).json({ error: "No resources found for the given Gmail." });
//     }
//   } catch (err) {
//     console.error("Error fetching resources", err);
//     res.status(500).json({ error: "Error fetching resources" });
//   }
// };

exports.get_resource = async (req, res) =>{
const role = req.query.role
if(!role){
  res.status(400).json({error:"Role id is required"})
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
