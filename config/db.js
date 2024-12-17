const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: 'localhost',
    user: 'neeraj',
    password: 'root',
    database: 'spectsgenie'
})

module.exports = mySqlPool;