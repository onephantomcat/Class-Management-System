import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ClassFeesService } from './class-fees.service';

@Controller('api/class-fees')
export class ClassFeesController {
  constructor(private readonly classFeesService: ClassFeesService) {}

  @Get('balance')
  async getBalance() {
    return this.classFeesService.getBalance();
  }

  @Post('income')
  async createIncome(@Body() data: any) {
    return this.classFeesService.createIncome(data);
  }

  @Get('my-bills')
  async getMyBills(@Query('userId') userId: string) {
    return this.classFeesService.getMyBills(userId);
  }

  @Put('pay/:id')
  async payBill(@Param('id') detailId: string) {
    return this.classFeesService.payBill(detailId);
  }

  @Post('expense')
  async createExpense(@Body() data: any) {
    return this.classFeesService.createExpense(data);
  }

  @Get('expenses')
  async getExpenses(@Query('userId') userId: string) {
    return this.classFeesService.getExpenses(userId);
  }

  @Put('expense/:id/audit')
  async auditExpense(
    @Param('id') id: string,
    @Body('auditorId') auditorId: string,
    @Body('action') action: string,
    @Body('comment') comment: string,
  ) {
    return this.classFeesService.auditExpense(id, auditorId, action, comment);
  }
}
