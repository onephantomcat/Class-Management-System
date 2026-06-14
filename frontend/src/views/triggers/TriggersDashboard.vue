<template>
  <div class="triggers-dashboard">
    <el-row :gutter="20">
      <el-col :span="24">
        <h2 style="margin-bottom: 20px;">全系统触发器 (Triggers) 自动化操作集</h2>
        <div style="margin-bottom: 20px; color: #909399; font-size: 14px;">
          在此面板发起的任何请求均只发送最简单的状态变更指令，所有关于“写日志”、“自动修改状态”、“拦截报错”、“重算汇总”的高级业务全部由 MySQL 的 Trigger 静默完成。
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <!-- 用户模块：触发 trg_after_user_insert -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>用户模块 - 自动注册</template>
          <el-form :model="forms.user" size="small">
            <el-form-item label="学工号"><el-input v-model="forms.user.studentId" /></el-form-item>
            <el-form-item label="姓名"><el-input v-model="forms.user.name" /></el-form-item>
            <el-form-item label="班级"><el-input v-model="forms.user.className" /></el-form-item>
            <el-button type="primary" @click="handleInsertUser">注册新用户 (自动写日志)</el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 日常任务模块：触发 trg_before_task_update -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>日常任务 - 状态重置 (防篡改测试)</template>
          <el-form :model="forms.task" size="small">
            <el-form-item label="任务编号"><el-input v-model="forms.task.taskId" /></el-form-item>
            <el-form-item label="修改为"><el-input v-model="forms.task.status" disabled /></el-form-item>
            <el-button type="danger" @click="handleUpdateTaskStatus">强行回退任务状态 (预期45000报错)</el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 班费模块：触发 trg_更新班费收入总金额 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>班费模块 - 缴纳明细</template>
          <el-form :model="forms.classFee" size="small">
            <el-form-item label="缴费明细单号"><el-input v-model="forms.classFee.detailId" /></el-form-item>
            <el-button type="success" @click="handlePayClassFee">确认缴费 (自动重算总收入)</el-button>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <!-- 班费模块：触发 trg_支出申请状态变更日志 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>班费模块 - 支出审批</template>
          <el-form :model="forms.expense" size="small">
            <el-form-item label="支出编号"><el-input v-model="forms.expense.expenseId" /></el-form-item>
            <el-form-item label="新状态">
              <el-select v-model="forms.expense.status">
                <el-option label="初审通过" value="初审通过" />
                <el-option label="终审通过" value="终审通过" />
                <el-option label="拒绝" value="拒绝" />
              </el-select>
            </el-form-item>
            <el-button type="warning" @click="handleAuditExpense">更新状态 (自动写变更日志)</el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 纪律模块：触发 trig_attendance_check_leave 和 trig_discipline_audit_log -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>纪律考勤 - 记录录入</template>
          <el-form :model="forms.discipline" size="small">
            <el-form-item label="学工号"><el-input v-model="forms.discipline.studentId" /></el-form-item>
            <el-form-item label="记录类型">
              <el-select v-model="forms.discipline.recordType">
                <el-option label="考勤" value="考勤" />
                <el-option label="处分" value="处分" />
              </el-select>
            </el-form-item>
            <el-form-item label="考勤状态" v-if="forms.discipline.recordType === '考勤'">
              <el-select v-model="forms.discipline.attendanceStatus">
                <el-option label="旷课" value="旷课" />
                <el-option label="迟到" value="迟到" />
              </el-select>
            </el-form-item>
            <el-form-item label="请假单号" v-if="forms.discipline.recordType === '考勤'">
              <el-input v-model="forms.discipline.leaveId" placeholder="有请假则填" />
            </el-form-item>
            <el-button type="primary" @click="handleInsertDiscipline">录入 (自动拦截请假/写处分日志)</el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 评优模块：触发 trig_获奖自动改公示状态 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>评优模块 - 获奖定级</template>
          <el-form :model="forms.award" size="small">
            <el-form-item label="申报编号"><el-input v-model="forms.award.applicationId" /></el-form-item>
            <el-form-item label="授予等级">
              <el-select v-model="forms.award.level">
                <el-option label="一等奖" value="一等奖" />
                <el-option label="二等奖" value="二等奖" />
                <el-option label="三等奖" value="三等奖" />
              </el-select>
            </el-form-item>
            <el-button type="success" @click="handleUpdateAward">授予等级 (自动流转待公示)</el-button>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <!-- 活动模块：触发 trig_报名自动填时间 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>活动模块 - 报名</template>
          <el-form :model="forms.activity" size="small">
            <el-form-item label="学工号"><el-input v-model="forms.activity.studentId" /></el-form-item>
            <el-form-item label="活动编号"><el-input v-model="forms.activity.activityId" /></el-form-item>
            <el-button type="primary" @click="handleInsertActivity">活动报名 (服务器时间自动补全)</el-button>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { 
  insertUser, updateTaskStatus, payClassFee, auditExpense, 
  insertDisciplineRecord, updateAwardLevel, insertActivityRegistration 
} from '@/api/triggers';
import { ElMessage } from 'element-plus';

const forms = reactive({
  user: { studentId: 'S_TEST01', name: '李测试', className: '软件工程1班' },
  task: { taskId: 'TASK_001', status: '待验收' },
  classFee: { detailId: 'FEE_DET_001' },
  expense: { expenseId: 'EXP_001', status: '初审通过', auditorId: 'T001' },
  discipline: { studentId: 'S001', recordType: '考勤', attendanceStatus: '旷课', leaveId: '' },
  award: { applicationId: 'APP_001', level: '一等奖' },
  activity: { studentId: 'S001', activityId: 'ACT_001' }
});

const handleInsertUser = async () => {
  const res = await insertUser(forms.user);
  ElMessage.success(res.message);
};

const handleUpdateTaskStatus = async () => {
  // 如果任务已经是'验收通过'，会被 trg_before_task_update 拒绝
  const res = await updateTaskStatus(forms.task.taskId, forms.task.status);
  ElMessage.success(res.message);
};

const handlePayClassFee = async () => {
  const res = await payClassFee(forms.classFee.detailId);
  ElMessage.success(res.message);
};

const handleAuditExpense = async () => {
  const res = await auditExpense(forms.expense.expenseId, forms.expense.status, forms.expense.auditorId);
  ElMessage.success(res.message);
};

const handleInsertDiscipline = async () => {
  const res = await insertDisciplineRecord({ ...forms.discipline, recorderId: 'T001' });
  ElMessage.success(res.message);
};

const handleUpdateAward = async () => {
  const res = await updateAwardLevel(forms.award.applicationId, forms.award.level);
  ElMessage.success(res.message);
};

const handleInsertActivity = async () => {
  const res = await insertActivityRegistration(forms.activity);
  ElMessage.success(res.message);
};
</script>

<style scoped>
.triggers-dashboard { padding: 20px; }
</style>
