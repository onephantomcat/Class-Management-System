const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'student_management'});
  try {
    await conn.execute('INSERT INTO 纪律与考勤档案表 (记录编号, 学生学工号, 记录类型, 考勤状态, 处分类型, 记录时间, 记录人学工号, 请假审批编号) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)', ['TEST_999', 'S001', '考勤', '迟到', '', 'S005', null]);
    console.log('success');
  } catch(e) {
    console.error('SQL Error:', e.message);
  } finally {
    conn.end();
  }
}
run();
