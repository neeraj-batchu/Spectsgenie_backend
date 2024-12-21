const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'spectsgenie',
    connectTimeout: 10000, // Timeout set to 10 seconds

})

module.exports = mySqlPool;