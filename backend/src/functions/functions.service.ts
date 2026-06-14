import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class FunctionsService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  // 1. 获取指定辅导员的待审批任务总数 (标量)
  async getPendingApprovalCount(approverId: string): Promise<number> {
    const res = await this.entityManager.query('SELECT fn_get_pending_approval_count(?) AS count', [approverId]);
    return Number(res[0]?.count) || 0;
  }

  // 2. 生成用户任务完成度报表 (多语句存储过程)
  async getUserTaskSummary(userId: string): Promise<any> {
    const res = await this.entityManager.query('CALL sp_get_user_task_summary(?)', [userId]);
    return res[0]?.[0] || null; // Return the first row of the first result set
  }

  // 3. 获取某学生欠费总额 (标量)
  async getStudentDebt(studentId: string): Promise<number> {
    const res = await this.entityManager.query('SELECT fn_某学生欠费总额(?) AS debt', [studentId]);
    return Number(res[0]?.debt) || 0;
  }

  // 4. 查询某收入项目未缴费学生明细 (多语句存储过程)
  async getIncomeDebtDetails(incomeId: string): Promise<any[]> {
    const res = await this.entityManager.query('CALL fn_收入项目欠费明细(?)', [incomeId]);
    return res[0] || [];
  }

  // 5. 根据分数自动计算绩点 (标量)
  async getGpaByScore(score: number): Promise<number> {
    const res = await this.entityManager.query('SELECT fn_get_gpa(?) AS gpa', [score]);
    return Number(res[0]?.gpa) || 0;
  }

  // 6. 查询学生某学期是否挂科 (标量)
  async hasFailed(studentId: string, semester: string): Promise<string> {
    const res = await this.entityManager.query('SELECT fn_has_failed(?, ?) AS hasFailed', [studentId, semester]);
    return res[0]?.hasFailed || '无记录';
  }

  // 7. 计算学生学期出勤率 (标量)
  async getAttendanceRate(studentId: string, startDate: string, endDate: string): Promise<number> {
    const res = await this.entityManager.query('SELECT fn_student_attendance_rate(?, ?, ?) AS rate', [studentId, startDate, endDate]);
    return Number(res[0]?.rate) || 0;
  }

  // 8. 返回某班级考勤异常学生列表 (由于MySQL限制已重构为 CALL 过程)
  async getClassAbnormalStudents(className: string, threshold: number): Promise<any[]> {
    const res = await this.entityManager.query('CALL sp_class_abnormal_students(?, ?)', [className, threshold]);
    return res[0] || [];
  }

  // 9. 获取活动报名总人数 (标量)
  async getActivityRegistrationCount(activityId: string): Promise<number> {
    const res = await this.entityManager.query('SELECT fn_取活动报名人数(?) AS count', [activityId]);
    return Number(res[0]?.count) || 0;
  }

  // 10. 获取评优项目获奖总人数 (标量)
  async getAwardWinnerCount(projectId: string): Promise<number> {
    const res = await this.entityManager.query('SELECT fn_取项目获奖人数(?) AS count', [projectId]);
    return Number(res[0]?.count) || 0;
  }
}
