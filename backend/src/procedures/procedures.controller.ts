import { Controller, Post, Get, Body, Query, HttpCode } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import {
  ProcessApprovalDto, PublishTaskDto, CreateIncomeDto, ApproveExpenseDto,
  CalcGpaDto, ArchiveActivityDto, ClassGpaQueryDto, AttendanceRateQueryDto,
  PunishmentReportQueryDto, AwardStatsQueryDto
} from './dto/procedure.dtos';

@Controller('api/procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Post('approvals/process')
  @HttpCode(201)
  async processApproval(@Body() dto: ProcessApprovalDto) {
    await this.proceduresService.processApproval(dto);
    return { code: 201, message: 'success' };
  }

  @Post('tasks/publish')
  @HttpCode(201)
  async publishTask(@Body() dto: PublishTaskDto) {
    await this.proceduresService.publishTask(dto);
    return { code: 201, message: 'success' };
  }

  @Post('class-fees/income')
  @HttpCode(201)
  async createIncome(@Body() dto: CreateIncomeDto) {
    const data = await this.proceduresService.createIncome(dto);
    return { code: 201, message: 'success', data };
  }

  @Post('class-fees/expense-approval')
  @HttpCode(201)
  async approveExpense(@Body() dto: ApproveExpenseDto) {
    await this.proceduresService.approveExpense(dto);
    return { code: 201, message: 'success' };
  }

  @Get('academics/class-gpa')
  async getClassGpa(@Query() query: ClassGpaQueryDto) {
    const data = await this.proceduresService.getClassGpa(query);
    return { code: 200, message: 'success', data };
  }

  @Post('academics/calculate-gpa')
  @HttpCode(201)
  async calculateGpa(@Body() dto: CalcGpaDto) {
    await this.proceduresService.calculateGpa(dto);
    return { code: 201, message: 'success' };
  }

  @Get('discipline/attendance-rate')
  async getAttendanceRate(@Query() query: AttendanceRateQueryDto) {
    const data = await this.proceduresService.getAttendanceRate(query);
    return { code: 200, message: 'success', data };
  }

  @Get('discipline/punishment-report')
  async getPunishmentReport(@Query() query: PunishmentReportQueryDto) {
    const data = await this.proceduresService.getPunishmentReport(query);
    return { code: 200, message: 'success', data };
  }

  @Get('awards/stats')
  async getAwardStats(@Query() query: AwardStatsQueryDto) {
    const data = await this.proceduresService.getAwardStats(query);
    return { code: 200, message: 'success', data };
  }

  @Post('activities/archive')
  @HttpCode(201)
  async archiveActivity(@Body() dto: ArchiveActivityDto) {
    await this.proceduresService.archiveActivity(dto);
    return { code: 201, message: 'success' };
  }
}
