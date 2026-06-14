<template>
  <div class="form-container">
    <el-card shadow="hover" class="box-card">
      <template #header>
        <div class="card-header">
          <span>新增班费收入并生成明细</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="收入日期" prop="incomeDate">
          <el-date-picker v-model="form.incomeDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="收入金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :step="10" />
        </el-form-item>
        <el-form-item label="收入类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="常规班费" value="常规班费" />
            <el-option label="活动赞助" value="活动赞助" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="缴费方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择缴费方式">
            <el-option label="微信转账" value="微信转账" />
            <el-option label="支付宝转账" value="支付宝转账" />
            <el-option label="现金" value="现金" />
          </el-select>
        </el-form-item>
        <el-form-item label="经手人学工号" prop="handlerId">
          <el-input v-model="form.handlerId" placeholder="请输入经手人学工号"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" placeholder="选填"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">提交生成明细</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { createIncome } from '@/api/procedures';
import { ElMessage, ElNotification } from 'element-plus';

const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  incomeDate: '',
  amount: 0,
  type: '',
  paymentMethod: '',
  handlerId: '',
  remark: ''
});

const rules = {
  incomeDate: [{ required: true, message: '请选择收入日期', trigger: 'change' }],
  amount: [{ required: true, message: '请输入收入金额', trigger: 'blur' }],
  type: [{ required: true, message: '请选择收入类型', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择缴费方式', trigger: 'change' }],
  handlerId: [{ required: true, message: '请输入经手人学工号', trigger: 'blur' }]
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await createIncome(form);
        ElNotification({
          title: '成功',
          message: `收入创建成功！底层的OUT参数捕获到自动生成的编号: ${res.data.generatedId}`,
          type: 'success',
          duration: 0 // 手动关闭以引起注意
        });
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
