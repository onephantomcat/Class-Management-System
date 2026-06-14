<template>
  <div class="view-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>班级纪律处分统计报表</span>
        </div>
      </template>
      <div class="toolbar">
        <el-input v-model="className" placeholder="输入班级名称(例: 软件工程1班)" style="width: 250px" @keyup.enter="fetchData">
          <template #append><el-button icon="Search" @click="fetchData" /></template>
        </el-input>
      </div>
      <el-table :data="tableData" v-loading="loading" border style="width: 100%">
        <el-table-column prop="处分类型" label="处分类型">
          <template #default="scope">
            <el-tag type="danger">{{ scope.row.处分类型 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="涉及人数" label="涉及人数" />
        <el-table-column prop="占比百分比" label="班级占比(%)">
          <template #default="scope">
            <span style="color:#e6a23c;font-weight:bold;">{{ scope.row.占比百分比 }}%</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getPunishmentReport } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const tableData = ref([]);
const className = ref('软件工程1班');

const fetchData = async () => {
  if (!className.value) return ElMessage.warning('请输入班级名称');
  loading.value = true;
  try {
    const res = await getPunishmentReport({ className: className.value });
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
