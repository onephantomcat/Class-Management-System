import { Controller, Get, Query } from '@nestjs/common';
import { ViewsService } from './views.service';
import { PaginationQueryDto } from './dto/pagination.dto';

@Controller('api/views')
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get('user-roles')
  getUserRoles(@Query() query: PaginationQueryDto) { return this.viewsService.getUserRoles(query); }

  @Get('pending-approvals')
  getPendingApprovals(@Query() query: PaginationQueryDto) { return this.viewsService.getPendingApprovals(query); }

  @Get('class-fee-incomes')
  getClassFeeIncomes(@Query() query: PaginationQueryDto) { return this.viewsService.getClassFeeIncomes(query); }

  @Get('class-fee-expenses')
  getClassFeeExpenses(@Query() query: PaginationQueryDto) { return this.viewsService.getClassFeeExpenses(query); }

  @Get('pending-class-fees')
  getPendingClassFees(@Query() query: PaginationQueryDto) { return this.viewsService.getPendingClassFees(query); }

  @Get('student-payments')
  getStudentPayments(@Query() query: PaginationQueryDto) { return this.viewsService.getStudentPayments(query); }

  @Get('student-academics')
  getStudentAcademics(@Query() query: PaginationQueryDto) { return this.viewsService.getStudentAcademics(query); }

  @Get('class-grades')
  getClassGrades(@Query() query: PaginationQueryDto) { return this.viewsService.getClassGrades(query); }

  @Get('student-disciplines')
  getStudentDisciplines(@Query() query: PaginationQueryDto) { return this.viewsService.getStudentDisciplines(query); }

  @Get('class-attendance-stats')
  getClassAttendanceStats(@Query() query: PaginationQueryDto) { return this.viewsService.getClassAttendanceStats(query); }

  @Get('award-applications')
  getAwardApplications(@Query() query: PaginationQueryDto) { return this.viewsService.getAwardApplications(query); }

  @Get('activity-registration-stats')
  getActivityRegistrationStats(@Query() query: PaginationQueryDto) { return this.viewsService.getActivityRegistrationStats(query); }

  @Get('system-logs')
  getSystemLogs(@Query() query: PaginationQueryDto) { return this.viewsService.getSystemLogs(query); }

  @Get('approval-flows')
  getApprovalFlows(@Query() query: PaginationQueryDto) { return this.viewsService.getApprovalFlows(query); }
}
