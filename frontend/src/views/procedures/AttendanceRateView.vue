<template>
  <div class="view-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>学生个人学期出勤率统计</span>
        </div>
      </template>
      <div class="toolbar">
        <el-input v-model="studentId" placeholder="输入学工号" style="width: 200px; margin-right: 10px;" />
        <el-input v-model="semester" placeholder="输入学期(例: 2023-2024-1)" style="width: 200px" @keyup.enter="fetchData">
          <template #append><el-button icon="Search" @click="fetchData" /></template>
        </el-input>
      </div>
      <el-table :data="tableData" v-loading="loading" border style="width: 100%">
        <el-table-column prop="学生学工号" label="学生学工号" />
        <el-table-column prop="总考勤次数" label="总考勤次数" />
        <el-table-column prop="正常出勤次数" label="正常出勤次数" />
        <el-table-column label="出勤率百分比">
          <template #default="scope">
            <el-progress 
              :percentage="Number(scope.row.出勤率百分比)" 
              :color="scope.row.出勤率百分比 < 80 ? '#f56c6c' : '#5cb87a'" 
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getAttendanceRate } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const tableData = ref([]);
const studentId = ref('');
const semester = ref('2023-2024-1');

const fetchData = async () => {
  if (!studentId.value || !semester.value) return ElMessage.warning('请输入学工号与学期');
  loading.value = true;
  try {
    const res = await getAttendanceRate({ studentId: studentId.value, semester: semester.value });
    tableData.value = res.data;
  } finally {
    loading.value = false;
  }
};
</script>
<style scoped>
.view-container { padding: 20px; }
.box-card { max-width: 800px; margin: 0 auto; }
.toolbar { margin-bottom: 20px; display: flex; justify-content: flex-end; }
</style>
