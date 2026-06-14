<template>
  <div class="view-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>班级平均绩点统计</span>
        </div>
      </template>
      <div class="toolbar">
        <el-input v-model="semester" placeholder="输入学期(例: 2023-2024-1)" style="width: 250px" @keyup.enter="fetchData">
          <template #append><el-button icon="Search" @click="fetchData" /></template>
        </el-input>
      </div>
      <el-table :data="tableData" v-loading="loading" border style="width: 100%">
        <el-table-column prop="所属班级" label="所属班级" />
        <el-table-column prop="学生人数" label="学生人数" />
        <el-table-column prop="班级平均绩点" label="平均绩点">
          <template #default="scope">
            <span style="font-weight:bold; color:#409eff">{{ Number(scope.row.班级平均绩点).toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getClassGpa } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const tableData = ref([]);
const semester = ref('2023-2024-1');

const fetchData = async () => {
  if (!semester.value) return ElMessage.warning('请输入学期');
  loading.value = true;
  try {
    const res = await getClassGpa({ semester: semester.value });
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
