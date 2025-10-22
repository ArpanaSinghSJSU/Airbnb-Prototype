const mysql = require('mysql2');
require('dotenv').config();

console.log('Attempting to connect to database...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.error('Full error:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database');
  connection.release();
});

module.exports = promisePool;
