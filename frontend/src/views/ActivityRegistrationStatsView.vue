<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索活动名称..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="activityId" label="活动编号" width="120" />
      <el-table-column prop="activityName" label="活动名称" show-overflow-tooltip />
      <el-table-column prop="limitCount" label="人数限制" width="120" />
      <el-table-column prop="regCount" label="实际报名人数" width="150">
        <template #default="scope">
          <span :style="{ color: scope.row.regCount >= scope.row.limitCount ? '#e6a23c' : '#333' }">{{ scope.row.regCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="attendCount" label="实际到场人数" width="150" />
      <el-table-column label="出勤率" width="120">
        <template #default="scope">
          <el-progress 
            :percentage="scope.row.regCount === 0 ? 0 : Math.round((scope.row.attendCount / scope.row.regCount) * 100)" 
            :color="customColors" 
          />
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total" layout="total, prev, pager, next" @current-change="fetchData" />
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getActivityRegistrationStats } from '@/api/views';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });
const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getActivityRegistrationStats(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
