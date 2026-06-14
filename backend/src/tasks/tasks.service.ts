import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  // 获取任务列表 (根据角色：executor-我负责的，publisher-我发布的)
  async getTasks(userId: string, role: string) {
    let sql = `
      SELECT t.*, 
             p.姓名 as 发布人姓名, 
             e.姓名 as 负责人姓名 
      FROM 日常任务表 t
      LEFT JOIN 用户账号与权限信息表 p ON t.发布人学工号 = p.学工号
      LEFT JOIN 用户账号与权限信息表 e ON t.负责人学工号 = e.学工号
    `;
    const params = [];

    if (role === 'executor') {
      sql += ` WHERE t.负责人学工号 = ? ORDER BY t.发布时间 DESC`;
      params.push(userId);
    } else if (role === 'publisher') {
      sql += ` WHERE t.发布人学工号 = ? ORDER BY t.发布时间 DESC`;
      params.push(userId);
    } else {
      sql += ` ORDER BY t.发布时间 DESC`;
    }

    return this.entityManager.query(sql, params);
  }

  // 发布新任务
  async createTask(publisherId: string, data: any) {
    const taskId = `TASK_${Date.now()}`;
    await this.entityManager.query(
      `INSERT INTO 日常任务表 
        (任务编号, 任务类型, 任务内容, 完成时限, 验收标准, 任务进度, 验收状态, 发布人学工号, 负责人学工号) 
       VALUES (?, ?, ?, ?, ?, 0, '待处理', ?, ?)`,
      [
        taskId, 
        data.taskType || '日常事务', 
        data.content, 
        data.deadline, 
        data.standard || '', 
        publisherId, 
        data.executorId
      ]
    );
    return { success: true, taskId };
  }

  // 执行人更新进度
  async updateProgress(taskId: string, executorId: string, progress: number, result: string) {
    // 状态机流转：进度更新后状态变为“待验收”
    await this.entityManager.query(
      `UPDATE 日常任务表 SET 任务进度 = ?, 完成成果 = ?, 验收状态 = '待验收' WHERE 任务编号 = ? AND 负责人学工号 = ?`,
      [progress, result, taskId, executorId]
    );
    return { success: true };
  }

  // 发布人验收任务
  async verifyTask(taskId: string, publisherId: string, status: string, comment: string) {
    // 状态: '已完结', '驳回'
    let finishTime = null;
    if (status === '已完结') {
      finishTime = new Date(); // triggers require Date object or 'NOW()' string but query param is easier
    }

    await this.entityManager.query(
      `UPDATE 日常任务表 
       SET 验收状态 = ?, 验收意见 = ?, 完结时间 = IF(? = '已完结', NOW(), NULL) 
       WHERE 任务编号 = ? AND 发布人学工号 = ?`,
      [status, comment, status, taskId, publisherId]
    );
    return { success: true };
  }
}
