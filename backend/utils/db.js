// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,             // mapped host port to container's 3306
  user: 'root',
  password: 'Shipwayongc',
  database: 'ai_app',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
});

module.exports = pool;
