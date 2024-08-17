const mysql = require("mysql2")
const path = require('path')
require('dotenv').config({path:path.resolve(__dirname,'../../.env')})

console.log(process.env.USER_NAME)
console.log(process.env.NAME)
console.log(process.env.PASSWORD)


const connection = mysql.createPool({
    
    host:process.env.HOST, 
    user:process.env.USER_NAME,
    password:process.env.PASSWORD,
    database:process.env.NAME 
})
connection.getConnection((err, conn)=>{
    if(err){
        console.error("Error connecting to MySQL:", err)
        console.log("Connection Failed")
    }
    console.log("Connection success ")
    conn.release()
})

connection.on('error', err=>{
    console.error("MySQL Pool Error:",err);h
    if(err.code === 'PROTOCOL_CONNECTION_LOST'){
        console.error("Connection Lost! Trying to Reconnect..")
        connection.getConnection();
    }
})
connection.on("acquire",connection =>{
    console.log("MySQL Acquired")
}
)
connection.on("release",connection =>{
    console.log("MySQL Released")
}
)
module.exports = connection;