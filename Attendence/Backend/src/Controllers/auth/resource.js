const { get_database, post_database } = require("../../config/db_utils");

exports.get_resource = async (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: "Role id is required" });
  }
  try {
    const query = `
    SELECT rs.name, rs.icon_path, rs.path, rs.order_by
    FROM roles r
    JOIN resources rs ON FIND_IN_SET(rs.id, r.resources)
    WHERE r.id =?
    AND rs.status = '1' 
    ORDER BY order_by
  `;
    const resource = await get_database(query, [role]);
    res.json(resource);
  } catch (err) {
    console.error("Error fetching resources", err);
    res.status(500).json({ error: "Error fetching resources" });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const query = `
     SELECT * FROM roles where status in('1', '2')
    `;
    const roles = await get_database(query);
    res.json(roles);
  } catch (err) {
    console.error("Error fetching roles", err);
    res.status(500).json({ error: "Error fetching roles" });
  }
};

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
    const roleIds = roles.map((role) => role.role_id);
    res.json(roleIds);
  } catch {
    return res.status(500).json({ message: "Error to validate Roles" });
  }
};

exports.updateRole = async (req, res) => {
  const { gmail, role } = req.body;

  if (!gmail) {
    return res.status(400).json({ error: "Gmail is required..." });
  }
  try {
    let query = `SELECT * FROM mentor WHERE gmail = ? AND status = '1'`;
    let result = await get_database(query, [gmail]);

    if (result.length > 0) {
      query = `UPDATE mentor SET role_id = ? WHERE gmail = ? AND status = '1'`;
      const updated = await post_database(query, [role, gmail]);
      return res.json({ message: "Role updated in mentor table", updated });
    }

    query = `SELECT * FROM students WHERE gmail = ? AND status = '1'`;
    result = await get_database(query, [gmail]);

    if (result.length > 0) {
      query = `UPDATE students SET role_id = ? WHERE gmail = ? AND status = '1'`;
      const updated = await post_database(query, [role, gmail]);
      return res.json({ message: "Role updated in students table", updated });
    }
    res
      .status(404)
      .json({ error: "Gmail not found in mentor or students table" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Error updating role" });
  }
};
