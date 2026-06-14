import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  UserRolesView,
  PendingApprovalView,
  ClassFeeIncomeView,
  ClassFeeExpenseView,
  PendingClassFeeView,
  StudentPaymentView,
  StudentAcademicOverviewView,
  ClassGradesView,
  StudentDisciplineView,
  ClassAttendanceStatsView,
  AwardApplicationView,
  ActivityRegistrationStatsView
} from './entities/views.entity';
import { PaginationQueryDto, PaginatedResponse } from './dto/pagination.dto';

@Injectable()
export class ViewsService {
  constructor(
    @InjectRepository(UserRolesView) private readonly userRolesRepo: Repository<UserRolesView>,
    @InjectRepository(PendingApprovalView) private readonly pendingApprovalRepo: Repository<PendingApprovalView>,
    @InjectRepository(ClassFeeIncomeView) private readonly classFeeIncomeRepo: Repository<ClassFeeIncomeView>,
    @InjectRepository(ClassFeeExpenseView) private readonly classFeeExpenseRepo: Repository<ClassFeeExpenseView>,
    @InjectRepository(PendingClassFeeView) private readonly pendingClassFeeRepo: Repository<PendingClassFeeView>,
    @InjectRepository(StudentPaymentView) private readonly studentPaymentRepo: Repository<StudentPaymentView>,
    @InjectRepository(StudentAcademicOverviewView) private readonly studentAcademicRepo: Repository<StudentAcademicOverviewView>,
    @InjectRepository(ClassGradesView) private readonly classGradesRepo: Repository<ClassGradesView>,
    @InjectRepository(StudentDisciplineView) private readonly studentDisciplineRepo: Repository<StudentDisciplineView>,
    @InjectRepository(ClassAttendanceStatsView) private readonly classAttendanceStatsRepo: Repository<ClassAttendanceStatsView>,
    @InjectRepository(AwardApplicationView) private readonly awardApplicationRepo: Repository<AwardApplicationView>,
    @InjectRepository(ActivityRegistrationStatsView) private readonly activityRegistrationStatsRepo: Repository<ActivityRegistrationStatsView>
  ) {}

  private async getPaginated<T>(
    repo: Repository<T>,
    query: PaginationQueryDto,
    searchFields: string[]
  ): Promise<PaginatedResponse<T>> {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword;

    let whereCondition: any = {};
    if (keyword && searchFields.length > 0) {
      whereCondition = searchFields.map(field => ({
        [field]: Like(`%${keyword}%`)
      }));
    }

    const [list, total] = await repo.findAndCount({
      where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return new PaginatedResponse<T>(total, list, page, pageSize);
  }

  // 1.
  getUserRoles(query: PaginationQueryDto) {
    return this.getPaginated(this.userRolesRepo, query, ['name', 'staffId', 'roleName']);
  }
  // 2.
  getPendingApprovals(query: PaginationQueryDto) {
    return this.getPaginated(this.pendingApprovalRepo, query, ['applicantName', 'approvalType']);
  }
  // 3.
  getClassFeeIncomes(query: PaginationQueryDto) {
    return this.getPaginated(this.classFeeIncomeRepo, query, ['handlerName', 'type', 'remark']);
  }
  getClassFeeExpenses(query: PaginationQueryDto) {
    return this.getPaginated(this.classFeeExpenseRepo, query, ['reason', 'applicantName']);
  }
  getPendingClassFees(query: PaginationQueryDto) {
    return this.getPaginated(this.pendingClassFeeRepo, query, ['reason', 'applicantName']);
  }
  getStudentPayments(query: PaginationQueryDto) {
    return this.getPaginated(this.studentPaymentRepo, query, ['name', 'studentId']);
  }
  // 4.
  getStudentAcademics(query: PaginationQueryDto) {
    return this.getPaginated(this.studentAcademicRepo, query, ['name', 'studentId', 'className']);
  }
  getClassGrades(query: PaginationQueryDto) {
    return this.getPaginated(this.classGradesRepo, query, ['name', 'courseName']);
  }
  // 5.
  getStudentDisciplines(query: PaginationQueryDto) {
    return this.getPaginated(this.studentDisciplineRepo, query, ['name', 'studentId', 'type', 'recorderName']);
  }
  getClassAttendanceStats(query: PaginationQueryDto) {
    return this.getPaginated(this.classAttendanceStatsRepo, query, ['className', 'week']);
  }
  // 6.
  getAwardApplications(query: PaginationQueryDto) {
    return this.getPaginated(this.awardApplicationRepo, query, ['name', 'projectName']);
  }
  getActivityRegistrationStats(query: PaginationQueryDto) {
    return this.getPaginated(this.activityRegistrationStatsRepo, query, ['activityName']);
  }
}
