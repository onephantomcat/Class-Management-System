import { Injectable, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(private readonly entityManager: EntityManager) {}

  async getCourses(query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const keyword = query.keyword || '';

    let sql = `SELECT * FROM 班级学期课表 WHERE 1=1`;
    const params: any[] = [];

    if (keyword) {
      sql += ` AND (课程名称 LIKE ? OR 任课教师 LIKE ? OR 所属班级 LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    sql += ` ORDER BY 更新时间 DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, (page - 1) * pageSize);

    const list = await this.entityManager.query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM 班级学期课表 WHERE 1=1`;
    const countParams: any[] = [];
    if (keyword) {
      countSql += ` AND (课程名称 LIKE ? OR 任课教师 LIKE ? OR 所属班级 LIKE ?)`;
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [totalRow] = await this.entityManager.query(countSql, countParams);

    return {
      list,
      total: Number(totalRow.total),
      page,
      pageSize
    };
  }

  async createCourse(data: any) {
    const courseId = `COURSE_${Date.now()}`;
    await this.entityManager.query(
      `INSERT INTO 班级学期课表 
        (课程编号, 课程名称, 所属班级, 任课教师, 上课时间, 上课地点, 学分, 学期)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        data.courseName,
        data.className || '软件工程1班',
        data.teacher,
        data.classTime,
        data.location,
        data.credit,
        data.semester
      ]
    );
    return { success: true, courseId };
  }

  async updateCourse(id: string, data: any) {
    await this.entityManager.query(
      `UPDATE 班级学期课表 
       SET 课程名称 = ?, 任课教师 = ?, 上课时间 = ?, 上课地点 = ?, 学分 = ?, 学期 = ?
       WHERE 课程编号 = ?`,
      [
        data.courseName,
        data.teacher,
        data.classTime,
        data.location,
        data.credit,
        data.semester,
        id
      ]
    );
    return { success: true };
  }

  async deleteCourse(id: string) {
    await this.entityManager.query(
      `DELETE FROM 班级学期课表 WHERE 课程编号 = ?`,
      [id]
    );
    return { success: true };
  }
}
