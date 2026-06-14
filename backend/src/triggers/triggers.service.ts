import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class TriggersService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  // 1. 用户模块：插入新用户 (触发 trg_after_user_insert)
  async insertUser(data: any): Promise<void> {
    await this.entityManager.query(
      `INSERT INTO 用户账号与权限信息表 (学工号, 姓名, 登录密码, 所属班级, 角色编码, 联系方式, 账号状态) 
       VALUES (?, ?, ?, ?, ?, ?, '正常')`,
      [data.studentId, data.name, '123456', data.className, data.roleCode || '4', data.phone || '']
    );
  }

  // 2. 日常任务模块：更新任务状态 (触发 trg_before_task_update 防篡改 45000)
  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    await this.entityManager.query(
      `UPDATE 日常任务表 SET 验收状态 = ? WHERE 任务编号 = ?`,
      [status, taskId]
    );
  }

  // 3. 班费模块：缴纳班费 (触发 trg_更新班费收入总金额)
  async payClassFee(detailId: string): Promise<void> {
    await this.entityManager.query(
      `UPDATE 学生缴费明细表 SET 缴费状态 = '已缴费', 缴费时间 = NOW() WHERE 明细编号 = ?`,
      [detailId]
    );
  }

  // 4. 班费模块：审批支出 (触发 trg_支出申请状态变更日志)
  async auditExpense(expenseId: string, status: string, auditorId: string): Promise<void> {
    await this.entityManager.query(
      `UPDATE 班费支出申请表 SET 审批状态 = ?, 终审人学工号 = ? WHERE 支出编号 = ?`,
      [status, auditorId, expenseId]
    );
  }

  // 5. 学业模块：录入成绩 (触发 trig_before_score_update 和 trig_after_score_insert)
  async insertScore(data: any): Promise<void> {
    if (data.operatorRole == 4) {
      throw new BadRequestException('普通学生无权限录入成绩');
    }
    if (data.operatorRole == 3 && (!data.operatorJobId || !data.operatorJobId.includes('学习'))) {
      throw new BadRequestException('班委中仅有学习委员可录入成绩');
    }

    // 故意不传 GPA，由底层存储过程 sp_calc_student_gpa 在 trigger 中自动计算
    const scoreId = `SC_${Date.now()}`;
    await this.entityManager.query(
      `INSERT INTO 学业成绩明细表 (成绩编号, 学生学工号, 课程编号, 课程名称, 学分, 平时成绩, 考试成绩, 总评成绩, 学期, 操作人学工号) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [scoreId, data.studentId, 'C001', data.courseName || '自动测试课程', data.credits || 2, 
       data.score, data.score, data.score, data.semester, data.operatorId || 'SYSTEM']
    );
  }

  // 6. 纪律模块：插入考勤/处分 (触发 trig_attendance_check_leave 和 trig_discipline_audit_log)
  async insertDisciplineRecord(data: any): Promise<void> {
    if (data.operatorRole == 4) {
      throw new BadRequestException('普通学生无权限录入纪律记录');
    }
    if (data.operatorRole == 3 && (!data.operatorJobId || !data.operatorJobId.includes('纪律'))) {
      throw new BadRequestException('班委中仅有纪律委员可录入纪律记录');
    }

    const recordId = `DR_${Date.now()}`;
    await this.entityManager.query(
      `INSERT INTO 纪律与考勤档案表 (记录编号, 学生学工号, 记录类型, 考勤状态, 处分类型, 记录时间, 记录人学工号, 请假审批编号) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [recordId, data.studentId, data.recordType, data.attendanceStatus, data.punishType, data.operatorId || data.recorderId, data.leaveId || null]
    );
  }

  // 7. 评优模块：修改获奖等级 (触发 trig_获奖自动改公示状态)
  async updateAwardLevel(applicationId: string, level: string): Promise<void> {
    await this.entityManager.query(
      `UPDATE 评优申请表 SET 获奖等级 = ? WHERE 申报编号 = ?`,
      [level, applicationId]
    );
  }

  // 8. 活动模块：新增报名 (触发 trig_before_activity_register)
  async insertActivityRegistration(data: any): Promise<void> {
    if (data.operatorRole == 1) {
      throw new BadRequestException('班主任无需报名参加班级活动');
    }
    await this.entityManager.query(
      `INSERT INTO 活动报名表 (活动编号, 报名人学号, 联系方式) 
       VALUES (?, ?, ?)`,
      [data.activityId, data.studentId, data.contact || '无']
    );
  }

  // 9. 评优模块：提交申请 (触发 trig_before_award_apply)
  async applyAward(data: any): Promise<void> {
    if (data.operatorRole == 1) {
      throw new BadRequestException('班主任无需申请评优');
    }
    
    // 1. 先生成一条审批流程记录
    const approveId = `APP_AW_${Date.now()}`;
    await this.entityManager.query(
      `INSERT INTO 审批流程总表 (审批编号, 审批类型, 申请人学工号, 申请人姓名, 申请内容, 申请时间, 当前审批节点, 审批状态) 
       VALUES (?, ?, ?, ?, ?, NOW(), '班主任终审', '待审批')`,
      [approveId, '评优申请', data.studentId, data.studentName || '未知姓名', `申请评优项目:${data.awardId}`]
    );

    // 2. 插入评优申请表 (触发器在此拦截挂科/处分)
    await this.entityManager.query(
      `INSERT INTO 评优申请表 (审批编号, 评优项目编号, 申请人学号, 申报材料) 
       VALUES (?, ?, ?, ?)`,
      [approveId, data.awardId, data.studentId, data.material || '无']
    );
  }
}
