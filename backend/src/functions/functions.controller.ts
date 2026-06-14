import { Controller, Get, Param, Query } from '@nestjs/common';
import { FunctionsService } from './functions.service';

@Controller('api')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  // 1.
  @Get('functions/approvals/pending-count/:approverId')
  async getPendingApprovalCount(@Param('approverId') approverId: string) {
    const data = await this.functionsService.getPendingApprovalCount(approverId);
    return { code: 200, message: 'success', data };
  }

  // 2.
  @Get('functions/tasks/summary/:userId')
  async getUserTaskSummary(@Param('userId') userId: string) {
    const data = await this.functionsService.getUserTaskSummary(userId);
    return { code: 200, message: 'success', data };
  }

  // 3.
  @Get('functions/class-fees/debt/:studentId')
  async getStudentDebt(@Param('studentId') studentId: string) {
    const data = await this.functionsService.getStudentDebt(studentId);
    return { code: 200, message: 'success', data };
  }

  // 4.
  @Get('functions/class-fees/debt-details/:incomeId')
  async getIncomeDebtDetails(@Param('incomeId') incomeId: string) {
    const data = await this.functionsService.getIncomeDebtDetails(incomeId);
    return { code: 200, message: 'success', data };
  }

  // 5.
  @Get('functions/academics/gpa/:score')
  async getGpaByScore(@Param('score') score: number) {
    const data = await this.functionsService.getGpaByScore(score);
    return { code: 200, message: 'success', data };
  }

  // 6.
  @Get('functions/academics/has-failed/:studentId/:semester')
  async hasFailed(@Param('studentId') studentId: string, @Param('semester') semester: string) {
    const data = await this.functionsService.hasFailed(studentId, semester);
    return { code: 200, message: 'success', data };
  }

  // 7.
  @Get('functions/discipline/attendance-rate')
  async getAttendanceRate(
    @Query('studentId') studentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const data = await this.functionsService.getAttendanceRate(studentId, startDate, endDate);
    return { code: 200, message: 'success', data };
  }

  // 8. 专属指令路由
  @Get('discipline/abnormal/:className')
  async getClassAbnormalStudents(
    @Param('className') className: string,
    @Query('threshold') threshold: number = 3
  ) {
    const data = await this.functionsService.getClassAbnormalStudents(className, threshold);
    return { code: 200, message: 'success', data };
  }

  // 9.
  @Get('functions/activities/registration-count/:activityId')
  async getActivityRegistrationCount(@Param('activityId') activityId: string) {
    const data = await this.functionsService.getActivityRegistrationCount(activityId);
    return { code: 200, message: 'success', data };
  }

  // 10.
  @Get('functions/awards/winner-count/:projectId')
  async getAwardWinnerCount(@Param('projectId') projectId: string) {
    const data = await this.functionsService.getAwardWinnerCount(projectId);
    return { code: 200, message: 'success', data };
  }
}
