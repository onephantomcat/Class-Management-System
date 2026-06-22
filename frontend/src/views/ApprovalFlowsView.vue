<template>
  <div class="view-container">
    <div class="header">
      <h2>全局审批流程总表</h2>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索审批人、申请人、模块、内容等..."
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="approvalId" label="审批编号" width="180" show-overflow-tooltip />
      <el-table-column prop="businessId" label="关联业务编号" width="150" show-overflow-tooltip />
      <el-table-column prop="applicantId" label="申请人学工号" width="120" />
      <el-table-column prop="applicantName" label="申请人姓名" width="100" />
      <el-table-column prop="approvalType" label="审批类型" width="100" />
      <el-table-column prop="content" label="申请内容" show-overflow-tooltip min-width="150" />
      <el-table-column prop="currentNode" label="当前审批节点" width="120" />
      <el-table-column prop="reviewerName" label="审批人" width="100">
        <template #default="{ row }">
          {{ row.reviewerName || row.reviewerId || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="审批状态" width="100">
        <template #default="{ row }">
          <el-tag
            :type="
              row.status === '待审批' ? 'warning' :
              row.status === '已通过' ? 'success' :
              row.status === '已驳回' ? 'danger' : 'info'
            "
            size="small"
          >
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="applyTime" label="申请时间" width="160">
        <template #default="{ row }">
          {{ row.applyTime ? new Date(row.applyTime).toLocaleString() : '' }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getApprovalFlows } from '@/api/views';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchKeyword = ref('');

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getApprovalFlows({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    });
    tableData.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('获取审批流程失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchData();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
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
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
.search-bar {
  width: 300px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
