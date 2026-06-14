import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class ProcessApprovalDto {
  @IsString() @IsNotEmpty() approvalId: string;
  @IsString() @IsNotEmpty() auditorId: string;
  @IsString() @IsNotEmpty() result: string;
  @IsString() @IsOptional() opinion: string;
}

export class PublishTaskDto {
  @IsString() @IsNotEmpty() taskId: string;
  @IsString() @IsNotEmpty() taskType: string;
  @IsString() @IsNotEmpty() content: string;
  @IsDateString() @IsNotEmpty() deadline: string;
  @IsString() @IsNotEmpty() publisherId: string;
  @IsString() @IsNotEmpty() managerId: string;
}

export class CreateIncomeDto {
  @IsDateString() @IsNotEmpty() incomeDate: string;
  @IsNumber() @IsNotEmpty() amount: number;
  @IsString() @IsNotEmpty() type: string;
  @IsString() @IsNotEmpty() paymentMethod: string;
  @IsString() @IsOptional() remark: string;
  @IsString() @IsNotEmpty() handlerId: string;
}

export class ApproveExpenseDto {
  @IsString() @IsNotEmpty() expenseId: string;
  @IsString() @IsNotEmpty() auditorId: string;
  @IsString() @IsNotEmpty() result: string;
  @IsString() @IsOptional() opinion: string;
}

export class CalcGpaDto {
  @IsString() @IsNotEmpty() studentId: string;
  @IsString() @IsNotEmpty() semester: string;
}

export class ArchiveActivityDto {
  @IsString() @IsNotEmpty() activityId: string;
  @IsString() @IsNotEmpty() archiverId: string;
  @IsString() @IsNotEmpty() summary: string;
}

export class ClassGpaQueryDto {
  @IsString() @IsNotEmpty() semester: string;
}

export class AttendanceRateQueryDto {
  @IsString() @IsNotEmpty() studentId: string;
  @IsString() @IsNotEmpty() semester: string;
}

export class PunishmentReportQueryDto {
  @IsString() @IsNotEmpty() className: string;
}

export class AwardStatsQueryDto {
  @IsString() @IsNotEmpty() projectId: string;
}
