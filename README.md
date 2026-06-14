# 🎓 班级事务管理系统 (Class Management System)

欢迎使用**班级事务管理系统**！本项目是一个基于严格 RBAC（基于角色的访问控制）架构与 MySQL 底层触发器（Triggers）实现的全栈自动化管理平台。

系统旨在实现班级事务（成绩、班费、考勤、纪律、评优、活动等）的高内聚、低耦合自动化流转。

---

## ⚡ 核心架构与亮点

- **前端框架**：Vue 3 + Vite + Element Plus + Pinia
- **后端框架**：NestJS + TypeORM
- **数据库**：MySQL 8.0+
- **底层驱动**：所有核心业务流转（如活动防超卖拦截、评优一票否决、班费余额自动重算等）均由 **MySQL Trigger** 静默接管，无需前端轮询，保障了数据的绝对强一致性。

---

## 🛠️ 团队开发环境部署指南

为了在本地顺利运行本系统，请按照以下三个步骤进行环境配置与启动：

### 第一步：配置 MySQL 数据库

1. 在本地启动 MySQL 服务（推荐使用 Navicat、DataGrip 或终端命令行）。
2. 创建一个名为 `student_management` 的空数据库，并指定字符集：
   ```sql
   CREATE DATABASE student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. 导入仓库根目录下的 **`db_dump.sql`** 文件：
   - **命令行导入方式**：
     ```bash
     mysql -u root -p student_management < db_dump.sql
     ```
   - **图形化工具导入**：在 Navicat 等工具中右键点击 `student_management` 数据库 -> 运行 SQL 文件 -> 选择 `db_dump.sql` -> 点击开始。
   
   > 💡 **提示：** 该 SQL 文件中已经完整打包了项目所需的表结构、底层自动化触发器（Triggers）、视图（Views）以及部分用于演示的初始化测试数据。

### 第二步：启动 Backend (NestJS 后端服务)

1. 确保电脑已安装 [Node.js](https://nodejs.org/)（推荐 v18 或以上版本）。
2. 在终端中进入 `backend` 目录并安装依赖：
   ```bash
   cd backend
   npm install
   ```
3. **确认数据库连接配置**：
   打开 `backend/src/app.module.ts` 文件，检查第 38-47 行的数据库连接配置，确保与你本地的 MySQL 环境一致：
   ```typescript
   TypeOrmModule.forRoot({
     type: 'mysql',
     host: '127.0.0.1',       
     port: 3306,              
     username: 'root',      // ⚠️ 如果你的 MySQL 用户名不是 root，请修改
     password: '',          // ⚠️ 如果你的 MySQL 有密码，请在这里填入密码
     database: 'student_management',    
     autoLoadEntities: true,
     synchronize: false,    // ⚠️ 严禁改为 true，以免破坏底层 Trigger 结构
   }),
   ```
4. **启动后端服务**：
   ```bash
   npm run start:dev
   ```
   *当控制台输出 `Nest application successfully started` 即代表后端启动成功，默认运行在 `http://localhost:3000`。*

### 第三步：启动 Frontend (Vue3 前端服务)

1. 新开一个独立的终端窗口，进入 `frontend` 目录并安装依赖：
   ```bash
   cd frontend
   npm install
   ```
2. **启动前端服务**：
   ```bash
   npm run dev
   ```
3. 启动完成后，在浏览器中访问控制台输出的本地地址（通常是 `http://localhost:5173`），即可看到系统的登录界面！

---

## 📖 角色与账号体系说明

在系统登录页，可以直接免密一键切换以下身份视角：

- 🔴 **班主任 (Role 1)** - 全权限，可纵览全班数据大盘，并在【触发控制台】进行评优等级终审授予。
- 🟡 **班长 (Role 2)** - 核心职能，负责班费流水审核与记录、日常任务派发与请假初审。
- 🔵 **职能班委 (Role 3)** - 水平权限隔离，学习委员负责成绩录入，纪律委员负责考勤查阅与违纪录入。
- ⚪ **普通成员 (Role 4)** - 拥有独立的数据档案库，可随时发起请假申请或参与评优、活动报名。

所有角色的鉴权均已在路由层 (RouterGuard)、视图层 (v-if 隔离) 以及数据接口层实现严格的安全拦截验证。

祝您开发愉快！🚀
