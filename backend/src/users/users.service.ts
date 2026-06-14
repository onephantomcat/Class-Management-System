import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  async findAll(page: number = 1, pageSize: number = 10, keyword: string = '') {
    const offset = (page - 1) * pageSize;
    let baseSql = `SELECT u.*, r.角色名称 
                   FROM 用户账号与权限信息表 u 
                   LEFT JOIN 角色表 r ON u.角色编码 = r.角色编码`;
    let countSql = `SELECT COUNT(*) as total FROM 用户账号与权限信息表 u`;
    const params: any[] = [];

    if (keyword) {
      const search = `%${keyword}%`;
      baseSql += ` WHERE u.学工号 LIKE ? OR u.姓名 LIKE ? OR u.所属班级 LIKE ?`;
      countSql += ` WHERE u.学工号 LIKE ? OR u.姓名 LIKE ? OR u.所属班级 LIKE ?`;
      params.push(search, search, search);
    }

    baseSql += ` ORDER BY u.创建时间 DESC LIMIT ? OFFSET ?`;
    const queryParams = [...params, Number(pageSize), Number(offset)];

    const [items, totalResult] = await Promise.all([
      this.entityManager.query(baseSql, queryParams),
      this.entityManager.query(countSql, params),
    ]);

    return {
      items,
      total: parseInt(totalResult[0].total, 10),
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  async findOne(id: string) {
    const users = await this.entityManager.query(
      `SELECT u.*, r.角色名称 FROM 用户账号与权限信息表 u LEFT JOIN 角色表 r ON u.角色编码 = r.角色编码 WHERE u.学工号 = ?`,
      [id]
    );
    if (!users.length) throw new NotFoundException(`User with ID ${id} not found`);
    return users[0];
  }

  async create(data: any) {
    // Check if user already exists
    const existing = await this.entityManager.query(`SELECT 学工号 FROM 用户账号与权限信息表 WHERE 学工号 = ?`, [data.studentId]);
    if (existing.length > 0) throw new BadRequestException('该学工号已存在');

    await this.entityManager.query(
      `INSERT INTO 用户账号与权限信息表 (学工号, 姓名, 登录密码, 所属班级, 角色编码, 联系方式, 账号状态) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.studentId, data.name, data.password || '123456', data.className || '', data.roleCode || '4', data.phone || '', data.status || '正常']
    );
    return { success: true, message: 'User created' };
  }

  async update(id: string, data: any) {
    const user = await this.findOne(id);
    
    await this.entityManager.query(
      `UPDATE 用户账号与权限信息表 SET 姓名 = ?, 所属班级 = ?, 角色编码 = ?, 联系方式 = ? WHERE 学工号 = ?`,
      [data.name || user.姓名, data.className || user.所属班级, data.roleCode || user.角色编码, data.phone || user.联系方式, id]
    );
    return { success: true, message: 'User updated' };
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    await this.entityManager.query(
      `UPDATE 用户账号与权限信息表 SET 账号状态 = ? WHERE 学工号 = ?`,
      [status, id]
    );
    return { success: true, message: 'User status updated' };
  }

  async resetPassword(id: string, newPassword?: string) {
    await this.findOne(id);
    const pwd = newPassword || '123456';
    await this.entityManager.query(
      `UPDATE 用户账号与权限信息表 SET 登录密码 = ? WHERE 学工号 = ?`,
      [pwd, id]
    );
    return { success: true, message: 'Password reset' };
  }
}
