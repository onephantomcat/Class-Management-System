<template>
  <div class="score-entry-container">
    <el-row :gutter="20">
      <!-- 左侧：成绩录入表单 -->
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>学业成绩录入 (厚数据库触发器演示)</span>
            </div>
          </template>
          <div style="margin-bottom: 15px; color: #909399; font-size: 13px;">
            <el-icon><InfoFilled /></el-icon>
            提示：本表单仅提交原始分数。底层触发器 trig_after_score_insert 会接管计算。如果分数超过100，trig_before_score_update 会直接抛出异常拦截！
          </div>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="学生学工号" prop="studentId">
              <el-input v-model="form.studentId" placeholder="请输入学工号 (失去焦点获取实时GPA)" @blur="fetchCurrentGpa"></el-input>
            </el-form-item>
            <el-form-item label="学期" prop="semester">
              <el-input v-model="form.semester" placeholder="例如: 2023-2024-1"></el-input>
            </el-form-item>
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model="form.courseName" placeholder="选填，默认生成测试课"></el-input>
            </el-form-item>
            <el-form-item label="总评成绩" prop="score">
              <el-input-number v-model="form.score" :min="-10" :max="150" />
              <span style="margin-left: 10px; color: #f56c6c; font-size: 12px;">故意输入负数或>100测试45000报错</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="submitForm">录入成绩 (无需传GPA)</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：自动响应的个人学业总览侧边栏 -->
      <el-col :span="10">
        <el-card shadow="hover" class="gpa-sidebar" :class="{'is-failed': overviewData && overviewData.failFlag === '有挂科'}">
          <template #header>
            <div class="card-header">
              <span>当前绩点统计区 (实时响应)</span>
            </div>
          </template>
          <div v-if="overviewData" class="overview-content">
            <el-result 
              :icon="overviewData.failFlag === '无挂科' ? 'success' : 'error'"
              :title="overviewData.name + ' (' + overviewData.studentId + ')'"
              :sub-title="'所属班级：' + overviewData.className">
              <template #extra>
                <div class="gpa-display">
                  当前累计 GPA
                  <div class="gpa-value">{{ Number(overviewData.gpa).toFixed(2) }}</div>
                </div>
                <div style="margin-top:20px;">
                  <el-tag :type="overviewData.failFlag === '无挂科' ? 'success' : 'danger'" size="large">
                    状态: {{ overviewData.failFlag }}
                  </el-tag>
                </div>
              </template>
            </el-result>
          </div>
          <el-empty v-else description="在左侧输入学工号拉取最新画像" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { insertScore, getStudentAcademicsOverview } from '@/api/triggers';
import { ElMessage } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';

import { useUserStore } from '@/store/user';

const formRef = ref(null);
const loading = ref(false);
const overviewData = ref(null);
const userStore = useUserStore();

const form = reactive({
  studentId: '',
  semester: '2023-2024-1',
  courseName: '数据库原理系统测试',
  score: 85,
  operatorId: userStore.studentId,
  operatorRole: userStore.roleCode,
  operatorJobId: userStore.jobId
});

const rules = {
  studentId: [{ required: true, message: '请输入学工号', trigger: 'blur' }],
  score: [{ required: true, message: '请输入成绩', trigger: 'blur' }]
};

// ======================== 核心要求 ========================
// 1. 无需传递GPA字段提交
// 2. promise成功后立即链式拉取
// 3. 响应式瞬间刷新侧边栏
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // [核心1] 纯数据下发，不带公式
        await insertScore(form);
        ElMessage.success('成绩录入成功！底层已触发 sp_calc_student_gpa');
        
        // [核心2] 链式拉取重算后的视图数据
        await fetchCurrentGpa();
      } finally {
        loading.value = false;
      }
    }
  });
};

const fetchCurrentGpa = async () => {
  if (!form.studentId) return;
  try {
    // 拉取第二阶段由视图生成的统一接口数据
    const res = await getStudentAcademicsOverview(form.studentId);
    // [核心3] 瞬间响应渲染
    if (res && res.list && res.list.length > 0) {
      overviewData.value = res.list[0];
    } else {
      ElMessage.warning('未在总览视图中找到该生，可能是首次录入或学工号错误');
    }
  } catch (err) {
    console.error('拉取 GPA 视图失败', err);
  }
};
</script>

<style scoped>
.score-entry-container { padding: 20px; }
.gpa-sidebar { height: 100%; transition: all 0.3s; }
.gpa-sidebar.is-failed { border: 2px solid #f56c6c; background-color: #fef0f0; }
.gpa-display { text-align: center; margin-top: 10px; font-size: 16px; color: #606266; }
.gpa-value { font-size: 48px; font-weight: bold; color: #409eff; line-height: 1.2; }
.is-failed .gpa-value { color: #f56c6c; }
</style>
