const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'student_management'
  });

  const queries = [
    `DROP PROCEDURE IF EXISTS sp_calc_student_gpa;`,
    `CREATE PROCEDURE sp_calc_student_gpa(IN p_student_id VARCHAR(50), IN p_semester VARCHAR(50))
     BEGIN
       DECLARE v_avg_gpa DECIMAL(10,2) DEFAULT 0.00;
       DECLARE v_fail_count INT DEFAULT 0;
       DECLARE v_record_id VARCHAR(100);

       SELECT IFNULL(SUM(绩点 * 学分) / NULLIF(SUM(学分), 0), 0.00), COUNT(IF(总评成绩 < 60, 1, NULL))
       INTO v_avg_gpa, v_fail_count
       FROM 学业成绩明细表
       WHERE 学生学工号 = p_student_id AND 学期 = p_semester;

       SET v_record_id = CONCAT('GPA_', p_student_id, '_', p_semester);

       INSERT INTO 学生学期绩点总表 (记录编号, 学生学工号, 学期, 平均绩点, 挂科科目数, 挂科标记, 更新时间)
       VALUES (v_record_id, p_student_id, p_semester, v_avg_gpa, v_fail_count, IF(v_fail_count > 0, '有挂科', '无挂科'), NOW())
       ON DUPLICATE KEY UPDATE
         平均绩点 = v_avg_gpa,
         挂科科目数 = v_fail_count,
         挂科标记 = IF(v_fail_count > 0, '有挂科', '无挂科'),
         更新时间 = NOW();
     END;`,
    `DROP TRIGGER IF EXISTS trig_before_score_insert;`,
    `CREATE TRIGGER trig_before_score_insert
     BEFORE INSERT ON 学业成绩明细表
     FOR EACH ROW
     BEGIN
       IF NEW.总评成绩 < 0 OR NEW.总评成绩 > 100 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '分数必须在 0 到 100 之间！';
       END IF;

       IF NEW.总评成绩 < 60 THEN
         SET NEW.绩点 = 0.0;
       ELSEIF NEW.总评成绩 >= 100 THEN
         SET NEW.绩点 = 5.0;
       ELSE
         SET NEW.绩点 = (NEW.总评成绩 - 50) / 10.0;
       END IF;
     END;`,
    `DROP TRIGGER IF EXISTS trig_before_score_update;`,
    `CREATE TRIGGER trig_before_score_update
     BEFORE UPDATE ON 学业成绩明细表
     FOR EACH ROW
     BEGIN
       IF NEW.总评成绩 < 0 OR NEW.总评成绩 > 100 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '分数必须在 0 到 100 之间！';
       END IF;

       IF NEW.总评成绩 < 60 THEN
         SET NEW.绩点 = 0.0;
       ELSEIF NEW.总评成绩 >= 100 THEN
         SET NEW.绩点 = 5.0;
       ELSE
         SET NEW.绩点 = (NEW.总评成绩 - 50) / 10.0;
       END IF;
     END;`,
    `DROP TRIGGER IF EXISTS trig_after_score_insert;`,
    `CREATE TRIGGER trig_after_score_insert
     AFTER INSERT ON 学业成绩明细表
     FOR EACH ROW
     BEGIN
       CALL sp_calc_student_gpa(NEW.学生学工号, NEW.学期);
     END;`,
    `DROP TRIGGER IF EXISTS trig_after_score_update;`,
    `CREATE TRIGGER trig_after_score_update
     AFTER UPDATE ON 学业成绩明细表
     FOR EACH ROW
     BEGIN
       CALL sp_calc_student_gpa(NEW.学生学工号, NEW.学期);
     END;`
  ];

  for (let q of queries) {
    try {
      await conn.query(q);
      console.log('Executed:', q.substring(0, 50).trim() + '...');
    } catch (e) {
      console.error('Error executing query:', q.substring(0, 50).trim() + '...', e);
    }
  }
  console.log('Triggers and SP created successfully');
  conn.end();
}

main();
