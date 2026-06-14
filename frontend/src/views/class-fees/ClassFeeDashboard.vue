<template>
  <div class="class-fee-container">
    <el-row :gutter="20" class="top-row">
      <el-col :span="24">
        <el-card shadow="hover" class="balance-card">
          <div class="balance-content">
            <el-icon class="money-icon"><Money /></el-icon>
            <div class="balance-info">
              <div class="label">班费当前总资产 (元)</div>
              <div class="amount">¥ {{ balance.期末余额 || 0 }}</div>
            </div>
            <div class="balance-stats">
              <div class="stat-item"><span class="label">本期总收入:</span> <span class="val success">+{{ balance.本期收入 || 0 }}</span></div>
              <div class="stat-item"><span class="label">本期总支出:</span> <span class="val danger">-{{ balance.本期支出 || 0 }}</span></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">资金流转大盘</span>
          <div class="actions">
            <!-- 仅班长/生活委员(Role 2) 可发起收款 -->
            <el-button v-if="userStore.roleCode === 2" type="primary" :icon="Plus" @click="openIncomeModal">发起收款</el-button>
            <!-- 所有人皆可申请报销 -->
            <el-button type="success" :icon="Plus" @click="openExpenseModal">申请报销</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="fetchData">
        <!-- 账单中心：当前学生需要缴纳的费用 -->
        <el-tab-pane label="我的缴费账单" name="bills">
          <el-table :data="myBills" v-loading="loading" border stripe>
            <el-table-column prop="收入类型" label="收费项目" width="150" />
            <el-table-column prop="备注" label="说明" min-width="200" />
            <el-table-column prop="缴费金额" label="应缴金额 (元)" width="120" />
            <el-table-column prop="收入日期" label="发布时间" width="180">
              <template #default="scope">{{ formatDate(scope.row.收入日期) }}</template>
            </el-table-column>
            <el-table-column prop="缴费时间" label="支付时间" width="180">
              <template #default="scope">{{ formatDate(scope.row.缴费时间) }}</template>
            </el-table-column>
            <el-table-column prop="缴费状态" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.缴费状态 === '已缴费' ? 'success' : 'danger'">
                  {{ scope.row.缴费状态 }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.缴费状态 === '待缴费'" 
                  size="small" type="primary" @click="handlePay(scope.row.缴费明细ID)">
                  一键扫码支付
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 报销中心：我提交的报销 -->
        <el-tab-pane label="我提交的报销" name="my-expenses">
          <el-table :data="myExpenses" v-loading="loading" border stripe>
            <el-table-column prop="支出事由" label="报销事由" min-width="200" />
            <el-table-column prop="支出金额" label="报销金额 (元)" width="120" />
            <el-table-column prop="申请日期" label="申请日期" width="180">
              <template #default="scope">{{ formatDate(scope.row.申请日期) }}</template>
            </el-table-column>
            <el-table-column prop="支付日期" label="打款日期" width="180">
              <template #default="scope">{{ formatDate(scope.row.支付日期) }}</template>
            </el-table-column>
            <el-table-column prop="审批状态" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getExpenseTagType(scope.row.审批状态)">{{ scope.row.审批状态 }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 财务审批：班长/班主任 可见 -->
        <el-tab-pane label="财务报销审批" name="audits" v-if="userStore.roleCode === 1 || userStore.roleCode === 2">
          <el-table :data="allExpenses" v-loading="loading" border stripe>
            <el-table-column prop="申请人姓名" label="申请人" width="100" />
            <el-table-column prop="支出事由" label="报销事由" min-width="200" />
            <el-table-column prop="支出金额" label="报销金额 (元)" width="120" />
            <el-table-column prop="申请日期" label="申请日期" width="160">
              <template #default="scope">{{ formatDate(scope.row.申请日期) }}</template>
            </el-table-column>
            <el-table-column prop="审批状态" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getExpenseTagType(scope.row.审批状态)">{{ scope.row.审批状态 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button v-if="scope.row.审批状态 === '待审批'" size="small" type="success" @click="auditExpense(scope.row, '通过')">同意打款</el-button>
                <el-button v-if="scope.row.审批状态 === '待审批'" size="small" type="danger" @click="auditExpense(scope.row, '驳回')">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

      </el-tabs>
    </el-card>

    <!-- 发起收款弹窗 -->
    <el-dialog title="发起班费收取" v-model="incomeModalVisible" width="500px">
      <el-form :model="incomeForm" label-width="100px">
        <el-form-item label="收费项目" required>
          <el-input v-model="incomeForm.incomeType" placeholder="例如：2026秋季班费" />
        </el-form-item>
        <el-form-item label="每人金额(元)" required>
          <el-input-number v-model="incomeForm.amount" :min="1" />
        </el-form-item>
        <el-form-item label="收费说明">
          <el-input v-model="incomeForm.remark" type="textarea" placeholder="填写收费用途说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="incomeModalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitIncome">群发账单</el-button>
      </template>
    </el-dialog>

    <!-- 申请报销弹窗 -->
    <el-dialog title="申请班费报销" v-model="expenseModalVisible" width="500px">
      <el-form :model="expenseForm" label-width="100px">
        <el-form-item label="报销事由" required>
          <el-input v-model="expenseForm.reason" type="textarea" placeholder="填写垫资购买的物品或用途" />
        </el-form-item>
        <el-form-item label="报销金额(元)" required>
          <el-input-number v-model="expenseForm.amount" :min="1" />
        </el-form-item>
        <el-form-item label="票据证明">
          <el-input v-model="expenseForm.proof" placeholder="发票编号或网购订单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="expenseModalVisible = false">取消</el-button>
        <el-button type="success" @click="submitExpense">提交报销</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Money } from '@element-plus/icons-vue';
import axios from '@/utils/request';
import { useUserStore } from '@/store/user';
import dayjs from 'dayjs';

const userStore = useUserStore();
const activeTab = ref('bills');
const loading = ref(false);

const balance = ref({});
const myBills = ref([]);
const myExpenses = ref([]);
const allExpenses = ref([]);

const incomeModalVisible = ref(false);
const incomeForm = ref({});

const expenseModalVisible = ref(false);
const expenseForm = ref({});

const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-';
const getExpenseTagType = (status) => {
  const map = { '待审批': 'warning', '已报销': 'success', '已驳回': 'danger' };
  return map[status] || 'info';
};

const fetchBalance = async () => {
  try {
    const res = await axios.get('/api/class-fees/balance');
    balance.value = res;
  } catch (e) { console.error('加载余额失败', e); }
};

const fetchData = async () => {
  loading.value = true;
  await fetchBalance();
  try {
    if (activeTab.value === 'bills') {
      const res = await axios.get('/api/class-fees/my-bills', { params: { userId: userStore.studentId } });
      myBills.value = res;
    } else if (activeTab.value === 'my-expenses') {
      const res = await axios.get('/api/class-fees/expenses', { params: { userId: userStore.studentId } });
      myExpenses.value = res;
    } else if (activeTab.value === 'audits') {
      const res = await axios.get('/api/class-fees/expenses');
      allExpenses.value = res;
    }
  } catch (e) {
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

const openIncomeModal = () => {
  incomeForm.value = { incomeType: '', amount: 50, remark: '' };
  incomeModalVisible.value = true;
};

const submitIncome = async () => {
  try {
    await axios.post('/api/class-fees/income', {
      operatorId: userStore.studentId,
      ...incomeForm.value
    });
    ElMessage.success('已成功为全班同学生成缴费账单！');
    incomeModalVisible.value = false;
    fetchData();
  } catch (e) {
    ElMessage.error('发起收款失败');
  }
};

const handlePay = async (detailId) => {
  try {
    await ElMessageBox.confirm('这只是模拟扫码支付环节，点击确认将模拟微信支付成功并入账', '模拟支付', { type: 'success' });
    await axios.put(`/api/class-fees/pay/${detailId}`);
    ElMessage.success('支付成功，已实时入账！');
    fetchData();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('支付失败');
  }
};

const openExpenseModal = () => {
  expenseForm.value = { reason: '', amount: 10, proof: '' };
  expenseModalVisible.value = true;
};

const submitExpense = async () => {
  try {
    await axios.post('/api/class-fees/expense', {
      applicantId: userStore.studentId,
      ...expenseForm.value
    });
    ElMessage.success('报销申请已提交，请等待审批');
    expenseModalVisible.value = false;
    activeTab.value = 'my-expenses';
    fetchData();
  } catch (e) {
    ElMessage.error('报销提交失败');
  }
};

const auditExpense = async (row, action) => {
  try {
    await axios.put(`/api/class-fees/expense/${row.支出编号}/audit`, {
      auditorId: userStore.studentId,
      action: action,
      comment: action === '通过' ? '同意报销，资金已划拨' : '事由不清，予以驳回'
    });
    ElMessage.success(`已${action}，财务台账已更新`);
    fetchData();
  } catch (e) {
    ElMessage.error('审批操作失败');
  }
};

onMounted(() => fetchData());
</script>

<style scoped>
.class-fee-container { max-width: 1200px; margin: 0 auto; }
.top-row { margin-bottom: 20px; }
.balance-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; }
.balance-content { display: flex; align-items: center; justify-content: space-between; padding: 10px; }
.money-icon { font-size: 60px; opacity: 0.8; }
.balance-info { flex: 1; margin-left: 20px; }
.balance-info .label { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
.balance-info .amount { font-size: 36px; font-weight: bold; }
.balance-stats { text-align: right; }
.stat-item { margin-bottom: 5px; font-size: 14px; }
.stat-item .label { opacity: 0.8; }
.stat-item .val { font-weight: bold; margin-left: 5px; }
.val.success { color: #67c23a; }
.val.danger { color: #f56c6c; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 18px; font-weight: bold; }
.actions { display: flex; gap: 10px; }
</style>
