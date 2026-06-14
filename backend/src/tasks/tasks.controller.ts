import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @Query('userId') userId: string,
    @Query('role') role: string,
  ) {
    return this.tasksService.getTasks(userId, role);
  }

  @Post()
  async createTask(
    @Body('publisherId') publisherId: string,
    @Body() data: any
  ) {
    return this.tasksService.createTask(publisherId, data);
  }

  @Put(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body('executorId') executorId: string,
    @Body('progress') progress: number,
    @Body('result') result: string,
  ) {
    return this.tasksService.updateProgress(id, executorId, progress, result);
  }

  @Put(':id/verify')
  async verifyTask(
    @Param('id') id: string,
    @Body('publisherId') publisherId: string,
    @Body('status') status: string,
    @Body('comment') comment: string,
  ) {
    return this.tasksService.verifyTask(id, publisherId, status, comment);
  }
}
