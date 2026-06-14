<template>
  <div class="view-container">
    <!-- 搜索与控制栏 -->
    <div class="toolbar">
      <el-input
        v-model="queryParams.keyword"
        placeholder="搜索申请人姓名或审批类型..."
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
      <el-table-column prop="approvalId" label="审批编号" width="120" />
      <el-table-column prop="approvalType" label="审批类型" width="150" />
      <el-table-column prop="applicantId" label="申请人学工号" width="150" />
      <el-table-column prop="applicantName" label="申请人姓名" width="120" />
      <el-table-column prop="content" label="申请内容" show-overflow-tooltip />
      <el-table-column prop="applyTime" label="申请时间" width="180">
        <template #default="scope">
          {{ new Date(scope.row.applyTime).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="currentNode" label="当前审批节点" width="150">
        <template #default="scope">
          <el-tag type="warning">{{ scope.row.currentNode }}</el-tag>
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
import { getPendingApprovals } from '@/api/views';
import { ElMessage } from 'element-plus';

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
    const res = await getPendingApprovals(queryParams);
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
