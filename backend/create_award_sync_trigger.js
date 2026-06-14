const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'student_management'
  });

  await conn.query('DROP TRIGGER IF EXISTS trig_after_approval_update');
  await conn.query(`
    CREATE TRIGGER trig_after_approval_update
    AFTER UPDATE ON 审批流程总表
    FOR EACH ROW
    BEGIN
      IF NEW.审批类型 = '评优申请' AND NEW.审批状态 = '已通过' THEN
        UPDATE 评优申请表 
        SET 终评意见 = IFNULL(NEW.审核意见, '同意推荐'), 
            公示状态 = '已公示', 
            获奖等级 = '拟推荐' 
        WHERE 审批编号 = NEW.审批编号;
      ELSEIF NEW.审批类型 = '评优申请' AND NEW.审批状态 = '已驳回' THEN
        UPDATE 评优申请表 
        SET 终评意见 = IFNULL(NEW.审核意见, '不予推荐'), 
            公示状态 = '审核驳回' 
        WHERE 审批编号 = NEW.审批编号;
      END IF;
    END
  `);

  console.log('Sync trigger created successfully.');
  await conn.end();
}
run();
