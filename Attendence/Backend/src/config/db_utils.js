const { db1Connection, db2Connection } = require('./database'); // Adjust the path as necessary

async function get_database(query, params, db = 'db1') {
  const dbConnection = db === 'db2' ? db2Connection : db1Connection;
  try {
    const [result] = await dbConnection.promise().query(query, params);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    throw new Error(`Error executing get query on ${db}: ${query}. ${err.message}`);
  }
}

async function post_database(query, params, db = 'db1', success_message = "Posted Successfully") {
  const dbConnection = db === 'db2' ? db2Connection : db1Connection;
  try {
    const [result] = await dbConnection.promise().query(query, params);
    return { result, message: success_message };
  } catch (err) {
    throw new Error(`Error executing post query on ${db}: ${query}. ${err.message}`);
  }
}

module.exports = { get_database, post_database };



// const db1Connection = require("./database");

// async function get_database(query, params) {
//   try {
//     const [result] = await db1Connection.promise().query(query, params);
//     return result;
//   } catch (err) {
//     throw new Error(`Error executing get query: ${query}. ${err.message}`);
//   }
// }

// async function post_database(
//   query,
//   params,
//   success_message = "Posted Successfully"
// ) {
//   try {
//     const [result] = await db1Connection.promise().query(query, params);
//     return result, success_message;
//   } catch (err) {
//     throw new Error(`Error executing get query: ${query}. ${err.message}`);
//   }
// }

// module.exports = { get_database, post_database };
