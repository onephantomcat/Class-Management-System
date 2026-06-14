<template>
  <div class="form-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>自动计算学生绩点与挂科数</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="学生学工号" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学工号"></el-input>
        </el-form-item>
        <el-form-item label="学期" prop="semester">
          <el-input v-model="form.semester" placeholder="例如: 2023-2024-1"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">执行计算并汇入总表</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { calculateGpa } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  studentId: '',
  semester: ''
});

const rules = {
  studentId: [{ required: true, message: '请输入学生学工号', trigger: 'blur' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }]
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await calculateGpa(form);
        ElMessage.success('计算成功！已将平均绩点与挂科数汇入总表');
        resetForm();
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = () => { if (formRef.value) formRef.value.resetFields(); };
</script>
<style scoped>
.form-container { padding: 20px; }
.box-card { max-width: 500px; margin: 0 auto; }
</style>
