<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="aside">
      <div class="logo">班级事务管理系统</div>
      <el-menu
        active-text-color="#409eff"
        background-color="#304156"
        text-color="#bfcbd9"
        :default-active="$route.path"
        router
      >
        <!-- Role 1,2,3,4 都能看的公共区 -->
        <el-sub-menu index="1">
          <template #title><el-icon><Monitor /></el-icon><span>公示与查询</span></template>
          <el-menu-item index="/views/award-details">评优申报详情</el-menu-item>
          <el-menu-item index="/views/expense-details">班费支出明细</el-menu-item>
          <el-menu-item index="/views/class-fee-incomes">班费收入明细</el-menu-item>
          <el-menu-item index="/views/pending-class-fees">待审批班费支出</el-menu-item>
        </el-sub-menu>

        <!-- 全景数据档案室 (分角色) -->
        <el-sub-menu index="4">
          <template #title><el-icon><Histogram /></el-icon><span>全景数据档案室</span></template>
          <!-- 全员可见 (但班主任没有个人作业和缴费，因此屏蔽) -->
          <el-menu-item v-if="roleCode !== 1" index="/views/student-academics">学生个人学业总览</el-menu-item>
          <el-menu-item v-if="roleCode !== 1" index="/views/student-disciplines">学生个人纪律档案</el-menu-item>
          
          <el-menu-item index="/views/class-schedule">班级学期课表(操作原表)</el-menu-item>

          <!-- 班委及以上可见 (Role 1, 2, 3)，进一步做水平权限隔离 -->
          <el-menu-item 
            v-if="roleCode === 1 || roleCode === 2 || (roleCode === 3 && jobId.includes('纪律'))" 
            index="/views/class-attendance-stats"
          >
            班级出勤率周统计
          </el-menu-item>
          <el-menu-item v-if="roleCode === 1 || roleCode === 2 || (roleCode === 3 && jobId.includes('文体'))" index="/views/activity-registration-stats">活动报名统计</el-menu-item>
          <el-menu-item v-if="roleCode === 1 || roleCode === 2 || (roleCode === 3 && jobId.includes('财务'))" index="/views/student-payments">学生缴费情况明细</el-menu-item>
          <el-menu-item v-if="roleCode === 1 || roleCode === 2 || (roleCode === 3 && jobId.includes('学习'))" index="/views/class-grades">班级成绩与课表明细</el-menu-item>

          <!-- 班主任/班长可见 (Role 1, 2) -->
          <el-menu-item v-if="roleCode === 1 || roleCode === 2" index="/views/pending-approvals">待办审批事务</el-menu-item>
          <el-menu-item v-if="roleCode === 1 || roleCode === 2" index="/views/user-roles">用户与角色详细信息</el-menu-item>
        </el-sub-menu>

        <!-- 仅 Role 1, 2 能看的大盘与审批 -->
        <template v-if="roleCode === 1 || roleCode === 2">
          <el-sub-menu index="2">
            <template #title><el-icon><DataLine /></el-icon><span>管理控制台 (限1,2)</span></template>
            <el-menu-item index="/users/management">用户与权限管理</el-menu-item>
            <el-menu-item index="/functions/dashboard">实时标量预警大盘</el-menu-item>
            <el-menu-item index="/triggers/dashboard">全业务触发控制台</el-menu-item>
            <el-menu-item index="/views/system-logs">系统全局操作日志</el-menu-item>
            <el-menu-item index="/views/approval-flows">全局审批流程大盘</el-menu-item>
          </el-sub-menu>
        </template>

        <!-- 专项工作台 (部分向全员开放，部分限制) -->
        <el-sub-menu index="3">
          <template #title><el-icon><Edit /></el-icon><span>专项工作台</span></template>
          
          <el-menu-item index="/tasks/center">日常任务大厅</el-menu-item>
          <el-menu-item index="/approvals/center">审批大厅</el-menu-item>
          <el-menu-item index="/class-fees/dashboard">班费账单中心</el-menu-item>

          <!-- 只有1,2 或者 jobId包含'学习'的3才能录入成绩 -->
          <el-menu-item 
            v-if="roleCode === 1 || roleCode === 2 || (roleCode === 3 && jobId.includes('学习'))" 
            index="/triggers/score-entry"
          >
            成绩动态录入
          </el-menu-item>
          
          <!-- 纪律/考勤登记菜单 -->
          <el-menu-item 
            v-if="roleCode === 1 || roleCode === 2 || (roleCode === 3 && jobId.includes('纪律'))" 
            index="/triggers/discipline"
          >
            考勤与纪律登记
          </el-menu-item>

          <!-- 评优与活动报名菜单 (新增班主任角色1，进入后用于审批评优) -->
          <el-menu-item 
            v-if="roleCode === 1 || roleCode === 2 || roleCode === 3 || roleCode === 4" 
            index="/awards-activities"
          >
            综合评优与活动报名
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container>
      <el-header class="header">
        <div class="header-right">
          <el-button type="primary" plain size="small" :icon="Document" @click="showGuide = true" style="margin-right: 15px;">
            操作指南
          </el-button>
          <span style="margin-right: 15px;">当前身份: {{ roleLabel }} ({{ userStore.studentName }})</span>
          <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <!-- 路由出口 -->
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

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
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { Monitor, DataLine, Edit, Histogram, Document } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();

const showGuide = ref(false);

const roleCode = computed(() => userStore.roleCode);
const jobId = computed(() => userStore.jobId);

const roleLabel = computed(() => {
  if (roleCode.value === 1) return '班主任';
  if (roleCode.value === 2) return '班长';
  if (roleCode.value === 3) return `职能班委 (${jobId.value})`;
  return '普通成员';
});

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.layout-container { height: 100vh; }
.aside { background-color: #304156; display: flex; flex-direction: column; }
.logo { height: 60px; line-height: 60px; text-align: center; color: #fff; font-size: 18px; font-weight: bold; background: #2b3643; }
.el-menu { border-right: none; flex-grow: 1; }
.header { background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: flex-end; padding: 0 20px; box-shadow: 0 1px 4px rgba(0,21,41,.08); }
.header-right { display: flex; align-items: center; font-weight: bold; color: #606266; }
.main-content { background-color: #f0f2f5; padding: 20px; }

/* 过渡动画 */
.fade-transform-leave-active, .fade-transform-enter-active { transition: all 0.3s; }
.fade-transform-enter-from { opacity: 0; transform: translateX(-30px); }
.fade-transform-leave-to { opacity: 0; transform: translateX(30px); }
</style>
