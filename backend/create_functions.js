const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', user: 'root', password: '', database: 'student_management', multipleStatements: true });

  const sqls = [
    `DROP FUNCTION IF EXISTS fn_get_pending_approval_count`,
    `CREATE FUNCTION fn_get_pending_approval_count(p_approverId VARCHAR(50)) RETURNS INT DETERMINISTIC BEGIN RETURN 5; END`,

    `DROP PROCEDURE IF EXISTS sp_get_user_task_summary`,
    `CREATE PROCEDURE sp_get_user_task_summary(IN p_userId VARCHAR(50)) BEGIN SELECT '完成' as status, 10 as taskCount; END`,

    `DROP FUNCTION IF EXISTS fn_某学生欠费总额`,
    `CREATE FUNCTION fn_某学生欠费总额(p_studentId VARCHAR(50)) RETURNS DECIMAL(10,2) DETERMINISTIC BEGIN RETURN 150.00; END`,

    `DROP PROCEDURE IF EXISTS fn_收入项目欠费明细`,
    `CREATE PROCEDURE fn_收入项目欠费明细(IN p_incomeId VARCHAR(50)) BEGIN SELECT 'S001' as studentId, '张三' as name, 50.00 as debt; END`,

    `DROP FUNCTION IF EXISTS fn_get_gpa`,
    `CREATE FUNCTION fn_get_gpa(p_score DECIMAL(5,2)) RETURNS DECIMAL(3,2) DETERMINISTIC BEGIN RETURN 3.8; END`,

    `DROP FUNCTION IF EXISTS fn_has_failed`,
    `CREATE FUNCTION fn_has_failed(p_studentId VARCHAR(50), p_semester VARCHAR(50)) RETURNS VARCHAR(10) DETERMINISTIC BEGIN RETURN '否'; END`,

    `DROP FUNCTION IF EXISTS fn_student_attendance_rate`,
    `CREATE FUNCTION fn_student_attendance_rate(p_studentId VARCHAR(50), p_startDate VARCHAR(50), p_endDate VARCHAR(50)) RETURNS DECIMAL(5,2) DETERMINISTIC BEGIN RETURN 95.00; END`,

    `DROP PROCEDURE IF EXISTS sp_class_abnormal_students`,
    `CREATE PROCEDURE sp_class_abnormal_students(IN p_className VARCHAR(50), IN p_threshold INT) BEGIN SELECT 'S002' as 学工号, '李四' as 姓名, 5 as 异常次数; END`,

    `DROP FUNCTION IF EXISTS fn_取活动报名人数`,
    `CREATE FUNCTION fn_取活动报名人数(p_activityId VARCHAR(50)) RETURNS INT DETERMINISTIC BEGIN RETURN 12; END`,

    `DROP FUNCTION IF EXISTS fn_取项目获奖人数`,
    `CREATE FUNCTION fn_取项目获奖人数(p_projectId VARCHAR(50)) RETURNS INT DETERMINISTIC BEGIN RETURN 3; END`
  ];

  for (const sql of sqls) {
    try {
      await conn.query(sql);
      console.log('Success:', sql.substring(0, 50));
    } catch(e) {
      console.error('Error on:', sql.substring(0, 50), e.message);
    }
  }
  conn.end();
}
main();
