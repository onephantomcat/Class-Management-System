<template>
  <div class="discipline-entry-container">
    <el-row :gutter="20">
      <!-- 左侧：纪律录入表单 -->
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>考勤与纪律登记 (厚数据库触发器演示)</span>
            </div>
          </template>
          <div style="margin-bottom: 15px; color: #909399; font-size: 13px;">
            <el-icon><InfoFilled /></el-icon>
            提示：当录入"旷课"或"迟到"时，如果同时填写了真实的请假审批编号，底层触发器 trig_attendance_check_leave 会自动将其修正为"请假"。任何异动都会被 trig_discipline_audit_log 记录留痕。
          </div>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="学生学工号" prop="studentId">
              <el-input v-model="form.studentId" placeholder="请输入学工号 (失去焦点获取历史纪律)" @blur="fetchDisciplineRecords"></el-input>
            </el-form-item>
            <el-form-item label="记录类型" prop="recordType">
              <el-radio-group v-model="form.recordType">
                <el-radio label="考勤">考勤登记</el-radio>
                <el-radio label="处分">纪律处分</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <template v-if="form.recordType === '考勤'">
              <el-form-item label="考勤状态" prop="attendanceStatus">
                <el-select v-model="form.attendanceStatus" placeholder="请选择考勤状态" style="width: 100%;">
                  <el-option label="正常" value="正常"></el-option>
                  <el-option label="迟到" value="迟到"></el-option>
                  <el-option label="早退" value="早退"></el-option>
                  <el-option label="旷课" value="旷课"></el-option>
                  <el-option label="请假" value="请假"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="请假审批单号" prop="leaveId">
                <el-input v-model="form.leaveId" placeholder="选填，测试请假豁免触发器机制填写"></el-input>
              </el-form-item>
            </template>
            
            <template v-if="form.recordType === '处分'">
              <el-form-item label="处分类型" prop="punishType">
                <el-select v-model="form.punishType" placeholder="请选择处分类型" style="width: 100%;">
                  <el-option label="警告" value="警告"></el-option>
                  <el-option label="严重警告" value="严重警告"></el-option>
                  <el-option label="记过" value="记过"></el-option>
                  <el-option label="留校察看" value="留校察看"></el-option>
                  <el-option label="开除学籍" value="开除学籍"></el-option>
                </el-select>
              </el-form-item>
            </template>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="submitForm">提交记录 (触发底层自动化)</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：个人纪律总览视图 -->
      <el-col :span="10">
        <el-card shadow="hover" class="discipline-sidebar">
          <template #header>
            <div class="card-header">
              <span>该生近期纪律档案 (实时视图)</span>
            </div>
          </template>
          <div v-if="records.length > 0" class="records-content">
            <div class="student-info" style="margin-bottom: 15px;">
              <el-tag size="large">{{ records[0].name }} ({{ records[0].studentId }}) - {{ records[0].className }}</el-tag>
            </div>
            <el-timeline>
              <el-timeline-item
                v-for="record in records"
                :key="record.recordId"
                :type="getTimelineType(record)"
                :timestamp="formatDate(record.recordTime)"
              >
                <div v-if="record.type === '考勤'">
                  考勤记录：
                  <el-tag :type="record.attendanceStatus === '正常' ? 'success' : (record.attendanceStatus === '请假' ? 'warning' : 'danger')" size="small">
                    {{ record.attendanceStatus }}
                  </el-tag>
                  <span v-if="record.leaveId" style="margin-left: 8px; font-size: 12px; color: #909399;">(关联单号: {{ record.leaveId }})</span>
                </div>
                <div v-else>
                  处分记录：<el-tag type="danger" size="small">{{ record.punishType }}</el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-empty v-else description="暂无该生纪律考勤记录，或学工号未输入" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { insertDisciplineRecord, getStudentDisciplinesOverview } from '@/api/triggers';
import { ElMessage } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';
import dayjs from 'dayjs';

const formRef = ref(null);
const loading = ref(false);
const records = ref([]);
const userStore = useUserStore();

const form = reactive({
  studentId: '',
  recordType: '考勤',
  attendanceStatus: '正常',
  punishType: '',
  leaveId: '',
  operatorId: userStore.studentId,
  operatorRole: userStore.roleCode,
  operatorJobId: userStore.jobId
});

const rules = {
  studentId: [{ required: true, message: '请输入学工号', trigger: 'blur' }]
};

const getTimelineType = (record) => {
  if (record.type === '处分') return 'danger';
  if (record.attendanceStatus === '正常') return 'success';
  if (record.attendanceStatus === '请假') return 'warning';
  return 'danger';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (form.recordType === '考勤' && !form.attendanceStatus) {
        ElMessage.error('请选择考勤状态');
        return;
      }
      if (form.recordType === '处分' && !form.punishType) {
        ElMessage.error('请选择处分类型');
        return;
      }
      loading.value = true;
      try {
        await insertDisciplineRecord(form);
        ElMessage.success('记录提交成功！触发器已执行');
        await fetchDisciplineRecords();
      } finally {
        loading.value = false;
      }
    }
  });
};

const fetchDisciplineRecords = async () => {
  if (!form.studentId) return;
  try {
    const res = await getStudentDisciplinesOverview(form.studentId);
    if (res && res.list && res.list.length > 0) {
      records.value = res.list;
    } else {
      records.value = [];
      ElMessage.info('未查到该生历史纪律档案');
    }
  } catch (err) {
    console.error('拉取纪律视图失败', err);
  }
};
</script>

<style scoped>
.discipline-entry-container { padding: 20px; }
.discipline-sidebar { height: 100%; min-height: 500px; }
.records-content { max-height: 400px; overflow-y: auto; padding-right: 10px; }
</style>
