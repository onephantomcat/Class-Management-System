USE student_management;

DROP TRIGGER IF EXISTS trig_获奖自动改公示状态;
DELIMITER //
CREATE TRIGGER trig_获奖自动改公示状态
BEFORE UPDATE ON 评优申请表
FOR EACH ROW
BEGIN
    IF NEW.获奖等级 IS NOT NULL AND (OLD.获奖等级 IS NULL OR OLD.获奖等级 = '未定') AND NEW.获奖等级 != '未定' THEN
        SET NEW.公示状态 = '待公示';
    END IF;
END //
DELIMITER ;
