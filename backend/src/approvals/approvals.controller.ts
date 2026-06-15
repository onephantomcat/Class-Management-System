import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';

@Controller('api/approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post('leave')
  async createLeaveRequest(@Body() data: any) {
    return this.approvalsService.createLeaveRequest(data);
  }

  @Post('grade-modification')
  async createGradeModificationRequest(@Body() data: any) {
    return this.approvalsService.createGradeModificationRequest(data);
  }

  @Get('my-requests')
  async getMyRequests(@Query('userId') userId: string) {
    return this.approvalsService.getMyRequests(userId);
  }

  @Get('pending')
  async getPendingApprovals(@Query('role') role: string) {
    return this.approvalsService.getPendingApprovals(Number(role));
  }

  @Put(':id/audit')
  async auditApproval(
    @Param('id') id: string,
    @Body('auditorId') auditorId: string,
    @Body('action') action: string, // "通过" 或 "驳回"
    @Body('comment') comment: string,
  ) {
    return this.approvalsService.auditApproval(id, auditorId, action, comment);
  }
}
