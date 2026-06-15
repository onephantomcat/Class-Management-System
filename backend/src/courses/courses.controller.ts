import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses(@Query() query: any) {
    return this.coursesService.getCourses(query);
  }

  @Post()
  async createCourse(@Body() data: any) {
    return this.coursesService.createCourse(data);
  }

  @Put(':id')
  async updateCourse(@Param('id') id: string, @Body() data: any) {
    return this.coursesService.updateCourse(id, data);
  }

  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
