USE student_management;

DELIMITER $$

-- 1. 存储过程：计算学生指定学期的 GPA 并更新/插入总表
DROP PROCEDURE IF EXISTS sp_calc_student_gpa$$
CREATE PROCEDURE sp_calc_student_gpa(IN p_student_id VARCHAR(50), IN p_semester VARCHAR(50))
BEGIN
  DECLARE v_avg_gpa DECIMAL(10,2) DEFAULT 0.00;
  DECLARE v_fail_count INT DEFAULT 0;
  DECLARE v_record_id VARCHAR(100);

  -- 计算加权平均绩点 (Σ(绩点 * 学分) / Σ(学分)) 和 挂科数 (总评成绩 < 60)
  SELECT 
    IFNULL(SUM(绩点 * 学分) / NULLIF(SUM(学分), 0), 0.00),
    COUNT(IF(总评成绩 < 60, 1, NULL))
  INTO v_avg_gpa, v_fail_count
  FROM 学业成绩明细表
  WHERE 学生学工号 = p_student_id AND 学期 = p_semester;

  SET v_record_id = CONCAT('GPA_', p_student_id, '_', p_semester);

  -- 插入或更新学生学期绩点总表
  INSERT INTO 学生学期绩点总表 (记录编号, 学生学工号, 学期, 平均绩点, 挂科科目数, 挂科标记, 更新时间)
  VALUES (v_record_id, p_student_id, p_semester, v_avg_gpa, v_fail_count, IF(v_fail_count > 0, '有挂科', '无挂科'), NOW())
  ON DUPLICATE KEY UPDATE
    平均绩点 = v_avg_gpa,
    挂科科目数 = v_fail_count,
    挂科标记 = IF(v_fail_count > 0, '有挂科', '无挂科'),
    更新时间 = NOW();
END$$

-- 2. 触发器：插入成绩前校验并计算单科绩点
DROP TRIGGER IF EXISTS trig_before_score_insert$$
CREATE TRIGGER trig_before_score_insert
BEFORE INSERT ON 学业成绩明细表
FOR EACH ROW
BEGIN
  -- 拦截异常分数
  IF NEW.总评成绩 < 0 OR NEW.总评成绩 > 100 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '分数必须在 0 到 100 之间！';
  END IF;

  -- 自动计算单科绩点：(总评成绩 - 50)/10，最高不超 5.0，最低 0
  IF NEW.总评成绩 < 60 THEN
    SET NEW.绩点 = 0.0;
  ELSEIF NEW.总评成绩 >= 100 THEN
    SET NEW.绩点 = 5.0;
  ELSE
    SET NEW.绩点 = (NEW.总评成绩 - 50) / 10.0;
  END IF;
END$$

-- 对于更新也要拦截
DROP TRIGGER IF EXISTS trig_before_score_update$$
CREATE TRIGGER trig_before_score_update
BEFORE UPDATE ON 学业成绩明细表
FOR EACH ROW
BEGIN
  -- 拦截异常分数
  IF NEW.总评成绩 < 0 OR NEW.总评成绩 > 100 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '分数必须在 0 到 100 之间！';
  END IF;

  -- 自动计算单科绩点：(总评成绩 - 50)/10，最高不超 5.0，最低 0
  IF NEW.总评成绩 < 60 THEN
    SET NEW.绩点 = 0.0;
  ELSEIF NEW.总评成绩 >= 100 THEN
    SET NEW.绩点 = 5.0;
  ELSE
    SET NEW.绩点 = (NEW.总评成绩 - 50) / 10.0;
  END IF;
END$$

-- 3. 触发器：插入成绩后自动触发汇总存储过程
DROP TRIGGER IF EXISTS trig_after_score_insert$$
CREATE TRIGGER trig_after_score_insert
AFTER INSERT ON 学业成绩明细表
FOR EACH ROW
BEGIN
  CALL sp_calc_student_gpa(NEW.学生学工号, NEW.学期);
END$$

-- 4. 触发器：更新成绩后自动触发汇总存储过程
DROP TRIGGER IF EXISTS trig_after_score_update$$
CREATE TRIGGER trig_after_score_update
AFTER UPDATE ON 学业成绩明细表
FOR EACH ROW
BEGIN
  CALL sp_calc_student_gpa(NEW.学生学工号, NEW.学期);
END$$

DELIMITER ;
