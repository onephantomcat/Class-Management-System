<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索班级或周次..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="className" label="所属班级" width="150" />
      <el-table-column prop="week" label="周次" width="120" />
      <el-table-column prop="normalCount" label="正常出勤" width="100" />
      <el-table-column prop="lateCount" label="迟到" width="80" />
      <el-table-column prop="earlyCount" label="早退" width="80" />
      <el-table-column prop="absentCount" label="旷课" width="80">
        <template #default="scope">
          <span :style="{ color: scope.row.absentCount > 0 ? '#f56c6c' : '#333' }">{{ scope.row.absentCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="leaveCount" label="请假" width="80" />
      <el-table-column prop="totalCount" label="总考勤次数" width="100" />
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total" layout="total, prev, pager, next" @current-change="fetchData" />
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getClassAttendanceStats } from '@/api/views';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getClassAttendanceStats(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
