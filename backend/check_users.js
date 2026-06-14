const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'student_management'});
  try {
    const [rows] = await conn.query('SELECT 学工号, 姓名 FROM 用户账号与权限信息表');
    console.log(rows);
  } catch(e) {
    console.error(e);
  } finally {
    conn.end();
  }
}
run();
