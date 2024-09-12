const mysql = require("mysql2");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const db1Connection = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME 
});

const db2Connection = mysql.createPool({
    host: process.env.HOST2, 
    user: process.env.USER_NAME2,
    password: process.env.PASSWORD2,
    database: process.env.DB2 
});

db1Connection.getConnection((err, conn) => {
    if (err) {
        console.error("Error connecting to DB1:", err);
        console.log("Connection to DB1 Failed");
    } else {
        console.log("Connection to DB1 success");
        conn.release();
    }
});

db2Connection.getConnection((err, conn) => {
    if (err) {
        console.error("Error connecting to DB2:", err);
        console.log("Connection to DB2 Failed");
    } else {
        console.log("Connection to DB2 success");
        conn.release();
    }
});

db1Connection.on('error', err => {
    console.error("MySQL DB1 Pool Error:", err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error("Connection to DB1 Lost! Trying to Reconnect...");
        db1Connection.getConnection();
    }
});

db2Connection.on('error', err => {
    console.error("MySQL DB2 Pool Error:", err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error("Connection to DB2 Lost! Trying to Reconnect...");
        db2Connection.getConnection();
    }
});


db1Connection.on("acquire", connection => {
    console.log("MySQL DB1 Acquired");
});

db1Connection.on("release", connection => {
    console.log("MySQL DB1 Released");
});

db2Connection.on("acquire", connection => {
    console.log("MySQL DB2 Acquired");
});

db2Connection.on("release", connection => {
    console.log("MySQL DB2 Released");
});

module.exports = { db1Connection, db2Connection };
