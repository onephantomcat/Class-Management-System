<template>
  <div class="view-container">
    <!-- 搜索与控制栏 -->
    <div class="toolbar">
      <el-input
        v-model="queryParams.keyword"
        placeholder="搜索学生姓名、学号或班级..."
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
      <el-table-column prop="studentId" label="学工号" width="150" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="className" label="所属班级" width="180" />
      <el-table-column prop="semester" label="学期" width="150" />
      <el-table-column prop="gpa" label="平均绩点" width="120">
        <template #default="scope">
          <span :style="{ color: scope.row.gpa < 2.0 ? '#f56c6c' : '#67c23a', fontWeight: 'bold' }">
            {{ scope.row.gpa }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="failCount" label="挂科科目数" width="120" align="center" />
      <el-table-column prop="failFlag" label="挂科标记" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.failCount > 0 ? 'danger' : 'success'">
            {{ scope.row.failFlag || (scope.row.failCount > 0 ? '有挂科' : '无挂科') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="classRank" label="班级排名" width="100" align="center">
        <template #default="scope">
          <el-tag type="info" effect="dark" round>第 {{ scope.row.classRank }} 名</el-tag>
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
import { getStudentAcademics } from '@/api/views';

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

import { useUserStore } from '@/store/user';
const userStore = useUserStore();

const canSeeAllAcademics = userStore.roleCode === 1 || 
                           userStore.roleCode === 2 || 
                           (userStore.roleCode === 3 && (userStore.jobId.includes('学习') || userStore.jobId.includes('纪律')));

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  studentId: canSeeAllAcademics ? undefined : userStore.studentId
});

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getStudentAcademics(queryParams);
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
