<template>
  <div class="form-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>活动自动归档</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="活动编号" prop="activityId">
          <el-input v-model="form.activityId" placeholder="请输入活动编号"></el-input>
        </el-form-item>
        <el-form-item label="归档人学工号" prop="archiverId">
          <el-input v-model="form.archiverId" placeholder="请输入归档人学工号"></el-input>
        </el-form-item>
        <el-form-item label="总结内容" prop="summary">
          <el-input type="textarea" v-model="form.summary" placeholder="请输入活动总结与评估"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">确认归档</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { archiveActivity } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  activityId: '',
  archiverId: '',
  summary: ''
});

const rules = {
  activityId: [{ required: true, message: '请输入活动编号', trigger: 'blur' }],
  archiverId: [{ required: true, message: '请输入归档人学工号', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入总结内容', trigger: 'blur' }]
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await archiveActivity(form);
        ElMessage.success('活动归档成功！档案已被存入系统');
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
.box-card { max-width: 600px; margin: 0 auto; }
</style>
