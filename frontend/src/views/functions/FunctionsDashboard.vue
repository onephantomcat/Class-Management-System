<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <h2 style="margin-bottom: 20px;">系统标量函数实时计算看板</h2>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="card-row">
      <!-- 函数1: 待审批任务 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>待审批任务数</template>
          <div class="stat-content">
            <el-input v-model="inputs.approverId" placeholder="学工号" size="small" @change="fetchPendingApprovalCount" />
            <div class="stat-value">{{ stats.pendingApprovalCount }}</div>
          </div>
        </el-card>
      </el-col>

      <!-- 函数3: 某学生欠费 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>某学生欠费总额</template>
          <div class="stat-content">
            <el-input v-model="inputs.debtStudentId" placeholder="学工号" size="small" @change="fetchStudentDebt" />
            <div class="stat-value danger">¥{{ stats.studentDebt.toFixed(2) }}</div>
          </div>
        </el-card>
      </el-col>

      <!-- 函数9 & 10: 活动报名与获奖人数 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>活动实时报名数</template>
          <div class="stat-content">
            <el-input v-model="inputs.activityId" placeholder="活动编号" size="small" @change="fetchActivityRegCount" />
            <div class="stat-value success">{{ stats.activityRegCount }} 人</div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>评优已获奖人数</template>
          <div class="stat-content">
            <el-input v-model="inputs.projectId" placeholder="评优项目编号" size="small" @change="fetchAwardWinnerCount" />
            <div class="stat-value primary">{{ stats.awardWinnerCount }} 人</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 函数8: 特别指定的 异常考勤预警表 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>班级异常考勤预警雷达 (底层直接调用接口)</span>
              <div>
                <el-input v-model="inputs.className" placeholder="输入班级" size="small" style="width: 150px; margin-right:10px" @change="fetchAbnormalStudents" />
                <el-input-number v-model="inputs.threshold" :min="1" size="small" @change="fetchAbnormalStudents" />
              </div>
            </div>
          </template>
          <el-table :data="abnormalStudents" border height="250" v-loading="loadingAbnormal">
            <el-table-column prop="学工号" label="学工号" width="120" />
            <el-table-column prop="姓名" label="姓名" width="100" />
            <el-table-column prop="异常次数" label="异常次数">
              <template #default="scope">
                <el-tag type="danger">{{ scope.row.异常次数 }} 次</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 函数2: 任务完成度报表 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>用户任务完成度报表 (多语句结果集)</span>
              <el-input v-model="inputs.taskUserId" placeholder="学工号" size="small" style="width: 150px" @change="fetchUserTaskSummary" />
            </div>
          </template>
          <el-descriptions border :column="2" v-if="taskSummary">
            <el-descriptions-item label="分配任务总数">{{ taskSummary.分配任务总数 }}</el-descriptions-item>
            <el-descriptions-item label="验收通过数量">{{ taskSummary.验收通过数量 }}</el-descriptions-item>
            <el-descriptions-item label="任务综合完成率" :span="2">
              <el-progress :percentage="parseFloat(taskSummary.任务综合完成率)" />
            </el-descriptions-item>
          </el-descriptions>
          <el-empty v-else description="暂无数据" :image-size="60"></el-empty>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { 
  getPendingApprovalCount, getStudentDebt, getActivityRegistrationCount, 
  getAwardWinnerCount, getClassAbnormalStudents, getUserTaskSummary 
} from '@/api/functions';

const inputs = reactive({
  approverId: 'T001',
  debtStudentId: 'S001',
  activityId: 'ACT001',
  projectId: 'AWARD001',
  className: '软件工程1班',
  threshold: 3,
  taskUserId: 'S001'
});

const stats = reactive({
  pendingApprovalCount: 0,
  studentDebt: 0.00,
  activityRegCount: 0,
  awardWinnerCount: 0
});

const abnormalStudents = ref([]);
const loadingAbnormal = ref(false);
const taskSummary = ref(null);

// ============ 单独请求方法 ============
const fetchPendingApprovalCount = async () => {
  if(!inputs.approverId) return;
  const res = await getPendingApprovalCount(inputs.approverId);
  stats.pendingApprovalCount = res.data;
};

const fetchStudentDebt = async () => {
  if(!inputs.debtStudentId) return;
  const res = await getStudentDebt(inputs.debtStudentId);
  stats.studentDebt = res.data;
};

const fetchActivityRegCount = async () => {
  if(!inputs.activityId) return;
  const res = await getActivityRegistrationCount(inputs.activityId);
  stats.activityRegCount = res.data;
};

const fetchAwardWinnerCount = async () => {
  if(!inputs.projectId) return;
  const res = await getAwardWinnerCount(inputs.projectId);
  stats.awardWinnerCount = res.data;
};

const fetchAbnormalStudents = async () => {
  if(!inputs.className) return;
  loadingAbnormal.value = true;
  try {
    const res = await getClassAbnormalStudents(inputs.className, inputs.threshold);
    abnormalStudents.value = res.data;
  } finally {
    loadingAbnormal.value = false;
  }
};

const fetchUserTaskSummary = async () => {
  if(!inputs.taskUserId) return;
  const res = await getUserTaskSummary(inputs.taskUserId);
  taskSummary.value = res.data;
};

// ============ 生命周期自动触发 ============
// 按要求在 onMounted 中直接执行函数内容调用该异常预警接口，并顺带执行其他标量函数渲染步骤
onMounted(() => {
  fetchAbnormalStudents();
  fetchPendingApprovalCount();
  fetchStudentDebt();
  fetchActivityRegCount();
  fetchAwardWinnerCount();
  fetchUserTaskSummary();
});
</script>

<style scoped>
.dashboard-container { padding: 20px; }
.card-row { margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-content { padding: 10px 0; }
.stat-value { font-size: 28px; font-weight: bold; margin-top: 15px; color: #303133; }
.stat-value.danger { color: #F56C6C; }
.stat-value.success { color: #67C23A; }
.stat-value.primary { color: #409EFF; }
</style>
