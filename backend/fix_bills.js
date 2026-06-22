const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'student_management' });
  await conn.query("DELETE FROM 学生缴费明细表 WHERE 学工号 = 'T001'");
  console.log('Deleted T001 bills');
  process.exit(0);
}
run();
