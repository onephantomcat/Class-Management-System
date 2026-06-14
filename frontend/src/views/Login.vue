<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <div class="title">班级事务管理系统</div>
      <div class="subtitle">
        请选择一个身份进行免密模拟登录 
        <el-link type="primary" :underline="false" @click="showGuide = true" style="margin-left: 10px;">
          <el-icon><Document /></el-icon> 操作指南
        </el-link>
      </div>

      <div class="role-list">
        <!-- Role 1 -->
        <el-button class="role-btn" type="primary" @click="handleLogin('T001', 1, '', '王老师')">
          <el-icon><UserFilled /></el-icon> 班主任 (Role 1) - 全权限
        </el-button>
        
        <!-- Role 2 -->
        <el-button class="role-btn" type="success" @click="handleLogin('M001', 2, '', '张班长')">
          <el-icon><Avatar /></el-icon> 班长 (Role 2) - 全权限
        </el-button>
        
        <!-- Role 3 (学习委员) -->
        <el-button class="role-btn" type="warning" @click="handleLogin('S001', 3, '学习委员', '李学委')">
          <el-icon><Reading /></el-icon> 学习委员 (Role 3)
        </el-button>

        <!-- Role 3 (纪律委员) -->
        <el-button class="role-btn" type="warning" plain @click="handleLogin('S002', 3, '纪律委员', '赵纪委')">
          <el-icon><Warning /></el-icon> 纪律委员 (Role 3)
        </el-button>

        <!-- Role 4 -->
        <el-button class="role-btn" type="info" @click="handleLogin('S003', 4, '', '孙同学')">
          <el-icon><User /></el-icon> 普通同学 (Role 4) - 仅查询权限
        </el-button>
      </div>
    </el-card>

    <!-- 系统操作指南弹窗 -->
    <el-dialog title="📖 系统详细操作指南" v-model="showGuide" width="650px">
      <div class="guide-content" style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
        <h3 style="margin-top: 0; color: #303133;">欢迎使用班级事务管理系统</h3>
        <p style="color: #606266; font-size: 14px;">本系统基于严格的 <strong>RBAC 架构</strong> (Role-Based Access Control) 和 <strong>MySQL 底层触发器 (Triggers)</strong> 设计，实现了高内聚低耦合的自动化班级事务流转。请详阅以下系统操作指南：</p>
        
        <h4 style="color: #409EFF; border-bottom: 1px solid #EBEEF5; padding-bottom: 5px;">一、 角色与权限体系</h4>
        <ul style="line-height: 1.8; margin-bottom: 15px; color: #606266; font-size: 14px;">
          <li><el-tag size="small" type="danger">班主任 (Role 1)</el-tag> <strong>最高管理权限</strong>。可纵览全班成绩、考勤大盘，具备管理全员系统账号的权限。负责对“综合评优”项目进行终审和授予等级。</li>
          <li><el-tag size="small" type="warning">班长/团支书 (Role 2)</el-tag> <strong>核心管理权限</strong>。负责班费流水审核与记录、日常任务派发、学生请假初审，以及对班级活动进行统筹。</li>
          <li><el-tag size="small" type="primary">职能班委 (Role 3)</el-tag> <strong>水平权限隔离</strong>。系统根据其具体 <code>jobId</code> 解锁对应的专项工作台。例如：<strong>学习委员</strong>可动态录入全班成绩；<strong>纪律委员</strong>可录入违纪情况并查看全班考勤大盘。</li>
          <li><el-tag size="small" type="info">普通同学 (Role 4)</el-tag> <strong>个人数据访问权</strong>。只能访问属于自己的独立档案库（个人成绩、缴费账单、个人纪律档案），可随时发起请假申请、参与评优与班级活动报名。</li>
        </ul>

        <h4 style="color: #409EFF; border-bottom: 1px solid #EBEEF5; padding-bottom: 5px;">二、 核心业务流转 (Trigger 自动化)</h4>
        <div style="padding: 12px; background-color: #f8f9fa; border-left: 4px solid #409EFF; border-radius: 4px; font-size: 13px; color: #606266; line-height: 1.6;">
          <strong>1. 评优“一票否决”与状态流转</strong><br/>
          学生提交评优申请时，底层数据库自动查验其成绩档案。若存在挂科记录，触发器会当场回滚并提示“挂科禁止参与”；申请成功后，班主任在专台授予等级，状态瞬间流转为“已公示”。<br/><br/>
          <strong>2. 活动报名“防超卖”高并发控制</strong><br/>
          活动报名受严格的名额限制。当最后 1 个名额被抢占时，底层触发器会自动拒绝后续的所有写入请求，从根源杜绝超卖现象。<br/><br/>
          <strong>3. 班费与个人账单“账实同步”</strong><br/>
          班长记录一笔新的班费收支时，触发器自动更新班费总池（班费大盘）；当分配个人欠缴账单时，学生的“我的缴费账单”会自动生成待缴记录。
        </div>

        <h4 style="color: #409EFF; border-bottom: 1px solid #EBEEF5; padding-bottom: 5px; margin-top: 15px;">三、 安全防护策略</h4>
        <p style="font-size: 13px; color: #606266; line-height: 1.6;">
          本系统在路由层 (RouterGuard)、视图层 (v-if 隔离) 和数据接口层实施了三维一体的鉴权体系。下级角色绝无法操作上级账号，同级之间实现了严格的水平越权防护（如学习委员无法查看考勤大盘，班长无法修改班主任密码）。
        </p>
      </div>
      <template #footer>
        <el-button type="primary" @click="showGuide = false">我已经完全了解啦</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { UserFilled, Avatar, Reading, Warning, User, Document } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();
const showGuide = ref(false);

const handleLogin = (studentId, roleCode, jobId, name) => {
  // 模拟调用后端 JWT 接口，直接写入 Pinia
  userStore.login({
    token: `MOCK_JWT_TOKEN_${roleCode}_${Date.now()}`,
    studentId,
    roleCode,
    jobId,
    name
  });
  
  ElMessage.success(`欢迎您，${name}！已为您加载专署工作台。`);
  router.push('/');
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
.login-card {
  width: 450px;
  text-align: center;
  padding: 20px;
}
.title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #303133; }
.subtitle { font-size: 14px; color: #909399; margin-bottom: 30px; }
.role-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.role-btn {
  width: 100%;
  height: 45px;
  margin-left: 0 !important;
  margin: 0 !important;
  justify-content: flex-start;
  padding-left: 20px;
  font-size: 16px;
}
</style>
