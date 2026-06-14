USE student_management;

DELIMITER $$

-- 1. 自动根据关联的请假审批单将违纪状态转为“请假”
DROP TRIGGER IF EXISTS trig_attendance_check_leave$$
CREATE TRIGGER trig_attendance_check_leave
BEFORE INSERT ON 纪律与考勤档案表
FOR EACH ROW
BEGIN
  -- 如果有提供请假审批编号，且记录类型为'考勤'，则强制修正为请假
  IF NEW.记录类型 = '考勤' AND NEW.请假审批编号 IS NOT NULL AND NEW.请假审批编号 != '' THEN
    SET NEW.考勤状态 = '请假';
  END IF;
END$$

-- 2. 纪律/考勤异动自动留痕
DROP TRIGGER IF EXISTS trig_discipline_audit_log$$
CREATE TRIGGER trig_discipline_audit_log
AFTER INSERT ON 纪律与考勤档案表
FOR EACH ROW
BEGIN
  INSERT INTO 系统全局操作日志表 (
    日志编号, 操作人学工号, 业务模块, 操作类型, 操作结果
  ) VALUES (
    CONCAT('LOG_', UNIX_TIMESTAMP(), '_', LPAD(FLOOR(RAND() * 1000), 3, '0')),
    NEW.记录人学工号,
    '纪律与考勤管理',
    '新增记录',
    '成功'
  );
END$$

DELIMITER ;
