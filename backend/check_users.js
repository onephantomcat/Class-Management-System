const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'student_management' });
  const [rows] = await conn.query("SELECT * FROM 用户账号与权限信息表");
  console.log(rows.map(r => r.学工号));
  process.exit(0);
}
run();
