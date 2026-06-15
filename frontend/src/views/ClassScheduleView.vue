<template>
  <div class="view-container">
    <div class="toolbar">
      <el-button type="primary" icon="Plus" @click="handleAdd" v-if="canEdit">新增课程</el-button>
      <div style="flex: 1"></div>
      <el-input v-model="queryParams.keyword" placeholder="搜索课程/教师/班级..." clearable class="search-input" @keyup.enter="handleSearch">
        <template #append><el-button icon="Search" @click="handleSearch" /></template>
      </el-input>
    </div>

    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="课程名称" label="课程名称" width="180" />
      <el-table-column prop="任课教师" label="任课教师" width="120" />
      <el-table-column prop="所属班级" label="所属班级" width="150" />
      <el-table-column prop="上课时间" label="上课时间" width="200" />
      <el-table-column prop="上课地点" label="上课地点" width="150" />
      <el-table-column prop="学分" label="学分" width="80" />
      <el-table-column prop="学期" label="学期" width="120" />
      <el-table-column label="操作" width="150" v-if="canEdit">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该课程吗？" @confirm="handleDelete(scope.row)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination 
        v-model:current-page="queryParams.page" 
        v-model:page-size="queryParams.pageSize" 
        :total="total" 
        layout="total, prev, pager, next" 
        @current-change="fetchData" 
      />
    </div>

    <!-- 课程表单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '新增课程'" width="500px">
      <el-form :model="courseForm" :rules="rules" ref="courseFormRef" label-width="80px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="courseForm.courseName" />
        </el-form-item>
        <el-form-item label="任课教师" prop="teacher">
          <el-input v-model="courseForm.teacher" />
        </el-form-item>
        <el-form-item label="上课时间" prop="classTime">
          <el-input v-model="courseForm.classTime" placeholder="例如：周一 1-2节" />
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="courseForm.location" />
        </el-form-item>
        <el-form-item label="学分" prop="credit">
          <el-input-number v-model="courseForm.credit" :precision="1" :step="0.5" :min="0.5" />
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="courseForm.semester" placeholder="例如：2026-2027-1" />
        </el-form-item>
        <el-form-item label="所属班级" prop="className" v-if="!isEdit">
          <el-input v-model="courseForm.className" placeholder="默认：软件工程1班" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/api/courses';
import { useUserStore } from '@/store/user';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
// 只有班主任(1)、班长(2)和学习委员(3且jobId含学习)能编辑
const canEdit = ref(
  userStore.roleCode === 1 || 
  userStore.roleCode === 2 || 
  (userStore.roleCode === 3 && userStore.jobId.includes('学习'))
);

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const queryParams = reactive({ page: 1, pageSize: 10, keyword: '' });

const dialogVisible = ref(false);
const submitting = ref(false);
const isEdit = ref(false);
const courseFormRef = ref(null);
const currentId = ref('');

const courseForm = reactive({
  courseName: '',
  teacher: '',
  classTime: '',
  location: '',
  credit: 2.0,
  semester: '',
  className: '软件工程1班'
});

const rules = {
  courseName: [{ required: true, message: '必填项', trigger: 'blur' }],
  teacher: [{ required: true, message: '必填项', trigger: 'blur' }],
  semester: [{ required: true, message: '必填项', trigger: 'blur' }]
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getCourses(queryParams);
    tableData.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchData();
};

const resetForm = () => {
  if (courseFormRef.value) courseFormRef.value.resetFields();
  courseForm.courseName = '';
  courseForm.teacher = '';
  courseForm.classTime = '';
  courseForm.location = '';
  courseForm.credit = 2.0;
  courseForm.semester = '';
  courseForm.className = '软件工程1班';
};

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEdit.value = true;
  currentId.value = row['课程编号'];
  courseForm.courseName = row['课程名称'];
  courseForm.teacher = row['任课教师'];
  courseForm.classTime = row['上课时间'];
  courseForm.location = row['上课地点'];
  courseForm.credit = parseFloat(row['学分']);
  courseForm.semester = row['学期'];
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await deleteCourse(row['课程编号']);
    ElMessage.success('删除成功');
    fetchData();
  } catch (error) {
    ElMessage.error(error.message || '删除失败');
  }
};

const submitForm = async () => {
  if (!courseFormRef.value) return;
  await courseFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (isEdit.value) {
          await updateCourse(currentId.value, courseForm);
          ElMessage.success('修改成功');
        } else {
          await createCourse(courseForm);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        ElMessage.error(error.message || '操作失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.view-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
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
