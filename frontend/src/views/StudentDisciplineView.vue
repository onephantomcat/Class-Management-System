<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索姓名或记录类型..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="studentId" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="className" label="班级" width="120" />
      <el-table-column prop="type" label="记录类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === '表扬' ? 'success' : (scope.row.type === '处分' ? 'danger' : 'info')">{{ scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="attendanceStatus" label="考勤状态" width="120" />
      <el-table-column prop="punishType" label="处分类型" width="120" />
      <el-table-column prop="recorderName" label="记录人" width="100" />
      <el-table-column prop="recordTime" label="记录时间" width="180">
        <template #default="scope">{{ new Date(scope.row.recordTime).toLocaleString() }}</template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total" layout="total, prev, pager, next" @current-change="fetchData" />
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getStudentDisciplines } from '@/api/views';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getStudentDisciplines(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
