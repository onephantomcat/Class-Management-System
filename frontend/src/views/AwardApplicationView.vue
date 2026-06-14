<template>
  <div class="view-container">
    <!-- 搜索与控制栏 -->
    <div class="toolbar">
      <el-input
        v-model="queryParams.keyword"
        placeholder="搜索项目名称或申请人..."
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
      <el-table-column prop="projectId" label="项目编号" width="120" />
      <el-table-column prop="projectName" label="项目名称" show-overflow-tooltip />
      <el-table-column prop="category" label="评选类别" width="150" />
      <el-table-column prop="applyId" label="申报编号" width="150" />
      <el-table-column prop="name" label="申请人姓名" width="120" />
      <el-table-column prop="className" label="所属班级" width="180" />
      <el-table-column prop="awardLevel" label="获奖等级" width="120">
        <template #default="scope">
          <el-tag
            :type="scope.row.awardLevel === '国家级' ? 'danger' : (scope.row.awardLevel === '校级' ? 'warning' : 'primary')"
            effect="dark"
          >
            {{ scope.row.awardLevel || '暂无' }}
          </el-tag>
        </template>
      </el-table-column>
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
import { getAwardApplications } from '@/api/views';

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
    const res = await getAwardApplications(queryParams);
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
