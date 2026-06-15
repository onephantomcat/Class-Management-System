<template>
  <div class="comprehensive-container">
    <!-- 左侧录入区 -->
    <div class="left-panel">
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <span>🏅 评优申报与活动报名台</span>
            <el-tag type="warning" effect="dark" size="small">实时并发管控</el-tag>
          </div>
        </template>
        
        <el-tabs v-model="activeTab" class="demo-tabs">
          <!-- 角色非班主任(Role 1)才显示申请表单 -->
          <el-tab-pane v-if="userStore.roleCode !== 1" label="🎈 活动报名" name="activity">
            <el-form :model="activityForm" :rules="activityRules" ref="activityFormRef" label-width="100px">
              <el-form-item label="选择活动" prop="activityId">
                <el-select v-model="activityForm.activityId" placeholder="请选择要报名的活动" style="width: 100%">
                  <el-option label="秋季班级团建活动 (名额: 3人)" value="TEST_ACT_01" />
                  <el-option label="考前学习经验分享会 (名额: 50人)" value="TEST_ACT_02" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="学工号" prop="studentId">
                <el-input v-model="activityForm.studentId" placeholder="请输入您的学工号 (如 S001)" />
              </el-form-item>

              <el-form-item label="联系方式" prop="contact">
                <el-input v-model="activityForm.contact" placeholder="请输入您的联系方式" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="submitActivity" :loading="activityLoading" style="width: 100%;">立即抢报</el-button>
              </el-form-item>
            </el-form>
            <el-alert
              title="提示：系统已在数据库底层植入触发器，活动名额满后将直接在数据库层实施拦截，防止超卖。"
              type="info"
              show-icon
              :closable="false"
              style="margin-top: 15px"
            />
          </el-tab-pane>

          <!-- 角色非班主任(Role 1)才显示申请表单 -->
          <el-tab-pane v-if="userStore.roleCode !== 1" label="🏆 评优申报" name="award">
            <el-form :model="awardForm" :rules="awardRules" ref="awardFormRef" label-width="100px">
              <el-form-item label="选择项目" prop="awardId">
                <el-select v-model="awardForm.awardId" placeholder="请选择评优项目" style="width: 100%">
                  <el-option label="2023-2024学年国家奖学金" value="TEST_AWARD_01" />
                  <el-option label="优秀班干部" value="TEST_AWARD_02" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="学工号" prop="studentId">
                <el-input v-model="awardForm.studentId" placeholder="请输入您的学工号 (如 S001)" />
              </el-form-item>

              <el-form-item label="姓名" prop="studentName">
                <el-input v-model="awardForm.studentName" placeholder="请输入您的姓名" />
              </el-form-item>

              <el-form-item label="申报材料" prop="material">
                <el-input type="textarea" :rows="3" v-model="awardForm.material" placeholder="简述申请理由..." />
              </el-form-item>

              <el-form-item>
                <el-button type="success" @click="submitAward" :loading="awardLoading" style="width: 100%;">提交申请</el-button>
              </el-form-item>
            </el-form>
            <el-alert
              title="一票否决：触发器会自动去『学业成绩明细表』和『纪律档案表』验证您的资格。若有挂科或处分记录，将立即阻断申请！"
              type="error"
              show-icon
              :closable="false"
              style="margin-top: 15px"
            />
          </el-tab-pane>

          <!-- 班主任专属：评优审批与定级 -->
          <el-tab-pane v-if="userStore.roleCode === 1 || userStore.roleCode === 2" label="✍️ 评优审批定级" name="audit">
            <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="100px">
              <el-form-item label="申报编号" prop="applicationId">
                <el-input v-model="auditForm.applicationId" placeholder="填写右侧待公示记录的编号" />
              </el-form-item>
              
              <el-form-item label="授予等级" prop="level">
                <el-select v-model="auditForm.level" placeholder="请选择最终授予的等级" style="width: 100%">
                  <el-option label="一等奖" value="一等奖" />
                  <el-option label="二等奖" value="二等奖" />
                  <el-option label="三等奖" value="三等奖" />
                  <el-option label="优秀奖" value="优秀奖" />
                  <el-option label="驳回/不予通过" value="未通过" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="warning" @click="submitAudit" :loading="auditLoading" style="width: 100%;">确认授予/定级</el-button>
              </el-form-item>
            </el-form>
            <el-alert
              title="底层操作提示：此操作将调用 updateAwardLevel API，直接触发底层 Trigger 将记录流转到『已公示』。"
              type="success"
              show-icon
              :closable="false"
              style="margin-top: 15px"
            />
          </el-tab-pane>

          <!-- 发布新活动 (班长、班主任、文体委员) -->
          <el-tab-pane v-if="canCreateActivity" label="📝 发布新活动" name="createActivity">
            <el-form :model="createActForm" :rules="createActRules" ref="createActFormRef" label-width="100px">
              <el-form-item label="活动名称" prop="activityName">
                <el-input v-model="createActForm.activityName" placeholder="请输入活动名称" />
              </el-form-item>
              <el-form-item label="活动类型" prop="activityType">
                <el-select v-model="createActForm.activityType" placeholder="选择类型" style="width: 100%">
                  <el-option label="班级团建" value="班级团建" />
                  <el-option label="学术讲座" value="学术讲座" />
                  <el-option label="文体竞赛" value="文体竞赛" />
                </el-select>
              </el-form-item>
              <el-form-item label="活动地点" prop="location">
                <el-input v-model="createActForm.location" placeholder="请输入活动地点" />
              </el-form-item>
              <el-form-item label="人数限制" prop="limitCount">
                <el-input-number v-model="createActForm.limitCount" :min="0" style="width: 100%" placeholder="0表示不限" />
              </el-form-item>
              <el-form-item label="经费预算" prop="budget">
                <el-input-number v-model="createActForm.budget" :min="0" :precision="2" style="width: 100%" placeholder="无预算则填0" />
              </el-form-item>
              <el-form-item label="活动时间" prop="activityDate">
                <el-date-picker v-model="createActForm.activityDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择时间" style="width: 100%" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitCreateActivity" :loading="createActLoading" style="width: 100%;">确认发布</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 右侧查询区 -->
    <div class="right-panel">
      <el-card class="view-card" v-if="activeTab === 'activity'">
        <template #header>
          <div class="card-header">
            <span>📊 活动报名实时大盘</span>
            <el-button type="primary" link @click="fetchActivityStats">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </template>
        
        <el-table :data="activityStats" stripe style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="activityName" label="活动名称" width="180" />
          <el-table-column prop="limitCount" label="限额" width="80" align="center">
            <template #default="{row}">
              <el-tag type="info">{{ row.limitCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="regCount" label="已报人数" width="100" align="center">
            <template #default="{row}">
              <el-tag :type="row.regCount >= row.limitCount ? 'danger' : 'success'">{{ row.regCount }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="进度条" min-width="150">
            <template #default="{row}">
              <el-progress 
                :percentage="row.limitCount > 0 ? parseFloat((row.regCount / row.limitCount * 100).toFixed(1)) : 0" 
                :status="row.regCount >= row.limitCount ? 'exception' : ''"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 只要是在评优或者审核Tab，就显示评优申报公示墙 -->
      <el-card class="view-card" v-if="activeTab === 'award' || activeTab === 'audit'">
        <template #header>
          <div class="card-header">
            <span>📜 评优申报公示墙</span>
            <el-button type="primary" link @click="fetchAwardApplications">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </template>
        
        <el-table :data="awardApplications" stripe style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="applyId" label="申报编号" width="160">
            <template #default="{row}">
              <span style="font-size: 12px; color: #909399;">{{ row.applyId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="projectName" label="申报项目" width="180" />
          <el-table-column prop="category" label="类别" width="100" />
          <el-table-column prop="awardLevel" label="获奖等级" width="120" />
          <el-table-column prop="publicStatus" label="状态" width="100">
            <template #default="{row}">
              <el-tag :type="row.publicStatus === '已公示' ? 'success' : 'warning'">{{ row.publicStatus }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';
import api from '@/utils/request';

const userStore = useUserStore();
const activeTab = ref(userStore.roleCode === 1 ? 'audit' : 'activity');

const activityFormRef = ref(null);
const activityForm = ref({
  activityId: '',
  studentId: userStore.studentId || '',
  contact: ''
});

const awardFormRef = ref(null);
const awardForm = ref({
  awardId: '',
  studentId: userStore.studentId || '',
  studentName: userStore.studentName || '',
  material: ''
});

const auditFormRef = ref(null);
const auditForm = ref({
  applicationId: '',
  level: ''
});

const canCreateActivity = computed(() => {
  return userStore.roleCode === 1 || userStore.roleCode === 2 || (userStore.roleCode === 3 && userStore.jobId && userStore.jobId.includes('文体'));
});

const createActFormRef = ref(null);
const createActForm = ref({
  activityName: '',
  activityType: '',
  location: '',
  limitCount: 0,
  activityDate: '',
  budget: 0
});

const activityRules = {
  activityId: [{ required: true, message: '请选择活动', trigger: 'change' }],
  studentId: [{ required: true, message: '请输入学工号', trigger: 'blur' }]
};

const awardRules = {
  awardId: [{ required: true, message: '请选择评优项目', trigger: 'change' }],
  studentId: [{ required: true, message: '请输入学工号', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

const auditRules = {
  applicationId: [{ required: true, message: '请输入申报编号', trigger: 'blur' }],
  level: [{ required: true, message: '请选择授予等级', trigger: 'change' }]
};

const createActRules = {
  activityName: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  activityType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入地点', trigger: 'blur' }],
  activityDate: [{ required: true, message: '请选择时间', trigger: 'change' }]
};

const activityLoading = ref(false);
const awardLoading = ref(false);
const auditLoading = ref(false);
const createActLoading = ref(false);
const tableLoading = ref(false);

const activityStats = ref([]);
const awardApplications = ref([]);

const fetchActivityStats = async () => {
  tableLoading.value = true;
  try {
    const res = await api.get('/api/views/activity-registration-stats');
    activityStats.value = res.list;
  } catch (error) {
    console.error('获取活动大盘失败', error);
  } finally {
    tableLoading.value = false;
  }
};

const fetchAwardApplications = async () => {
  tableLoading.value = true;
  try {
    const res = await api.get('/api/views/award-applications');
    awardApplications.value = res.list;
  } catch (error) {
    console.error('获取评优列表失败', error);
  } finally {
    tableLoading.value = false;
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'activity') {
    fetchActivityStats();
  } else {
    fetchAwardApplications();
  }
});

onMounted(() => {
  if (activeTab.value === 'activity') {
    fetchActivityStats();
  } else {
    fetchAwardApplications();
  }
});

const submitActivity = async () => {
  if (!activityFormRef.value) return;
  await activityFormRef.value.validate(async (valid) => {
    if (valid) {
      activityLoading.value = true;
      try {
        const payload = {
          ...activityForm.value,
          operatorRole: userStore.roleCode || 4
        };
        const res = await api.post('/api/triggers/activities/registrations', payload);
        ElMessage.success(res.message || '报名成功！');
        fetchActivityStats();
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '报名失败');
      } finally {
        activityLoading.value = false;
      }
    }
  });
};

const submitAward = async () => {
  if (!awardFormRef.value) return;
  await awardFormRef.value.validate(async (valid) => {
    if (valid) {
      awardLoading.value = true;
      try {
        const payload = {
          ...awardForm.value,
          operatorRole: userStore.roleCode || 4
        };
        const res = await api.post('/api/triggers/awards/applications', payload);
        ElMessage.success(res.message || '申请成功！');
        fetchAwardApplications();
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '申请失败');
      } finally {
        awardLoading.value = false;
      }
    }
  });
};

const submitAudit = async () => {
  if (!auditFormRef.value) return;
  await auditFormRef.value.validate(async (valid) => {
    if (valid) {
      auditLoading.value = true;
      try {
        const payload = { level: auditForm.value.level };
        const res = await api.put(`/api/triggers/awards/applications/${auditForm.value.applicationId}/level`, payload);
        ElMessage.success(res.message || '等级授予成功，记录已公示！');
        auditForm.value.applicationId = '';
        auditForm.value.level = '';
        fetchAwardApplications();
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '操作失败');
      } finally {
        auditLoading.value = false;
      }
    }
  });
};

const submitCreateActivity = async () => {
  if (!createActFormRef.value) return;
  await createActFormRef.value.validate(async (valid) => {
    if (valid) {
      createActLoading.value = true;
      try {
        const payload = {
          ...createActForm.value,
          studentId: userStore.studentId || 'SYSTEM',
          studentName: userStore.studentName || '系统用户'
        };
        const res = await api.post('/api/triggers/activities', payload);
        ElMessage.success(res.message || '活动发布成功！');
        createActFormRef.value.resetFields();
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '发布失败');
      } finally {
        createActLoading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.comprehensive-container {
  display: flex;
  gap: 20px;
  height: 100%;
}

.left-panel {
  flex: 0 0 400px;
}

.right-panel {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.form-card, .view-card {
  height: 100%;
}
</style>
