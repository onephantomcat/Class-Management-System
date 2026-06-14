<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索经手人或备注..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="incomeId" label="收入编号" width="120" />
      <el-table-column prop="incomeDate" label="收入日期" width="120">
        <template #default="scope">{{ new Date(scope.row.incomeDate).toLocaleDateString() }}</template>
      </el-table-column>
      <el-table-column prop="amount" label="金额(元)" width="120" align="right">
        <template #default="scope">
          <span style="color:#67c23a;font-weight:bold;">+¥{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="收入类型" width="120" />
      <el-table-column prop="paymentMethod" label="缴费方式" width="120" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column prop="handlerName" label="经手人" width="100" />
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total" layout="total, prev, pager, next" @current-change="fetchData" />
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getClassFeeIncomes } from '@/api/views';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getClassFeeIncomes(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
