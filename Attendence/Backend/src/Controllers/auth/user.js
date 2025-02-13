const { get_database } = require("../../config/db_utils");

const findUserByEmail = async (email) => {
  try {
    const Query = "SELECT id, name, gmail, role_id FROM mentor WHERE gmail = ?";
    let users = await get_database(Query, [email]);
    if (users.length > 0) {
      return { ...users[0] };
    }
    const studentQuery = "SELECT id, name, gmail, register_number, role_id FROM students WHERE gmail = ?"
    users = await get_database(studentQuery, [email])
    if (users.length > 0) {
        return { ...users[0] }; 
      }
      
    return null;
  } catch (error) {
    throw new Error('Error finding user by email');
  }
};

module.exports = { findUserByEmail };
