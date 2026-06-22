USE student_management;

-- 插入基础测试数据以防万一
INSERT IGNORE INTO 用户账号与权限信息表(学工号, 姓名, 登录密码, 角色编码, 所属班级, 联系方式) VALUES('S2023001', '测试学生1', '123', '4', '计算机2101', '1');
INSERT IGNORE INTO 用户账号与权限信息表(学工号, 姓名, 登录密码, 角色编码, 所属班级, 联系方式) VALUES('S2023002', '测试学生2', '123', '4', '计算机2101', '2');
INSERT IGNORE INTO 用户账号与权限信息表(学工号, 姓名, 登录密码, 角色编码, 所属班级, 联系方式) VALUES('T001', '测试教师', '123', '1', '无', '3');

-- 清理测试数据
DELETE FROM 用户账号与权限信息表 WHERE 学工号 = 'TEST_U001';
DELETE FROM 日常任务表 WHERE 任务编号 = 'TASK_TRG_01';
DELETE FROM 学生缴费明细表 WHERE 缴费明细ID = 'DETAIL_TRG_01';
DELETE FROM 班费收入记录表 WHERE 收入编号 = 'INCOME_TRG_01';
DELETE FROM 班费支出申请表 WHERE 支出编号 = 'EXP_TRG_01';
DELETE FROM 学业成绩明细表 WHERE 成绩编号 = 'SC_TRG_01';
DELETE FROM 学生学期绩点总表 WHERE 学生学工号 = 'S2023002' AND 学期 = '2023-2024-2';
DELETE FROM 纪律与考勤档案表 WHERE 记录编号 IN ('ATT_TRG_01', 'DIS_TRG_01');
DELETE FROM 活动报名表 WHERE 报名编号 = 'REG_TRG_01';
DELETE FROM 班级活动申请表 WHERE 活动编号 = 'ACT_TRG_01';
DELETE FROM 评优申请表 WHERE 申报编号 = 'AW_APP_TRG';
DELETE FROM 评优项目表 WHERE 项目编号 = 'AW_TRG_01';
DELETE FROM 审批流程总表 WHERE 审批编号 IN ('APP_LEAVE_01', 'APP_AWARD_01', 'APP_ACT_02');
DELETE FROM 系统全局操作日志表 WHERE 操作人学工号 = 'TEST_U001' OR 关联业务编号 IN ('EXP_TRG_01', 'DIS_TRG_01');

-- 7.4.1 用户与权限管理模块
SELECT '========== 7.4.1 trg_after_user_insert ==========' AS '测试项目';
INSERT IGNORE INTO 用户账号与权限信息表(学工号, 姓名, 登录密码, 角色编码, 所属班级, 联系方式) VALUES('TEST_U001', '触发测试人', '123456', '4', '计算机2101', '13800000000');
SELECT 操作编号, 操作人学工号, 操作模块, 操作内容 FROM 系统全局操作日志表 WHERE 操作人学工号 = 'TEST_U001' AND 操作类型 = '系统自动注册';

-- 7.4.2 日常任务与审批管理模块
SELECT '========== 7.4.2 trg_before_task_update ==========' AS '测试项目';
INSERT IGNORE INTO 日常任务表(任务编号, 任务类型, 任务内容, 完成时限, 发布人学工号, 负责人学工号, 验收状态) VALUES('TASK_TRG_01', '测试任务', '测试内容', '2026-12-31', 'T001', 'S2023001', '验收通过');
UPDATE 日常任务表 SET 验收状态 = '待验收' WHERE 任务编号 = 'TASK_TRG_01';

-- 7.4.3 班费收支管理模块
SELECT '========== 7.4.3 trg_更新班费收入总金额 ==========' AS '测试项目';
INSERT IGNORE INTO 班费收入记录表(收入编号, 收入日期, 收入金额, 收入类型, 缴费方式, 经手人学工号) VALUES('INCOME_TRG_01', CURDATE(), 0.00, '测试收入', '微信支付', 'S2023001');
INSERT IGNORE INTO 学生缴费明细表(缴费明细ID, 收入编号, 学工号, 缴费金额, 缴费状态) VALUES('DETAIL_TRG_01', 'INCOME_TRG_01', 'S2023001', 50.00, '未缴费');
UPDATE 学生缴费明细表 SET 缴费状态 = '已缴费' WHERE 缴费明细ID = 'DETAIL_TRG_01';
SELECT 收入编号, 收入金额 FROM 班费收入记录表 WHERE 收入编号 = 'INCOME_TRG_01';

SELECT '========== 7.4.3 trg_支出申请状态变更日志 ==========' AS '测试项目';
INSERT IGNORE INTO 班费支出申请表(支出编号, 申请人学工号, 支出金额, 支出事由, 审批状态, 申请日期) VALUES('EXP_TRG_01', 'S2023001', 10.00, '测试', '待初审', CURDATE());
UPDATE 班费支出申请表 SET 审批状态 = '初审通过', 初审人学工号 = 'T001' WHERE 支出编号 = 'EXP_TRG_01';
SELECT 操作内容 FROM 系统全局操作日志表 WHERE 关联业务编号 = 'EXP_TRG_01' AND 操作类型 = '审批状态变更';

-- 7.4.4 学业管理模块
SELECT '========== 7.4.4 trig_after_score_insert ==========' AS '测试项目';
INSERT IGNORE INTO 学业成绩明细表(成绩编号, 学生学工号, 课程编号, 课程名称, 学分, 总评成绩, 绩点, 学期, 操作人学工号) VALUES('SC_TRG_01', 'S2023002', 'C001', '测试', 2, 90, 4.0, '2023-2024-2', 'T001');
SELECT 学生学工号, 平均绩点 FROM 学生学期绩点总表 WHERE 学生学工号 = 'S2023002' AND 学期 = '2023-2024-2';

SELECT '========== 7.4.4 trig_before_score_update ==========' AS '测试项目';
UPDATE 学业成绩明细表 SET 总评成绩 = 110 WHERE 成绩编号 = 'SC_TRG_01';

-- 7.4.5 纪律管理模块
SELECT '========== 7.4.5 trig_attendance_check_leave ==========' AS '测试项目';
INSERT IGNORE INTO 审批流程总表(审批编号, 审批类型, 申请人学工号, 申请内容, 审批状态) VALUES('APP_LEAVE_01', '请假申请', 'S2023001', '事假', '已通过');
INSERT IGNORE INTO 纪律与考勤档案表(记录编号, 学生学工号, 记录类型, 考勤状态, 请假审批编号, 记录人学工号) VALUES('ATT_TRG_01', 'S2023001', '考勤', '缺勤', 'APP_LEAVE_01', 'T001');
SELECT 记录编号, 考勤状态 FROM 纪律与考勤档案表 WHERE 记录编号 = 'ATT_TRG_01';

SELECT '========== 7.4.5 trig_discipline_audit_log ==========' AS '测试项目';
INSERT IGNORE INTO 纪律与考勤档案表(记录编号, 学生学工号, 记录类型, 考勤状态, 处分类型, 记录人学工号) VALUES('DIS_TRG_01', 'S2023001', '处分', '正常', '严重警告', 'T001');
SELECT 操作内容 FROM 系统全局操作日志表 WHERE 关联业务编号 = 'DIS_TRG_01' AND 操作类型 = '处分录入';

-- 7.4.6 综合评优与活动管理模块
SELECT '========== 7.4.6 trig_获奖自动改公示状态 ==========' AS '测试项目';
INSERT IGNORE INTO 审批流程总表(审批编号, 审批类型, 申请人学工号, 申请内容, 审批状态) VALUES('APP_AWARD_01', '评优申请', 'S2023002', '申请', '已通过');
INSERT IGNORE INTO 评优项目表(项目编号, 项目名称, 评选类别, 评选周期, 申报条件, 评选标准, 截止时间, 创建人学号) VALUES('AW_TRG_01', '测试奖项', '院级', '年度', '无', '标准', '2026-12-31', 'T001');
INSERT IGNORE INTO 评优申请表(申报编号, 审批编号, 评优项目编号, 申请人学号, 申报材料) VALUES('AW_APP_TRG', 'APP_AWARD_01', 'AW_TRG_01', 'S2023002', '材料');
UPDATE 评优申请表 SET 获奖等级 = '一等奖' WHERE 申报编号 = 'AW_APP_TRG';
SELECT 申报编号, 公示状态 FROM 评优申请表 WHERE 申报编号 = 'AW_APP_TRG';

SELECT '========== 7.4.6 trig_报名自动填时间 ==========' AS '测试项目';
INSERT IGNORE INTO 审批流程总表(审批编号, 审批类型, 申请人学工号, 申请内容, 审批状态) VALUES('APP_ACT_02', '活动审批', 'S2023001', '内容', '已通过');
INSERT IGNORE INTO 班级活动申请表(活动编号, 审批编号, 活动名称, 活动类型, 活动时间, 活动地点, 负责人学号) VALUES('ACT_TRG_01', 'APP_ACT_02', '测试活动', '常规活动', NOW(), '待定', 'S2023001');
INSERT IGNORE INTO 活动报名表(报名编号, 活动编号, 报名人学号) VALUES('REG_TRG_01', 'ACT_TRG_01', 'S2023002');
SELECT 报名编号, IF(报名时间 IS NOT NULL, '成功自动填充', '未填充') AS 报名时间填充状态 FROM 活动报名表 WHERE 报名编号 = 'REG_TRG_01';
