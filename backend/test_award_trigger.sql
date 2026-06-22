USE student_management;

DELETE FROM 评优申请表 WHERE 申报编号 = 'AW_APP_TRG2';
INSERT IGNORE INTO 审批流程总表(审批编号, 审批类型, 申请人学工号, 申请内容, 审批状态) VALUES('APP_AWARD_02', '评优申请', 'S2023002', '申请', '已通过');
INSERT IGNORE INTO 评优项目表(项目编号, 项目名称, 评选类别, 评选周期, 申报条件, 评选标准, 截止时间, 创建人学号) VALUES('AW_TRG_02', '测试奖项', '院级', '年度', '无', '标准', '2026-12-31', 'T001');

INSERT INTO 评优申请表(申报编号, 审批编号, 评优项目编号, 申请人学号, 申报材料) VALUES('AW_APP_TRG2', 'APP_AWARD_02', 'AW_TRG_02', 'S2023002', '材料');

SELECT 获奖等级, 公示状态 FROM 评优申请表 WHERE 申报编号 = 'AW_APP_TRG2';

UPDATE 评优申请表 SET 获奖等级 = '一等奖' WHERE 申报编号 = 'AW_APP_TRG2';

SELECT 获奖等级, 公示状态 FROM 评优申请表 WHERE 申报编号 = 'AW_APP_TRG2';
