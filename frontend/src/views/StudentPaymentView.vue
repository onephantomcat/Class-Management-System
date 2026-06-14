<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索姓名或学号..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="studentId" label="学工号" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="className" label="所属班级" width="150" />
      <el-table-column prop="type" label="缴费类型" width="120" />
      <el-table-column prop="status" label="缴费状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '已缴费' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="应缴金额" width="100" />
      <el-table-column prop="paidAmount" label="已缴金额" width="100" />
      <el-table-column prop="debtAmount" label="欠费金额" width="100">
        <template #default="scope">
          <span :style="{ color: scope.row.debtAmount > 0 ? '#f56c6c' : '#333' }">{{ scope.row.debtAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="payTime" label="缴费时间" width="180">
        <template #default="scope">
          {{ scope.row.payTime ? new Date(scope.row.payTime).toLocaleString() : '-' }}
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
import { getStudentPayments } from '@/api/views';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getStudentPayments(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
