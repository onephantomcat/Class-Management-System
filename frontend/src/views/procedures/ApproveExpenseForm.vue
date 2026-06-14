<template>
  <div class="form-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>审批班费支出申请</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="支出编号" prop="expenseId">
          <el-input v-model="form.expenseId" placeholder="请输入支出编号"></el-input>
        </el-form-item>
        <el-form-item label="审批人学工号" prop="auditorId">
          <el-input v-model="form.auditorId" placeholder="请输入审批人学工号"></el-input>
        </el-form-item>
        <el-form-item label="审批结果" prop="result">
          <el-select v-model="form.result" placeholder="请选择审批结果">
            <el-option label="初审通过" value="初审通过" />
            <el-option label="终审通过" value="终审通过" />
            <el-option label="拒绝" value="拒绝" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见" prop="opinion">
          <el-input type="textarea" v-model="form.opinion" placeholder="请输入审核意见"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">提交审批</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { approveExpense } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  expenseId: '',
  auditorId: '',
  result: '',
  opinion: ''
});

const rules = {
  expenseId: [{ required: true, message: '请输入支出编号', trigger: 'blur' }],
  auditorId: [{ required: true, message: '请输入审批人学工号', trigger: 'blur' }],
  result: [{ required: true, message: '请选择审批结果', trigger: 'change' }]
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await approveExpense(form);
        ElMessage.success('支出申请审批完成');
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
