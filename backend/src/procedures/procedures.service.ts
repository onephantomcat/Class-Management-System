import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  ProcessApprovalDto, PublishTaskDto, CreateIncomeDto, ApproveExpenseDto,
  CalcGpaDto, ArchiveActivityDto, ClassGpaQueryDto, AttendanceRateQueryDto,
  PunishmentReportQueryDto, AwardStatsQueryDto
} from './dto/procedure.dtos';

@Injectable()
export class ProceduresService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  // 1.
  async processApproval(dto: ProcessApprovalDto) {
    await this.entityManager.query(
      'CALL sp_审批流程处理过程(?, ?, ?, ?)',
      [dto.approvalId, dto.auditorId, dto.result, dto.opinion || null]
    );
  }

  // 2.
  async publishTask(dto: PublishTaskDto) {
    await this.entityManager.query(
      'CALL sp_发布日常任务(?, ?, ?, ?, ?, ?)',
      [dto.taskId, dto.taskType, dto.content, dto.deadline, dto.publisherId, dto.managerId]
    );
  }

  // 3. (With OUT Parameter)
  async createIncome(dto: CreateIncomeDto) {
    await this.entityManager.query(
      'CALL sp_新增班费收入并生成缴费明细(?, ?, ?, ?, ?, ?, @out_generated_id)',
      [dto.incomeDate, dto.amount, dto.type, dto.paymentMethod, dto.remark || null, dto.handlerId]
    );
    const result = await this.entityManager.query('SELECT @out_generated_id AS generatedId');
    return { generatedId: result[0]?.generatedId };
  }

  // 4.
  async approveExpense(dto: ApproveExpenseDto) {
    await this.entityManager.query(
      'CALL sp_审批班费支出申请(?, ?, ?, ?)',
      [dto.expenseId, dto.auditorId, dto.result, dto.opinion || null]
    );
  }

  // 5.
  async getClassGpa(query: ClassGpaQueryDto) {
    const res = await this.entityManager.query('CALL sp_按学期统计班级平均绩点(?)', [query.semester]);
    return res[0]; // TypeORM returns an array of result sets for CALL
  }

  // 6.
  async calculateGpa(dto: CalcGpaDto) {
    await this.entityManager.query('CALL sp_自动计算学生绩点与挂科数(?, ?)', [dto.studentId, dto.semester]);
  }

  // 7.
  async getAttendanceRate(query: AttendanceRateQueryDto) {
    const res = await this.entityManager.query('CALL sp_统计学生个人学期出勤率(?, ?)', [query.studentId, query.semester]);
    return res[0];
  }

  // 8.
  async getPunishmentReport(query: PunishmentReportQueryDto) {
    const res = await this.entityManager.query('CALL sp_生成班级纪律处分统计报表(?)', [query.className]);
    return res[0];
  }

  // 9.
  async getAwardStats(query: AwardStatsQueryDto) {
    const res = await this.entityManager.query('CALL sp_统计获奖人数(?)', [query.projectId]);
    return res[0];
  }

  // 10.
  async archiveActivity(dto: ArchiveActivityDto) {
    await this.entityManager.query('CALL sp_活动自动归档(?, ?, ?)', [dto.activityId, dto.archiverId, dto.summary]);
  }
}
