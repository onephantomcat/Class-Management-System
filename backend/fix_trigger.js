const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'student_management'});
  try {
    await conn.query(`DROP TRIGGER IF EXISTS trig_discipline_audit_log`);
    await conn.query(`
      CREATE TRIGGER trig_discipline_audit_log
      AFTER INSERT ON 纪律与考勤档案表
      FOR EACH ROW
      BEGIN
        INSERT INTO 系统全局操作日志表 (
          操作编号, 操作人学工号, 操作模块, 操作类型, 操作结果
        ) VALUES (
          CONCAT('LOG_', UNIX_TIMESTAMP(), '_', LPAD(FLOOR(RAND() * 1000), 3, '0')),
          NEW.记录人学工号,
          '纪律与考勤管理',
          '新增记录',
          '成功'
        );
      END
    `);
    console.log('Trigger fixed successfully!');
  } catch(e) {
    console.error('SQL Error:', e.message);
  } finally {
    conn.end();
  }
}
run();
