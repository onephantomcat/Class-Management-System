const mysql = require('mysql2/promise');
async function main() {
  try {
    const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'student_management' });
    const [rows] = await conn.query("SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW'");
    for (const row of rows) {
      console.log(row.Tables_in_student_management);
    }
    conn.end();
  } catch(e) {
    console.error(e);
  }
}
main();
