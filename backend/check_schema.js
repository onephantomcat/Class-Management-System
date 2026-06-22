const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'student_management' });
  const [rows] = await conn.query("SHOW TRIGGERS");
  const t = rows.filter(r => r.Table === '学业成绩明细表');
  console.log('Triggers on 学业成绩明细表:', t.map(x => ({ Trigger: x.Trigger, Event: x.Event, Statement: x.Statement })));
  
  const [rows2] = await conn.query("SHOW CREATE TABLE 学业成绩明细表");
  console.log('Table 学业成绩明细表:', rows2[0]['Create Table']);
  
  const [rows3] = await conn.query("SHOW CREATE TABLE 班级学期课表");
  console.log('Table 班级学期课表:', rows3[0]['Create Table']);
  process.exit(0);
}
run();
