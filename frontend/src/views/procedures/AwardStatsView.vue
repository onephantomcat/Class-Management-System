<template>
  <div class="view-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>获奖人数统计</span>
        </div>
      </template>
      <div class="toolbar">
        <el-input v-model="projectId" placeholder="输入评优项目编号" style="width: 250px" @keyup.enter="fetchData">
          <template #append><el-button icon="Search" @click="fetchData" /></template>
        </el-input>
      </div>
      <el-table :data="tableData" v-loading="loading" border style="width: 100%">
        <el-table-column prop="项目名称" label="项目名称" />
        <el-table-column prop="获奖等级" label="获奖等级">
          <template #default="scope">
            <el-tag :type="scope.row.获奖等级 === '一等奖' ? 'danger' : 'success'">{{ scope.row.获奖等级 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="获奖人数" label="获奖人数">
          <template #default="scope">
            <span style="font-weight:bold; color:#1989fa">{{ scope.row.获奖人数 }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getAwardStats } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const tableData = ref([]);
const projectId = ref('');

const fetchData = async () => {
  if (!projectId.value) return ElMessage.warning('请输入项目编号');
  loading.value = true;
  try {
    const res = await getAwardStats({ projectId: projectId.value });
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
