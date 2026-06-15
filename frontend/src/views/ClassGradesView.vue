<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索课程或姓名..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="studentId" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="courseName" label="课程名称" width="150" />
      <el-table-column prop="teacher" label="任课教师" width="100" />
      <el-table-column prop="semester" label="学期" width="120" />
      <el-table-column prop="normalScore" label="平时成绩" width="100" />
      <el-table-column prop="examScore" label="考试成绩" width="100" />
      <el-table-column prop="finalScore" label="总评成绩" width="100">
        <template #default="scope">
          <span :style="{ color: scope.row.finalScore < 60 ? '#f56c6c' : '#333' }">{{ scope.row.finalScore }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="credit" label="绩点" width="80" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '及格' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" v-if="canModify">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleModify(scope.row)">申请修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total" layout="total, prev, pager, next" @current-change="fetchData" />
    </div>

    <!-- 成绩修改申请弹窗 -->
    <el-dialog v-model="dialogVisible" title="发起成绩修改申请" width="400px">
      <el-form :model="modifyForm" :rules="rules" ref="modifyFormRef" label-width="80px">
        <el-form-item label="学生姓名">
          <el-input :value="modifyForm.studentName" disabled />
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input :value="modifyForm.courseName" disabled />
        </el-form-item>
        <el-form-item label="当前成绩">
          <el-input :value="modifyForm.oldScore" disabled />
        </el-form-item>
        <el-form-item label="修改为" prop="newScore">
          <el-input-number v-model="modifyForm.newScore" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="修改原因" prop="reason">
          <el-input type="textarea" v-model="modifyForm.reason" placeholder="必填，请详细说明修改理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitModification" :loading="submitting">提交复核申请</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getClassGrades } from '@/api/views';
import { createGradeModificationRequest } from '@/api/approvals';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
// 只有班长、班主任或学习委员能发起修改
const canModify = ref(userStore.roleCode === 1 || userStore.roleCode === 2 || (userStore.roleCode === 3 && userStore.jobId.includes('学习')));

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });

// 对话框相关
const dialogVisible = ref(false);
const submitting = ref(false);
const modifyFormRef = ref(null);
const modifyForm = reactive({
  gradeId: '',
  studentName: '',
  courseName: '',
  oldScore: 0,
  newScore: 0,
  reason: ''
});

const rules = {
  newScore: [{ required: true, message: '请填写新成绩', trigger: 'blur' }],
  reason: [{ required: true, message: '请填写修改原因', trigger: 'blur' }]
};

const handleModify = (row) => {
  modifyForm.gradeId = row.gradeId; // 注意：由于视图里原先没有gradeId列，后端需要返回它。
  modifyForm.studentName = row.name;
  modifyForm.courseName = row.courseName;
  modifyForm.oldScore = row.finalScore;
  modifyForm.newScore = row.finalScore;
  modifyForm.reason = '';
  dialogVisible.value = true;
};

const submitModification = async () => {
  if (!modifyFormRef.value) return;
  await modifyFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        await createGradeModificationRequest({
          applicantId: userStore.studentId,
          ...modifyForm
        });
        ElMessage.success('申请提交成功，请等待班主任复核');
        dialogVisible.value = false;
      } catch (error) {
        ElMessage.error(error.message || '提交申请失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getClassGrades(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
