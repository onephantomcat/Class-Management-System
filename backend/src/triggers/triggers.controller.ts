import { Controller, Post, Put, Body, Param } from '@nestjs/common';
import { TriggersService } from './triggers.service';

@Controller('api/triggers')
export class TriggersController {
  constructor(private readonly triggersService: TriggersService) {}

  @Post('users')
  async insertUser(@Body() body: any) {
    await this.triggersService.insertUser(body);
    return { code: 200, message: '用户创建成功，触发器已记录审计日志' };
  }

  @Put('tasks/:id/status')
  async updateTaskStatus(@Param('id') id: string, @Body() body: any) {
    await this.triggersService.updateTaskStatus(id, body.status);
    return { code: 200, message: '任务状态更新成功' };
  }

  @Put('class-fees/details/:id/pay')
  async payClassFee(@Param('id') id: string) {
    await this.triggersService.payClassFee(id);
    return { code: 200, message: '缴费成功，触发器已级联更新总表金额' };
  }

  @Put('class-fees/expenses/:id/status')
  async auditExpense(@Param('id') id: string, @Body() body: any) {
    await this.triggersService.auditExpense(id, body.status, body.auditorId);
    return { code: 200, message: '审批成功，状态变更日志已自动插入' };
  }

  @Post('academics/scores')
  async insertScore(@Body() body: any) {
    await this.triggersService.insertScore(body);
    return { code: 200, message: '成绩录入成功！触发器已开始底层绩点与挂科重算' };
  }

  @Post('discipline/records')
  async insertDisciplineRecord(@Body() body: any) {
    await this.triggersService.insertDisciplineRecord(body);
    return { code: 200, message: '纪律记录插入成功，触发器完成校验与日志记录' };
  }

  @Put('awards/applications/:id/level')
  async updateAwardLevel(@Param('id') id: string, @Body() body: any) {
    await this.triggersService.updateAwardLevel(id, body.level);
    return { code: 200, message: '等级更新成功，触发器已自动转入待公示状态' };
  }

  @Post('activities/registrations')
  async insertActivityRegistration(@Body() body: any) {
    await this.triggersService.insertActivityRegistration(body);
    return { code: 200, message: '报名成功，触发器已自动处理！' };
  }

  @Post('awards/applications')
  async applyAward(@Body() body: any) {
    await this.triggersService.applyAward(body);
    return { code: 200, message: '评优申请提交成功，触发器已通过所有资格校验！' };
  }

  @Post('activities')
  async createActivity(@Body() body: any) {
    await this.triggersService.createActivity(body);
    return { code: 200, message: '活动创建成功，已提交至审批大厅！' };
  }
}
