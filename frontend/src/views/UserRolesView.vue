<template>
  <div class="view-container">
    <div class="toolbar">
      <el-input v-model="queryParams.keyword" placeholder="搜索姓名或角色..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="staffId" label="学工号" width="150" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="className" label="所属班级" width="150" />
      <el-table-column prop="roleName" label="角色名称" width="150">
        <template #default="scope">
          <el-tag :type="scope.row.roleName === '管理员' ? 'danger' : 'primary'">{{ scope.row.roleName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contact" label="联系方式" show-overflow-tooltip />
      <el-table-column prop="status" label="账号状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'info'">{{ scope.row.status }}</el-tag>
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
import { getUserRoles } from '@/api/views';
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getUserRoles(queryParams);
    tableData.value = res.list; total.value = res.total;
  } finally { loading.value = false; }
};
const handleSearch = () => { queryParams.page = 1; fetchData(); };
onMounted(() => fetchData());
</script>
<style scoped>.view-container{padding:20px;background:#fff;border-radius:8px;}.toolbar{margin-bottom:20px;display:flex;justify-content:flex-end;}.search-input{width:300px;}.pagination{margin-top:20px;display:flex;justify-content:flex-end;}</style>
