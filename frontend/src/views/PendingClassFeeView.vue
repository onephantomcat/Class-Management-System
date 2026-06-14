<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索事由或申请人..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="expenseId" label="支出编号" width="120" />
      <el-table-column prop="applyDate" label="申请日期" width="120">
        <template #default="scope">{{ new Date(scope.row.applyDate).toLocaleDateString() }}</template>
      </el-table-column>
      <el-table-column prop="applicantName" label="申请人" width="120" />
      <el-table-column prop="reason" label="支出事由" show-overflow-tooltip />
      <el-table-column prop="amount" label="金额(元)" width="120" align="right">
        <template #default="scope">
          <span style="color:#e6a23c;font-weight:bold;">¥{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="审批状态" width="120">
        <template #default="scope">
          <el-tag type="warning">{{ scope.row.status }}</el-tag>
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
import { getPendingClassFees } from '@/api/views';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getPendingClassFees(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
