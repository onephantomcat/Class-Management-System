const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'student_management' });
  const [rows] = await conn.query("SHOW TRIGGERS");
  const t = rows.filter(r => r.Table === '班费支出申请表');
  console.log(t);
  process.exit(0);
}
run();
