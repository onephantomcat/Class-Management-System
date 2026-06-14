<template>
  <div class="approval-center-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">审批大厅 (请假与综合事务)</span>
          <el-button type="primary" :icon="Plus" @click="openLeaveModal">
            发起请假申请
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="fetchData">
        <el-tab-pane label="我发起的申请" name="my">
          <el-table :data="myRequests" v-loading="loading" border stripe>
            <el-table-column prop="审批类型" label="类型" width="120" />
            <el-table-column prop="申请内容" label="申请事由" min-width="200" />
            <el-table-column prop="请假起止时间" label="关联时间/请假段" width="200">
              <template #default="scope">
                {{ scope.row.请假起止时间 || '无 (非请假类)' }}
              </template>
            </el-table-column>
            <el-table-column prop="申请时间" label="提交时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.申请时间) }}
              </template>
            </el-table-column>
            <el-table-column prop="当前审批节点" label="当前节点" width="120" />
            <el-table-column prop="审批状态" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.审批状态)">{{ scope.row.审批状态 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="审核意见" label="审批意见" width="150" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我的待办审批" name="pending" v-if="userStore.roleCode === 1 || userStore.roleCode === 2">
          <el-table :data="pendingApprovals" v-loading="loading" border stripe>
            <el-table-column prop="申请人姓名" label="申请人" width="100" />
            <el-table-column prop="审批类型" label="类型" width="120" />
            <el-table-column prop="申请内容" label="申请事由" min-width="200" />
            <el-table-column prop="请假起止时间" label="关联时间/请假段" width="200">
              <template #default="scope">
                {{ scope.row.请假起止时间 || '无 (非请假类)' }}
              </template>
            </el-table-column>
            <el-table-column prop="申请时间" label="提交时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.申请时间) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" type="success" @click="openAuditModal(scope.row, '通过')">同意</el-button>
                <el-button size="small" type="danger" @click="openAuditModal(scope.row, '驳回')">驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 发起请假弹窗 -->
    <el-dialog title="发起请假申请" v-model="leaveModalVisible" width="500px">
      <el-form :model="leaveForm" ref="leaveFormRef" label-width="100px">
        <el-form-item label="请假类型" required>
          <el-select v-model="leaveForm.leaveType" style="width: 100%">
            <el-option label="事假" value="事假" />
            <el-option label="病假" value="病假" />
            <el-option label="公假" value="公假" />
          </el-select>
        </el-form-item>
        <el-form-item label="起止日期" required>
          <el-date-picker 
            v-model="leaveForm.timeRangeArr" 
            type="daterange" 
            range-separator="至" 
            start-placeholder="开始日期" 
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="请假时长(天)" required>
          <el-input-number v-model="leaveForm.duration" :min="0.5" :step="0.5" />
        </el-form-item>
        <el-form-item label="请假事由" required>
          <el-input v-model="leaveForm.reason" type="textarea" placeholder="详细说明请假原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="leaveModalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLeave">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- 审批处理弹窗 -->
    <el-dialog :title="auditAction === '通过' ? '同意申请' : '驳回申请'" v-model="auditModalVisible" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-input v-model="auditForm.comment" type="textarea" placeholder="选填审批意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditModalVisible = false">取消</el-button>
        <el-button :type="auditAction === '通过' ? 'success' : 'danger'" @click="submitAudit">确认{{ auditAction }}</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import axios from '@/utils/request';
import { useUserStore } from '@/store/user';
import dayjs from 'dayjs';

const userStore = useUserStore();
const activeTab = ref('my');
const myRequests = ref([]);
const pendingApprovals = ref([]);
const loading = ref(false);

const leaveModalVisible = ref(false);
const leaveForm = ref({});

const auditModalVisible = ref(false);
const auditForm = ref({});
const currentApprovalId = ref('');
const auditAction = ref('');

const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-';
const getStatusTagType = (status) => {
  const map = { '待审批': 'warning', '已通过': 'success', '已驳回': 'danger' };
  return map[status] || 'info';
};

const fetchData = async () => {
  try {
    loading.value = true;
    if (activeTab.value === 'my') {
      const res = await axios.get('/api/approvals/my-requests', { params: { userId: userStore.studentId } });
      myRequests.value = res;
    } else if (activeTab.value === 'pending') {
      const res = await axios.get('/api/approvals/pending', { params: { role: userStore.roleCode } });
      pendingApprovals.value = res;
    }
  } catch (error) {
    ElMessage.error('加载审批数据失败');
  } finally {
    loading.value = false;
  }
};

const openLeaveModal = () => {
  leaveForm.value = { leaveType: '事假', timeRangeArr: [], duration: 1, reason: '' };
  leaveModalVisible.value = true;
};

const submitLeave = async () => {
  try {
    const rangeStr = leaveForm.value.timeRangeArr ? leaveForm.value.timeRangeArr.join(' ~ ') : '';
    await axios.post('/api/approvals/leave', {
      studentId: userStore.studentId,
      leaveType: leaveForm.value.leaveType,
      timeRange: rangeStr,
      duration: leaveForm.value.duration,
      reason: leaveForm.value.reason
    });
    ElMessage.success('申请提交成功');
    leaveModalVisible.value = false;
    if (activeTab.value === 'my') fetchData();
  } catch (e) {
    ElMessage.error('申请提交失败');
  }
};

const openAuditModal = (row, action) => {
  currentApprovalId.value = row.审批编号;
  auditAction.value = action;
  auditForm.value = { comment: action === '通过' ? '同意' : '不同意' };
  auditModalVisible.value = true;
};

const submitAudit = async () => {
  try {
    await axios.put(`/api/approvals/${currentApprovalId.value}/audit`, {
      auditorId: userStore.studentId,
      action: auditAction.value,
      comment: auditForm.value.comment
    });
    ElMessage.success('审批处理成功');
    auditModalVisible.value = false;
    fetchData();
  } catch (e) {
    ElMessage.error('审批处理失败');
  }
};

onMounted(() => fetchData());
</script>

<style scoped>
.approval-center-container { max-width: 1200px; margin: 0 auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 18px; font-weight: bold; }
</style>
