<template>
  <div class="view-container">
    <!-- 搜索与控制栏 -->
    <div class="toolbar">
      <el-input
        v-model="queryParams.keyword"
        placeholder="搜索支出事由或申请人..."
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="expenseId" label="支出编号" width="120" />
      <el-table-column prop="applicantName" label="申请人" width="100" />
      <el-table-column prop="reason" label="支出事由" show-overflow-tooltip />
      <el-table-column prop="amount" label="金额(元)" width="120" align="right">
        <template #default="scope">
          <span style="color: #f56c6c; font-weight: bold;">-¥{{ scope.row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="applyDate" label="申请日期" width="120">
        <template #default="scope">
          {{ new Date(scope.row.applyDate).toLocaleDateString() }}
        </template>
      </el-table-column>
      <el-table-column prop="payDate" label="支付日期" width="120">
        <template #default="scope">
          {{ new Date(scope.row.payDate).toLocaleDateString() }}
        </template>
      </el-table-column>
      <el-table-column prop="firstReviewerName" label="初审人" width="100" />
      <el-table-column prop="finalReviewerName" label="终审人" width="100" />
      <el-table-column prop="publicStatus" label="公示状态" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.publicStatus === '已公示' ? 'success' : 'info'">
            {{ scope.row.publicStatus || '未公示' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getClassFeeExpenses } from '@/api/views';

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getClassFeeExpenses(queryParams);
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.view-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
.search-input {
  width: 300px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
