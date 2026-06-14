<template>
  <div class="task-center-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title">日常任务大厅</span>
          <el-button type="primary" :icon="Plus" @click="openPublishModal">
            发布新任务
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="fetchTasks">
        <el-tab-pane label="我负责的任务 (执行人)" name="executor">
          <el-table :data="tasks" v-loading="loading" border stripe>
            <el-table-column prop="任务内容" label="任务内容" min-width="200" />
            <el-table-column prop="发布人姓名" label="派发人" width="100" />
            <el-table-column prop="完成时限" label="截止日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.完成时限) }}
              </template>
            </el-table-column>
            <el-table-column prop="任务进度" label="当前进度" width="150">
              <template #default="scope">
                <el-progress :percentage="scope.row.任务进度" />
              </template>
            </el-table-column>
            <el-table-column prop="验收状态" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.验收状态)">{{ scope.row.验收状态 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.验收状态 === '待处理' || scope.row.验收状态 === '驳回'" 
                  size="small" type="primary" @click="openProgressModal(scope.row)">
                  更新进度
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="我派发的任务 (验收人)" name="publisher">
          <el-table :data="tasks" v-loading="loading" border stripe>
            <el-table-column prop="任务内容" label="任务内容" min-width="200" />
            <el-table-column prop="负责人姓名" label="执行人" width="100" />
            <el-table-column prop="完成时限" label="截止日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.完成时限) }}
              </template>
            </el-table-column>
            <el-table-column prop="任务进度" label="当前进度" width="150">
              <template #default="scope">
                <el-progress :percentage="scope.row.任务进度" />
              </template>
            </el-table-column>
            <el-table-column prop="验收状态" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.验收状态)">{{ scope.row.验收状态 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.验收状态 === '待验收'" 
                  size="small" type="success" @click="openVerifyModal(scope.row)">
                  验收
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 发布新任务弹窗 -->
    <el-dialog title="发布新任务" v-model="publishModalVisible" width="500px">
      <el-form :model="publishForm" ref="publishFormRef" label-width="100px">
        <el-form-item label="任务内容" required>
          <el-input v-model="publishForm.content" type="textarea" />
        </el-form-item>
        <el-form-item label="任务类型" required>
          <el-select v-model="publishForm.taskType" style="width: 100%">
            <el-option label="日常事务" value="日常事务" />
            <el-option label="班级活动" value="班级活动" />
            <el-option label="卫生清扫" value="卫生清扫" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行人学号" required>
          <el-input v-model="publishForm.executorId" placeholder="输入学工号" />
        </el-form-item>
        <el-form-item label="完成时限" required>
          <el-date-picker v-model="publishForm.deadline" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="验收标准">
          <el-input v-model="publishForm.standard" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="publishModalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPublish">确认发布</el-button>
      </template>
    </el-dialog>

    <!-- 更新进度弹窗 -->
    <el-dialog title="更新任务进度" v-model="progressModalVisible" width="500px">
      <el-form :model="progressForm" label-width="100px">
        <el-form-item label="当前进度" required>
          <el-slider v-model="progressForm.progress" :step="10" show-stops />
        </el-form-item>
        <el-form-item label="完成成果说明" required>
          <el-input v-model="progressForm.result" type="textarea" placeholder="填写汇报内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressModalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">提交验收</el-button>
      </template>
    </el-dialog>

    <!-- 验收任务弹窗 -->
    <el-dialog title="验收任务" v-model="verifyModalVisible" width="500px">
      <el-form :model="verifyForm" label-width="100px">
        <el-form-item label="验收动作" required>
          <el-radio-group v-model="verifyForm.status">
            <el-radio label="已完结">通过并完结</el-radio>
            <el-radio label="驳回">打回重做</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收意见">
          <el-input v-model="verifyForm.comment" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyModalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">确认处理</el-button>
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
const activeTab = ref('executor');
const tasks = ref([]);
const loading = ref(false);

const publishModalVisible = ref(false);
const publishForm = ref({});

const progressModalVisible = ref(false);
const progressForm = ref({});
const currentTaskId = ref('');

const verifyModalVisible = ref(false);
const verifyForm = ref({});

const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-';
const getStatusTagType = (status) => {
  const map = { '待处理': 'info', '待验收': 'warning', '已完结': 'success', '驳回': 'danger' };
  return map[status] || 'info';
};

const fetchTasks = async () => {
  try {
    loading.value = true;
    const res = await axios.get('/api/tasks', {
      params: { userId: userStore.studentId, role: activeTab.value }
    });
    tasks.value = res;
  } catch (error) {
    ElMessage.error('加载任务失败');
  } finally {
    loading.value = false;
  }
};

const openPublishModal = () => {
  publishForm.value = { taskType: '日常事务', executorId: '', content: '', deadline: '', standard: '' };
  publishModalVisible.value = true;
};

const submitPublish = async () => {
  try {
    await axios.post('/api/tasks', {
      publisherId: userStore.studentId,
      ...publishForm.value
    });
    ElMessage.success('发布成功');
    publishModalVisible.value = false;
    if (activeTab.value === 'publisher') fetchTasks();
  } catch (e) {
    ElMessage.error('发布失败');
  }
};

const openProgressModal = (row) => {
  currentTaskId.value = row.任务编号;
  progressForm.value = { progress: row.任务进度 || 0, result: row.完成成果 || '' };
  progressModalVisible.value = true;
};

const submitProgress = async () => {
  try {
    await axios.put(`/api/tasks/${currentTaskId.value}/progress`, {
      executorId: userStore.studentId,
      ...progressForm.value
    });
    ElMessage.success('更新进度并提交验收成功');
    progressModalVisible.value = false;
    fetchTasks();
  } catch (e) {
    ElMessage.error('提交失败');
  }
};

const openVerifyModal = (row) => {
  currentTaskId.value = row.任务编号;
  verifyForm.value = { status: '已完结', comment: '' };
  verifyModalVisible.value = true;
};

const submitVerify = async () => {
  try {
    await axios.put(`/api/tasks/${currentTaskId.value}/verify`, {
      publisherId: userStore.studentId,
      ...verifyForm.value
    });
    ElMessage.success('验收处理成功');
    verifyModalVisible.value = false;
    fetchTasks();
  } catch (e) {
    ElMessage.error('处理失败');
  }
};

onMounted(() => fetchTasks());
</script>

<style scoped>
.task-center-container { max-width: 1200px; margin: 0 auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 18px; font-weight: bold; }
</style>
