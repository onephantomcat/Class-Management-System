const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'student_management'
  });

  await conn.query('DROP TRIGGER IF EXISTS trig_before_activity_register');
  await conn.query(`
    CREATE TRIGGER trig_before_activity_register 
    BEFORE INSERT ON 活动报名表 
    FOR EACH ROW 
    BEGIN 
      DECLARE current_count INT; 
      DECLARE max_limit INT; 
      
      SELECT COUNT(*) INTO current_count FROM 活动报名表 WHERE 活动编号 = NEW.活动编号 AND 报名人学号 = NEW.报名人学号; 
      IF current_count > 0 THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '您已经报名过该活动，请勿重复报名！'; 
      END IF; 
      
      SELECT 人数限制 INTO max_limit FROM 班级活动申请表 WHERE 活动编号 = NEW.活动编号; 
      SELECT COUNT(*) INTO current_count FROM 活动报名表 WHERE 活动编号 = NEW.活动编号; 
      IF current_count >= max_limit THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '该活动报名人数已达上限，报名通道已关闭！'; 
      END IF; 
      
      IF NEW.报名编号 IS NULL OR NEW.报名编号 = '' THEN 
        SET NEW.报名编号 = CONCAT('REG_', UNIX_TIMESTAMP(), '_', LPAD(FLOOR(RAND() * 1000), 3, '0')); 
      END IF; 
      
      IF NEW.报名时间 IS NULL THEN SET NEW.报名时间 = NOW(); END IF; 
      IF NEW.签到状态 IS NULL THEN SET NEW.签到状态 = '未签到'; END IF; 
    END
  `);

  await conn.query('DROP TRIGGER IF EXISTS trig_before_award_apply');
  await conn.query(`
    CREATE TRIGGER trig_before_award_apply 
    BEFORE INSERT ON 评优申请表 
    FOR EACH ROW 
    BEGIN 
      DECLARE fail_count INT; 
      DECLARE punish_count INT; 
      
      SELECT COUNT(*) INTO fail_count FROM 学业成绩明细表 WHERE 学生学工号 = NEW.申请人学号 AND 总评成绩 < 60; 
      SELECT COUNT(*) INTO punish_count FROM 纪律与考勤档案表 WHERE 学生学工号 = NEW.申请人学号 AND 记录类型 = '处分'; 
      IF fail_count > 0 OR punish_count > 0 THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '该学生存在挂科或违纪处分记录，系统已自动拦截其评优申请！'; 
      END IF; 
      
      SELECT COUNT(*) INTO fail_count FROM 评优申请表 WHERE 评优项目编号 = NEW.评优项目编号 AND 申请人学号 = NEW.申请人学号; 
      IF fail_count > 0 THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '您已经申请过该评优项目，请勿重复提交！'; 
      END IF; 
      
      IF NEW.申报编号 IS NULL OR NEW.申报编号 = '' THEN 
        SET NEW.申报编号 = CONCAT('AW_', UNIX_TIMESTAMP(), '_', LPAD(FLOOR(RAND() * 1000), 3, '0')); 
      END IF; 
      
      IF NEW.初评意见 IS NULL THEN SET NEW.初评意见 = '待评审'; END IF; 
      IF NEW.复评投票数 IS NULL THEN SET NEW.复评投票数 = 0; END IF; 
      IF NEW.终评意见 IS NULL THEN SET NEW.终评意见 = '待评审'; END IF; 
      IF NEW.获奖等级 IS NULL THEN SET NEW.获奖等级 = '未定'; END IF; 
      IF NEW.公示状态 IS NULL THEN SET NEW.公示状态 = '未公示'; END IF; 
    END
  `);

  console.log('Triggers created successfully.');
  await conn.end();
}
run();
