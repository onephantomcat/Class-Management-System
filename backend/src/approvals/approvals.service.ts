import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class ApprovalsService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  // 1. 发起请假申请
  async createLeaveRequest(data: any) {
    const approvalId = `APP_${Date.now()}`;
    const leaveId = `LEAVE_${Date.now()}`;
    
    // 获取申请人姓名
    const [users] = await this.entityManager.query(`SELECT 姓名 FROM 用户账号与权限信息表 WHERE 学工号 = ?`, [data.studentId]);
    const name = users ? users.姓名 : '未知';

    // 事务处理
    await this.entityManager.transaction(async (manager) => {
      // 插入总表: 初始节点为“班长初审”，状态为“待审批”
      await manager.query(
        `INSERT INTO 审批流程总表 
          (审批编号, 审批类型, 申请人学工号, 申请人姓名, 申请内容, 当前审批节点, 审批状态)
         VALUES (?, '请假申请', ?, ?, ?, '班长初审', '待审批')`,
        [approvalId, data.studentId, name, data.reason || '请假']
      );

      // 插入请假附表
      await manager.query(
        `INSERT INTO 请假申请表 
          (请假编号, 审批编号, 请假类型, 请假起止时间, 请假时长, 请假事由)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [leaveId, approvalId, data.leaveType || '事假', data.timeRange || '', data.duration || 0, data.reason || '']
      );
    });

    return { success: true, approvalId };
  }

  // 1.5 发起成绩修改申请
  async createGradeModificationRequest(data: any) {
    const approvalId = `APP_${Date.now()}`;
    
    // 获取申请人姓名
    const [users] = await this.entityManager.query(`SELECT 姓名 FROM 用户账号与权限信息表 WHERE 学工号 = ?`, [data.applicantId]);
    const name = users ? users.姓名 : '未知';

    // 申请内容打包为 JSON，包含新旧成绩等
    const contentPayload = JSON.stringify({
      gradeId: data.gradeId,
      courseName: data.courseName,
      studentName: data.studentName,
      oldScore: data.oldScore,
      newScore: data.newScore,
      reason: data.reason
    });

    // 成绩修改直接流转给班主任终审
    await this.entityManager.query(
      `INSERT INTO 审批流程总表 
        (审批编号, 审批类型, 申请人学工号, 申请人姓名, 申请内容, 当前审批节点, 审批状态)
       VALUES (?, '成绩修改申请', ?, ?, ?, '班主任终审', '待审批')`,
      [approvalId, data.applicantId, name, contentPayload]
    );

    return { success: true, approvalId };
  }

  // 2. 获取我的申请
  async getMyRequests(userId: string) {
    return this.entityManager.query(
      `SELECT a.*, l.请假类型, l.请假起止时间 
       FROM 审批流程总表 a 
       LEFT JOIN 请假申请表 l ON a.审批编号 = l.审批编号
       WHERE a.申请人学工号 = ? 
       ORDER BY a.申请时间 DESC`,
      [userId]
    );
  }

  // 3. 获取待办审批 (根据登录人角色：1-班主任，2-班长)
  async getPendingApprovals(roleCode: number) {
    let targetNode = '';
    if (roleCode === 2) {
      targetNode = '班长初审';
    } else if (roleCode === 1) {
      targetNode = '班主任终审';
    } else {
      return []; // 其他角色无审批权限
    }

    return this.entityManager.query(
      `SELECT a.*, l.请假类型, l.请假起止时间 
       FROM 审批流程总表 a 
       LEFT JOIN 请假申请表 l ON a.审批编号 = l.审批编号
       WHERE a.当前审批节点 = ? AND a.审批状态 = '待审批'
       ORDER BY a.申请时间 DESC`,
      [targetNode]
    );
  }

  // 4. 处理审批
  async auditApproval(approvalId: string, auditorId: string, action: string, comment: string) {
    const [approval] = await this.entityManager.query(`SELECT * FROM 审批流程总表 WHERE 审批编号 = ?`, [approvalId]);
    if (!approval) throw new BadRequestException('审批不存在');

    let nextNode = approval.当前审批节点;
    let nextStatus = approval.审批状态;
    let finishTime = null;

    if (action === '驳回') {
      nextStatus = '已驳回';
      finishTime = new Date();
    } else if (action === '通过') {
      if (approval.当前审批节点 === '班长初审') {
        // 班长初审通过，流转到班主任
        nextNode = '班主任终审';
      } else if (approval.当前审批节点 === '班主任终审') {
        // 班主任终审通过，流程结束
        nextStatus = '已通过';
        finishTime = new Date();
      }
    }

    // 更新审批流总表
    await this.entityManager.query(
      `UPDATE 审批流程总表 
       SET 当前审批节点 = ?, 审批状态 = ?, 审批人学工号 = ?, 审核意见 = ?, 流程完结时间 = IF(? IS NOT NULL, NOW(), NULL)
       WHERE 审批编号 = ?`,
      [nextNode, nextStatus, auditorId, comment, finishTime, approvalId]
    );

    // 如果是成绩修改申请且已通过，执行更新学业成绩明细表
    if (approval.审批类型 === '成绩修改申请' && nextStatus === '已通过') {
      try {
        const payload = JSON.parse(approval.申请内容);
        if (payload && payload.gradeId && payload.newScore !== undefined) {
          await this.entityManager.query(
            `UPDATE 学业成绩明细表 SET 总评成绩 = ?, 审核状态 = '已复核' WHERE 成绩编号 = ?`,
            [payload.newScore, payload.gradeId]
          );
        }
      } catch (e) {
        console.error('解析成绩修改申请内容失败', e);
      }
    }

    return { success: true };
  }
}
