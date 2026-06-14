<template>
  <div class="user-management-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">用户与权限管理</span>
          <div class="header-actions">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索学号/姓名/班级" 
              style="width: 250px; margin-right: 15px;" 
              clearable 
              @keyup.enter="fetchUsers"
              @clear="fetchUsers"
            >
              <template #append>
                <el-button :icon="Search" @click="fetchUsers" />
              </template>
            </el-input>
            <el-button type="primary" :icon="Plus" @click="openCreateModal">
              新增用户
            </el-button>
          </div>
        </div>
      </template>

      <!-- 用户列表表格 -->
      <el-table :data="userList" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="学工号" label="学工号" width="120" />
        <el-table-column prop="姓名" label="姓名" width="100" />
        <el-table-column prop="所属班级" label="所属班级" min-width="150" />
        <el-table-column prop="角色名称" label="系统角色" width="120">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.角色编码)">
              {{ scope.row.角色名称 || '未知角色' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="联系方式" label="联系方式" width="150" />
        <el-table-column prop="账号状态" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.账号状态 === '正常' ? 'success' : 'danger'">
              {{ scope.row.账号状态 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.创建时间) }}
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" type="primary" :icon="Edit" plain 
              @click="openEditModal(scope.row)"
              :disabled="userStore.roleCode >= scope.row.角色编码 && userStore.studentId !== scope.row.学工号"
            >
              编辑
            </el-button>
            <el-button 
              size="small" type="warning" :icon="Key" plain 
              @click="openResetPasswordModal(scope.row)"
              :disabled="userStore.roleCode >= scope.row.角色编码 && userStore.studentId !== scope.row.学工号"
            >
              密码
            </el-button>
            <el-button 
              size="small" 
              :type="scope.row.账号状态 === '正常' ? 'danger' : 'success'" 
              plain 
              @click="toggleStatus(scope.row)"
              :disabled="userStore.roleCode >= scope.row.角色编码 && userStore.studentId !== scope.row.学工号"
            >
              {{ scope.row.账号状态 === '正常' ? '冻结' : '解冻' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog :title="isEditing ? '编辑用户信息' : '新增用户'" v-model="formVisible" width="500px">
      <el-form :model="form" :rules="rules" ref="userFormRef" label-width="100px">
        <el-form-item label="学工号" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学工号" :disabled="isEditing" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="登录密码" prop="password" v-if="!isEditing">
          <el-input v-model="form.password" placeholder="不填则默认为123456" />
        </el-form-item>
        <el-form-item label="所属班级" prop="className">
          <el-input v-model="form.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="系统角色" prop="roleCode">
          <el-select v-model="form.roleCode" placeholder="请选择角色" style="width: 100%">
            <el-option label="班主任" value="1" />
            <el-option label="班长/团支书" value="2" />
            <el-option label="职能班委" value="3" />
            <el-option label="普通成员" value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号或其他联系方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Key } from '@element-plus/icons-vue';
import axios from '@/utils/request';
import dayjs from 'dayjs';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const searchKeyword = ref('');
const userList = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

const formVisible = ref(false);
const isEditing = ref(false);
const submitLoading = ref(false);
const userFormRef = ref(null);

const form = ref({
  studentId: '',
  name: '',
  password: '',
  className: '',
  roleCode: '4',
  phone: ''
});

const rules = {
  studentId: [{ required: true, message: '请输入学工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

const getRoleTagType = (roleCode) => {
  const map = { '1': 'danger', '2': 'warning', '3': 'primary', '4': 'info' };
  return map[roleCode] || 'info';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
};

const fetchUsers = async () => {
  try {
    loading.value = true;
    const res = await axios.get('/api/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        keyword: searchKeyword.value
      }
    });
    userList.value = res.items || [];
    totalCount.value = res.total || 0;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchUsers();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUsers();
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = { studentId: '', name: '', password: '', className: '', roleCode: '4', phone: '' };
  formVisible.value = true;
};

const openEditModal = (row) => {
  isEditing.value = true;
  form.value = {
    studentId: row.学工号,
    name: row.姓名,
    className: row.所属班级,
    roleCode: String(row.角色编码),
    phone: row.联系方式
  };
  formVisible.value = true;
};

const submitForm = async () => {
  if (!userFormRef.value) return;
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        if (isEditing.value) {
          await axios.put(`/api/users/${form.value.studentId}`, form.value);
          ElMessage.success('更新用户信息成功');
        } else {
          await axios.post('/api/users', form.value);
          ElMessage.success('新增用户成功');
        }
        formVisible.value = false;
        fetchUsers();
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '操作失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

const toggleStatus = async (row) => {
  const newStatus = row.账号状态 === '正常' ? '冻结' : '正常';
  const actionText = newStatus === '冻结' ? '冻结' : '解冻';
  
  try {
    await ElMessageBox.confirm(`确定要${actionText}该用户(${row.姓名})的账号吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await axios.put(`/api/users/${row.学工号}/status`, { status: newStatus });
    ElMessage.success(`用户已被${actionText}`);
    fetchUsers();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const openResetPasswordModal = async (row) => {
  try {
    const { value: newPassword } = await ElMessageBox.prompt(`为用户 ${row.姓名} 重置密码`, '重置密码', {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入新密码（不填默认为 123456）',
      inputType: 'password'
    });
    
    await axios.put(`/api/users/${row.学工号}/password`, { newPassword });
    ElMessage.success('重置密码成功！');
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('重置密码失败');
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-management-container {
  max-width: 1200px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
.header-actions {
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
