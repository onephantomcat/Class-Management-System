<template>
  <div class="form-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>发布日常任务</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="任务编号" prop="taskId">
          <el-input v-model="form.taskId" placeholder="请输入任务编号 (如 TASK_001)"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="form.taskType" placeholder="请选择任务类型">
            <el-option label="班级活动" value="班级活动" />
            <el-option label="信息收集" value="信息收集" />
            <el-option label="学习打卡" value="学习打卡" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务内容" prop="content">
          <el-input type="textarea" v-model="form.content" placeholder="请输入任务内容"></el-input>
        </el-form-item>
        <el-form-item label="完成时限" prop="deadline">
          <el-date-picker v-model="form.deadline" type="datetime" placeholder="选择截止时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="发布人学工号" prop="publisherId">
          <el-input v-model="form.publisherId" placeholder="请输入发布人学工号"></el-input>
        </el-form-item>
        <el-form-item label="负责人学工号" prop="managerId">
          <el-input v-model="form.managerId" placeholder="请输入负责人学工号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">发布任务</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { publishTask } from '@/api/procedures';
import { ElMessage } from 'element-plus';

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  taskId: '',
  taskType: '',
  content: '',
  deadline: '',
  publisherId: '',
  managerId: ''
});

const rules = {
  taskId: [{ required: true, message: '请输入任务编号', trigger: 'blur' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入任务内容', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择完成时限', trigger: 'change' }],
  publisherId: [{ required: true, message: '请输入发布人学工号', trigger: 'blur' }],
  managerId: [{ required: true, message: '请输入负责人学工号', trigger: 'blur' }]
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await publishTask(form);
        ElMessage.success('任务发布成功！进度初始化为 0% 且待验收');
        resetForm();
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
};
</script>
<style scoped>
.form-container { padding: 20px; }
.box-card { max-width: 600px; margin: 0 auto; }
</style>
