USE student_management;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_审批流程处理过程 //
CREATE PROCEDURE sp_审批流程处理过程(
    IN p_approval_id VARCHAR(50),
    IN p_auditor_id VARCHAR(50),
    IN p_result VARCHAR(20),
    IN p_opinion TEXT
)
BEGIN
    UPDATE 审批流程总表
    SET 审批状态 = p_result,
        审批人学工号 = p_auditor_id,
        审核意见 = p_opinion,
        审核时间 = NOW(),
        -- 如果是最终通过或驳回，则记录流程完结时间
        流程完结时间 = IF(p_result IN ('审批通过', '审批驳回'), NOW(), NULL)
    WHERE 审批编号 = p_approval_id;
END //

DROP PROCEDURE IF EXISTS sp_发布日常任务 //
CREATE PROCEDURE sp_发布日常任务(
    IN p_task_id VARCHAR(50),
    IN p_task_type VARCHAR(50),
    IN p_content TEXT,
    IN p_deadline DATETIME,
    IN p_publisher_id VARCHAR(50),
    IN p_manager_id VARCHAR(50)
)
BEGIN
    INSERT INTO 日常任务表 (
        任务编号, 任务类型, 任务内容, 完成时限, 任务进度, 验收状态, 发布人学工号, 负责人学工号, 发布时间
    ) VALUES (
        p_task_id, p_task_type, p_content, p_deadline, '0%', '待验收', p_publisher_id, p_manager_id, NOW()
    );
END //

DROP PROCEDURE IF EXISTS sp_新增班费收入并生成缴费明细 //
CREATE PROCEDURE sp_新增班费收入并生成缴费明细(
    IN p_收入日期 DATE,
    IN p_收入金额 DECIMAL(10,2),
    IN p_收入类型 VARCHAR(50),
    IN p_缴费方式 VARCHAR(50),
    IN p_备注 TEXT,
    IN p_经手人学工号 VARCHAR(50),
    OUT p_生成的收入编号 VARCHAR(50)
)
BEGIN
	DECLARE v_收入编号 VARCHAR(50);
    DECLARE v_学工号 VARCHAR(50);
    DECLARE v_done INT DEFAULT 0;

    DECLARE student_cursor CURSOR FOR
		SELECT 学工号 FROM 用户账号与权限信息表 WHERE 角色编码 != '1'; -- 假设1为教师角色
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    -- 收入编号格式：INCOME_YYYYMMDD_序号
    SET v_收入编号 = CONCAT('INCOME_', DATE_FORMAT(p_收入日期, '%Y%m%d'), '_', 
        LPAD((SELECT COUNT(*) + 1 FROM 班费收入记录表 WHERE 收入日期 = p_收入日期), 3, '0'));
    
    START TRANSACTION;
    INSERT INTO 班费收入记录表(收入编号, 收入日期, 收入金额, 收入类型, 缴费方式, 备注, 经手人学工号)
    VALUES(v_收入编号, p_收入日期, 0, p_收入类型, p_缴费方式, p_备注, p_经手人学工号);
    
    OPEN student_cursor;
    
    FETCH student_cursor INTO v_学工号;
    
    student_loop: LOOP
        IF v_done = 1 THEN
            LEAVE student_loop;
        END IF;
        
        INSERT INTO 学生缴费明细表(缴费明细ID, 学工号, 收入编号, 缴费金额)
        VALUES(
            CONCAT('PAY_', v_收入编号, '_', v_学工号),
            v_学工号,
            v_收入编号,
            p_收入金额
        );
        FETCH student_cursor INTO v_学工号;
    END LOOP;
    
    CLOSE student_cursor;
    COMMIT;
    SET p_生成的收入编号 = v_收入编号;
    SELECT CONCAT('成功创建班费收入记录，收入编号：', v_收入编号, '，已为', (SELECT COUNT(*) FROM 用户账号与权限信息表 WHERE 角色编码 != '1'), '名学生生成缴费明细') AS 执行结果;
END //

DROP PROCEDURE IF EXISTS sp_审批班费支出申请 //
CREATE PROCEDURE sp_审批班费支出申请(
    IN p_支出编号 VARCHAR(50),
    IN p_审批人学工号 VARCHAR(50),
    IN p_审批结果 VARCHAR(20),
    IN p_审核意见 TEXT
)
BEGIN
    DECLARE v_当前状态 VARCHAR(20);
    DECLARE v_初审人学工号 VARCHAR(50);
    DECLARE v_终审人学工号 VARCHAR(50);
    DECLARE v_审批人姓名 VARCHAR(50);
    DECLARE v_申请人姓名 VARCHAR(50);
    DECLARE v_审批编号 VARCHAR(50);
    DECLARE v_申请人学工号 VARCHAR(50);
    DECLARE v_申请日期 DATE;
    DECLARE v_支出事由 TEXT;
    DECLARE v_票据凭证 VARCHAR(255);

	-- 信息获取
    SELECT 姓名 
    INTO v_审批人姓名 
    FROM 用户账号与权限信息表 
    WHERE 学工号 = p_审批人学工号;

    SELECT 审批状态,初审人学工号,终审人学工号,申请人学工号,申请日期,支出事由,票据凭证
    INTO v_当前状态,v_初审人学工号,v_终审人学工号,v_申请人学工号,v_申请日期,v_支出事由,v_票据凭证
    FROM 班费支出申请表 
    WHERE 支出编号 = p_支出编号;

	-- 确认状态合法性
    IF v_当前状态 IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '错误：该支出申请不存在';
    END IF;
    IF v_当前状态 NOT IN ('待初审','待终审') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '错误：该申请已完成审批或已被拒绝，无法再次审批';
    END IF;

    SELECT 姓名 INTO v_申请人姓名 FROM 用户账号与权限信息表 WHERE 学工号 = v_申请人学工号;

    SET v_审批编号 = CONCAT('AP_', DATE_FORMAT(NOW(), '%Y%m%d'), '_', 
        LPAD((SELECT COUNT(*) + 1 FROM 审批流程总表 WHERE DATE(审核时间) = CURDATE()), 3, '0'));

    START TRANSACTION;

    CASE p_审批结果
        WHEN '初审通过' THEN
            IF v_当前状态 != '待初审' THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '错误：该申请当前不是待初审状态';
            END IF;
            UPDATE 班费支出申请表 
            SET 审批状态 = '待终审',
				初审人学工号 = p_审批人学工号 
            WHERE 支出编号 = p_支出编号;

            INSERT INTO 审批流程总表
            (审批编号,审批类型,申请人学工号,申请人姓名,申请内容,附件材料,
            申请时间,当前审批节点,审批人学工号,审批人姓名,审核意见,审批状态,
            审核时间,流程完结时间,关联业务编号)
            VALUES
            (v_审批编号,'班费支出初审',v_申请人学工号,v_申请人姓名,v_支出事由,v_票据凭证,
            v_申请日期,'待终审',p_审批人学工号,v_审批人姓名,p_审核意见,'初审通过',
            NOW(),NULL,p_支出编号);

            SELECT '初审通过，申请已进入终审阶段' AS 执行结果;

        WHEN '终审通过' THEN
            IF v_当前状态 != '待终审' THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '错误：该申请当前不是待终审状态';
            END IF;
            UPDATE 班费支出申请表 
            SET 审批状态 = '已通过',
				终审人学工号 = p_审批人学工号,
                支付日期 = CURDATE() 
            WHERE 支出编号 = p_支出编号;

            INSERT INTO 审批流程总表
            (审批编号,审批类型,申请人学工号,申请人姓名,申请内容,附件材料,
            申请时间,当前审批节点,审批人学工号,审批人姓名,审核意见,审批状态,
            审核时间,流程完结时间,关联业务编号)
            VALUES
            (v_审批编号,'班费支出终审',v_申请人学工号,v_申请人姓名,v_支出事由,v_票据凭证,
            v_申请日期,'已通过',p_审批人学工号,v_审批人姓名,p_审核意见,'终审通过',
            NOW(),NOW(),p_支出编号);

            SELECT '终审通过，申请已完成审批，款项将在今日支付' AS 执行结果;

        WHEN '拒绝' THEN
            UPDATE 班费支出申请表 
            SET 审批状态 = '已拒绝' 
            WHERE 支出编号 = p_支出编号;

            INSERT INTO 审批流程总表
            (审批编号,审批类型,申请人学工号,申请人姓名,申请内容,附件材料,
            申请时间,当前审批节点,审批人学工号,审批人姓名,审核意见,审批状态,
            审核时间,流程完结时间,关联业务编号)
            VALUES
            (v_审批编号,'班费支出审批拒绝',v_申请人学工号,v_申请人姓名,v_支出事由,v_票据凭证,
            v_申请日期,'已拒绝',p_审批人学工号,v_审批人姓名,p_审核意见,'已拒绝',
            NOW(),NOW(),p_支出编号);

            SELECT '申请已被拒绝' AS 执行结果;

        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '错误：无效的审批结果';
    END CASE;

    COMMIT;
END //


DROP PROCEDURE IF EXISTS sp_按学期统计班级平均绩点 //
CREATE PROCEDURE sp_按学期统计班级平均绩点(IN p_semester VARCHAR(50))
BEGIN
    SELECT
        u.所属班级,
        COUNT(DISTINCT s.学生学工号) AS 学生人数,
        AVG(s.平均绩点) AS 班级平均绩点
    FROM 学生学期绩点总表 s
    JOIN 用户账号与权限信息表 u ON s.学生学工号 = u.学工号
    WHERE s.学期 = p_semester
    GROUP BY u.所属班级;
END //

DROP PROCEDURE IF EXISTS sp_自动计算学生绩点与挂科数 //
CREATE PROCEDURE sp_自动计算学生绩点与挂科数(IN p_student_id VARCHAR(50), IN p_semester VARCHAR(50))
BEGIN
    DECLARE v_avg_gpa DECIMAL(4,2);
    DECLARE v_fail_count INT;

    SELECT AVG(绩点) INTO v_avg_gpa
    FROM 学业成绩明细表
    WHERE 学生学工号 = p_student_id AND 学期 = p_semester AND 成绩状态 = '正常';

    SELECT COUNT(*) INTO v_fail_count
    FROM 学业成绩明细表
    WHERE 学生学工号 = p_student_id AND 学期 = p_semester AND 总评成绩 < 60;

    INSERT INTO 学生学期绩点总表(记录编号,学生学工号,学期,平均绩点,挂科科目数,挂科标记,班级排名)
    VALUES(UUID(), p_student_id, p_semester, IFNULL(v_avg_gpa, 0), v_fail_count, IF(v_fail_count>0,'有挂科','无挂科'), NULL)
    ON DUPLICATE KEY UPDATE
        平均绩点 = IFNULL(v_avg_gpa, 0),
        挂科科目数 = v_fail_count,
        挂科标记 = IF(v_fail_count>0,'有挂科','无挂科');
END //

DROP PROCEDURE IF EXISTS sp_统计学生个人学期出勤率 //
CREATE PROCEDURE sp_统计学生个人学期出勤率(
    IN p_student_id VARCHAR(50),
    IN p_semester VARCHAR(20)
)
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_normal INT DEFAULT 0;
	DECLARE v_rate DECIMAL(5,2) DEFAULT 0.00;

    SELECT 
        SUM(CASE WHEN 考勤状态 = '正常出勤' THEN 1 ELSE 0 END),
        COUNT(*)
    INTO v_normal, v_total
    FROM 纪律与考勤档案表 d
    WHERE d.学生学工号 = p_student_id
      AND d.记录类型 = '考勤'
      AND YEAR(d.记录时间) = SUBSTRING(p_semester, 1, 4); 
    
    IF v_total > 0 THEN
        SET v_rate = (v_normal * 100.0) / v_total;
    END IF;
    
    SELECT p_student_id AS 学生学工号, v_total AS 总考勤次数, IFNULL(v_normal,0) AS 正常出勤次数, ROUND(v_rate,2) AS 出勤率百分比;
END //

DROP PROCEDURE IF EXISTS sp_生成班级纪律处分统计报表 //
CREATE PROCEDURE sp_生成班级纪律处分统计报表(
    IN p_class_name VARCHAR(100)
)
BEGIN
    SELECT 
        d.处分类型,
        COUNT(DISTINCT d.学生学工号) AS 涉及人数,
        ROUND(COUNT(DISTINCT d.学生学工号) * 100.0 / (SELECT COUNT(*) FROM 用户账号与权限信息表 WHERE 所属班级 = p_class_name), 2) AS 占比百分比
    FROM 纪律与考勤档案表 d
    JOIN 用户账号与权限信息表 u ON d.学生学工号 = u.学工号
    WHERE d.记录类型 = '处分'
      AND d.处分类型 IS NOT NULL
      AND u.所属班级 = p_class_name
    GROUP BY d.处分类型
    ORDER BY 涉及人数 DESC;
END //

DROP PROCEDURE IF EXISTS sp_统计获奖人数 //
CREATE PROCEDURE sp_统计获奖人数(IN p_项目编号 VARCHAR(50))
BEGIN
    SELECT
        ep.项目名称,
        ea.获奖等级,
        COUNT(DISTINCT ea.申请人学号) AS 获奖人数
    FROM 评优项目表 ep
    LEFT JOIN 评优申请表 ea ON ep.项目编号 = ea.评优项目编号
    WHERE ep.项目编号 = p_项目编号 AND ea.获奖等级 IS NOT NULL
    GROUP BY ep.项目名称,ea.获奖等级;
END //

DROP PROCEDURE IF EXISTS sp_活动自动归档 //
CREATE PROCEDURE sp_活动自动归档(IN p_活动编号 VARCHAR(50), IN p_归档人 VARCHAR(50), IN p_总结 TEXT)
BEGIN
    INSERT INTO 活动档案表(档案编号,活动编号,总结内容,归档人学号)
    VALUES(UUID(),p_活动编号,p_总结,p_归档人);
END //

DELIMITER ;
