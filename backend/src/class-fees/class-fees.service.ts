import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class ClassFeesService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  // 1. 获取当前班费余额台账
  async getBalance() {
    const [balance] = await this.entityManager.query(`SELECT * FROM 班费余额台账表 ORDER BY 统计日期 DESC LIMIT 1`);
    if (!balance) {
      return { 期末余额: 0, 期初余额: 0, 本期收入: 0, 本期支出: 0 };
    }
    return balance;
  }

  // 辅助方法：更新台账余额
  private async updateBalance(manager: EntityManager, amount: number, isIncome: boolean) {
    let [balance] = await manager.query(`SELECT * FROM 班费余额台账表 ORDER BY 统计日期 DESC LIMIT 1`);
    
    // 如果没有台账，则初始化一条
    if (!balance) {
      await manager.query(
        `INSERT INTO 班费余额台账表 (台账ID, 统计日期, 期初余额, 本期收入, 本期支出, 期末余额, 生成人学工号) 
         VALUES (?, NOW(), 0, 0, 0, 0, 'SYSTEM')`,
        [`LEDGER_${Date.now()}`]
      );
      [balance] = await manager.query(`SELECT * FROM 班费余额台账表 ORDER BY 统计日期 DESC LIMIT 1`);
    }

    const newIncome = isIncome ? Number(balance.本期收入) + amount : Number(balance.本期收入);
    const newExpense = !isIncome ? Number(balance.本期支出) + amount : Number(balance.本期支出);
    const newEndBalance = isIncome ? Number(balance.期末余额) + amount : Number(balance.期末余额) - amount;

    await manager.query(
      `UPDATE 班费余额台账表 SET 本期收入 = ?, 本期支出 = ?, 期末余额 = ? WHERE 台账ID = ?`,
      [newIncome, newExpense, newEndBalance, balance.台账ID]
    );
  }

  // 2. 发起收费批次 (班长/生活委员)
  async createIncome(data: any) {
    const incomeId = `INC_${Date.now()}`;
    const amount = Number(data.amount) || 0;

    await this.entityManager.transaction(async (manager) => {
      // 插入收入记录
      await manager.query(
        `INSERT INTO 班费收入记录表 (收入编号, 收入日期, 收入金额, 收入类型, 缴费方式, 备注, 经手人学工号) 
         VALUES (?, NOW(), ?, ?, '线上', ?, ?)`,
        [incomeId, amount, data.incomeType || '日常班费', data.remark || '', data.operatorId]
      );

      // 获取所有未被删除、未被冻结的班级成员 (排除班主任等角色1的非学生账号)
      const users = await manager.query(`SELECT 学工号 FROM 用户账号与权限信息表 WHERE 账号状态 != '已注销' AND 角色编码 != 1`);

      // 为每个成员生成待缴费明细
      for (const user of users) {
        const detailId = `DETAIL_${user.学工号}_${Date.now()}`;
        await manager.query(
          `INSERT INTO 学生缴费明细表 (缴费明细ID, 学工号, 收入编号, 缴费状态, 缴费金额) 
           VALUES (?, ?, ?, '待缴费', ?)`,
          [detailId, user.学工号, incomeId, amount]
        );
      }
    });

    return { success: true, incomeId };
  }

  // 3. 获取个人的缴费账单
  async getMyBills(userId: string) {
    return this.entityManager.query(
      `SELECT d.*, i.收入日期, i.收入类型, i.备注 
       FROM 学生缴费明细表 d 
       LEFT JOIN 班费收入记录表 i ON d.收入编号 = i.收入编号 
       WHERE d.学工号 = ? 
       ORDER BY i.收入日期 DESC`,
      [userId]
    );
  }

  // 4. 学生模拟扫码缴费
  async payBill(detailId: string) {
    await this.entityManager.transaction(async (manager) => {
      // 获取这笔明细
      const [detail] = await manager.query(`SELECT * FROM 学生缴费明细表 WHERE 缴费明细ID = ?`, [detailId]);
      if (!detail) throw new BadRequestException('账单不存在');
      if (detail.缴费状态 === '已缴费') throw new BadRequestException('请勿重复缴费');

      // 更新状态
      await manager.query(
        `UPDATE 学生缴费明细表 SET 缴费状态 = '已缴费', 缴费时间 = NOW() WHERE 缴费明细ID = ?`,
        [detailId]
      );

      // 实时增加班级总资产台账
      await this.updateBalance(manager, Number(detail.缴费金额), true);
    });

    return { success: true };
  }

  // 5. 提交支出（报销）申请
  async createExpense(data: any) {
    const expenseId = `EXP_${Date.now()}`;
    await this.entityManager.query(
      `INSERT INTO 班费支出申请表 
        (支出编号, 申请日期, 支出事由, 支出金额, 票据凭证, 审批状态, 公示状态, 申请人学工号) 
       VALUES (?, NOW(), ?, ?, ?, '待审批', '未公示', ?)`,
      [expenseId, data.reason, Number(data.amount), data.proof || '', data.applicantId]
    );
    return { success: true, expenseId };
  }

  // 6. 获取支出申请列表
  async getExpenses(userId?: string) {
    let sql = `
      SELECT e.*, u.姓名 as 申请人姓名 
      FROM 班费支出申请表 e 
      LEFT JOIN 用户账号与权限信息表 u ON e.申请人学工号 = u.学工号
    `;
    const params = [];
    if (userId) {
      sql += ` WHERE e.申请人学工号 = ?`;
      params.push(userId);
    }
    sql += ` ORDER BY e.申请日期 DESC`;
    
    return this.entityManager.query(sql, params);
  }

  // 7. 审批报销申请
  async auditExpense(expenseId: string, auditorId: string, action: string, comment: string) {
    await this.entityManager.transaction(async (manager) => {
      const [expense] = await manager.query(`SELECT * FROM 班费支出申请表 WHERE 支出编号 = ?`, [expenseId]);
      if (!expense) throw new BadRequestException('报销单不存在');

      let nextStatus = expense.审批状态;

      if (action === '驳回') {
        nextStatus = '已驳回';
        await manager.query(
          `UPDATE 班费支出申请表 SET 审批状态 = ? WHERE 支出编号 = ?`,
          [nextStatus, expenseId]
        );
      } else if (action === '通过') {
        // 简化逻辑：一次性审批通过并拨款
        nextStatus = '已报销';
        await manager.query(
          `UPDATE 班费支出申请表 SET 审批状态 = ?, 终审人学工号 = ?, 支付日期 = NOW(), 公示状态 = '已公示' WHERE 支出编号 = ?`,
          [nextStatus, auditorId, expenseId]
        );

        // 实时扣减班级总资产台账
        await this.updateBalance(manager, Number(expense.支出金额), false);
      }
    });

    return { success: true };
  }
}
